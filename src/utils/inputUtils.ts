// Hooks
import { fetchTokenBalance } from "hooks/useTokenBalance";

// Types
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import Fuse from "fuse-sdk";
import {
  AmountSelectMode,
  AmountSelectUserAction,
} from "components/shared/AmountSelectNew/AmountSelectNew";

// Utils
import { createComptroller } from "utils/createComptroller";
import BigNumber from "bignumber.js";
import {
  checkHasApprovedEnough,
  createERC20Contract,
  isAssetETH,
  MAX_APPROVAL_AMOUNT,
} from "./tokenUtils";
import { createCTokenContract } from "./fuseUtils";
import { bigNumberToBN, BN } from "./bigUtils";
import {
  fetchGasForCall,
  testForCTokenErrorAndSend,
} from "components/pages/Fuse/Modals/PoolModal/AmountSelect";
import { handleGenericError } from "./errorHandling";

// Gets the max amount based on the input mode, asset, and balances
export const fetchMaxAmount = async (
  mode: AmountSelectMode,
  fuse: Fuse,
  address: string,
  asset: USDPricedFuseAsset,
  comptrollerAddress: string
) => {
  if (mode === AmountSelectMode.LEND) {
    const balance = await fetchTokenBalance(
      asset.underlyingToken,
      fuse.web3,
      address
    );

    return balance;
  }

  if (mode === AmountSelectMode.REPAY) {
    const balance = await fetchTokenBalance(
      asset.underlyingToken,
      fuse.web3,
      address
    );
    const debt = fuse.web3.utils.toBN(asset.borrowBalance);

    if (balance.gt(debt)) {
      return debt;
    } else {
      return balance;
    }
  }

  if (mode === AmountSelectMode.BORROW) {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const { 0: err, 1: maxBorrow } = await comptroller.methods
      .getMaxBorrow(address, asset.cToken)
      .call();

    if (err !== 0) {
      return fuse.web3.utils.toBN(
        new BigNumber(maxBorrow).multipliedBy(0.75).toFixed(0)
      );
    } else {
      throw new Error("Could not fetch your max borrow amount! Code: " + err);
    }
  }

  if (mode === AmountSelectMode.WITHDRAW) {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const { 0: err, 1: maxRedeem } = await comptroller.methods
      .getMaxRedeem(address, asset.cToken)
      .call();

    if (err !== 0) {
      return fuse.web3.utils.toBN(maxRedeem);
    } else {
      throw new Error("Could not fetch your max withdraw amount! Code: " + err);
    }
  }
};

export const onLendBorrowConfirm = async ({
  asset,
  borrowedAsset,
  fuse,
  address,
  lendAmount,
  borrowAmount,
  comptrollerAddress,
  setUserAction,
  toast,
}: {
  asset: USDPricedFuseAsset;
  borrowedAsset?: USDPricedFuseAsset;
  fuse: Fuse;
  address: string;
  lendAmount?: BigNumber;
  borrowAmount?: BigNumber;
  comptrollerAddress: string;
  setUserAction: (userAction: AmountSelectUserAction) => void;
  toast?: any;
}) => {
  try {
    setUserAction(AmountSelectUserAction.WAITING_FOR_TRANSACTIONS);

    const isETH = isAssetETH(asset.underlyingToken);

    // Create the cTokenContract
    const cToken = createCTokenContract({ asset, fuse });

    // If a user specified they want to lend
    if (lendAmount?.isGreaterThan(0)) {
      // If asset is ERC20, check for approval and/or approve.
      if (!isETH) {
        const token = createERC20Contract({
          fuse,
          tokenAddress: asset.underlyingToken,
        });

        // Check if User has approved their underlying ERC20 to be used in the CToken contract.
        const hasApprovedEnough = await checkHasApprovedEnough({
          fuse,
          token,
          userAddress: address,
          approveForAddress: cToken.options.address,
          approvedForAmount: lendAmount,
        });

        // If token isnt approved for this CToken yet, approve it for MAX_APPROVAL_AMOUNT
        if (!hasApprovedEnough) {
          setUserAction(AmountSelectUserAction.WAITING_FOR_LEND_APPROVAL);

          await token.methods
            .approve(cToken.options.address, MAX_APPROVAL_AMOUNT)
            .send({ from: address });
        }
      }

      // By default, we enable the asset as collateral.
      const comptroller = createComptroller(comptrollerAddress, fuse);

      // If we've already supplied this as collateral before, then we don't need to submit a new tx for this
      if (!asset.membership) {
        setUserAction(AmountSelectUserAction.WAITING_FOR_ENTER_MARKETS);
        // Don't await this, we don't care if it gets executed first!
        comptroller.methods
          .enterMarkets([asset.cToken])
          .send({ from: address });
      }

      setUserAction(AmountSelectUserAction.WAITING_FOR_LEND);

      // We have to handle constructing/sending the mint transaction differently if the asset is ETH or an ERC20.
      if (isETH) {
        const call = cToken.methods.mint(); //

        const _lendAmount = bigNumberToBN({
          bigNumber: lendAmount,
          web3: fuse.web3,
        });

        // If they are supplying their whole balance, we have to subtract an estimate of the gas cost.
        if (
          lendAmount.toString() === (await fuse.web3.eth.getBalance(address))
        ) {
          // Get the estimated gas for this call
          const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
            call,
            _lendAmount,
            fuse,
            address
          );

          // Send the call with fullAmount - estimatedGas
          await call.send({
            from: address,
            value: _lendAmount.sub(gasWEI),
            gasPrice,
            gas: estimatedGas,
          });
        } else {
          // Supplying a custom amount of ETH
          await call.send({
            from: address,
            value: lendAmount,
          });
        }
      } else {
        //  Supplying ERC20
        await testForCTokenErrorAndSend(
          cToken.methods.mint(lendAmount),
          address,
          "Cannot deposit this amount right now!"
        );
      }
    }

    // If we specified a borrow
    if (!borrowAmount?.isZero() && !borrowAmount?.isNaN() && borrowedAsset) {
      const borrowedCToken = createCTokenContract({
        asset: borrowedAsset,
        fuse,
      });

      setUserAction(AmountSelectUserAction.WAITING_FOR_BORROW);

      // Then initiate the borrow tx.
      await testForCTokenErrorAndSend(
        borrowedCToken!.methods.borrow(borrowAmount),
        address,
        "Cannot borrow this amount right now!"
      );
    }

    setUserAction(AmountSelectUserAction.NO_ACTION);
  } catch (e) {
    toast && handleGenericError(e, toast);
    setUserAction(AmountSelectUserAction.NO_ACTION);
  }
};

// Sends a TX to enable an asset as collateral ("Enter Markets")
export const enableAssetAsCollateral = ({
  comptrollerAddress,
  fuse,
  asset,
  address,
}: {
  comptrollerAddress: string;
  fuse: Fuse;
  asset: USDPricedFuseAsset;
  address: string;
}) => {};

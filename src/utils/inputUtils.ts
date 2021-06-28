// Hooks
import { fetchTokenBalance } from "hooks/useTokenBalance";

// Types
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import Fuse from "fuse-sdk";
import { AmountSelectMode } from "components/shared/AmountSelectNew/AmountSelectNew";

// Utils
import { createComptroller } from "utils/createComptroller";
import BigNumber from "bignumber.js";



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

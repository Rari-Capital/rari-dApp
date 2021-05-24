import { useState } from "react";
import { Row, Column, Center, useIsMobile } from "buttered-chakra";

import LogRocket from "logrocket";
import {
  Heading,
  Box,
  Button,
  Text,
  Image,
  Input,
  useToast,
  Switch,
  Tab,
  TabList,
  Tabs,
  Spinner,
} from "@chakra-ui/react";
import SmallWhiteCircle from "../../../../../static/small-white-circle.png";

import BigNumber from "bignumber.js";

import { UseQueryResult, useQuery, useQueryClient } from "react-query";

import { HashLoader } from "react-spinners";

import { useTranslation } from "react-i18next";
import { useRari } from "../../../../../context/RariContext";
import { fetchTokenBalance } from "../../../../../hooks/useTokenBalance";
import { BN, smallUsdFormatter } from "../../../../../utils/bigUtils";

import DashboardBox from "../../../../shared/DashboardBox";
import { ModalDivider } from "../../../../shared/Modal";

import { Mode } from ".";

import {
  ETH_TOKEN_DATA,
  useTokenData,
} from "../../../../../hooks/useTokenData";
import { useBorrowLimit } from "../../../../../hooks/useBorrowLimit";

import Fuse from "../../../../../fuse-sdk";
import { USDPricedFuseAsset } from "../../../../../utils/fetchFusePoolData";
import { createComptroller } from "../../../../../utils/createComptroller";
import { handleGenericError } from "../../../../../utils/errorHandling";
import { ComptrollerErrorCodes } from "../../FusePoolEditPage";
import { SwitchCSS } from "../../../../shared/SwitchCSS";

import {
  convertMantissaToAPR,
  convertMantissaToAPY,
} from "../../../../../utils/apyUtils";

enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

export enum CTokenErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  BAD_INPUT,
  COMPTROLLER_REJECTION,
  COMPTROLLER_CALCULATION_ERROR,
  INTEREST_RATE_MODEL_ERROR,
  INVALID_ACCOUNT_PAIR,
  INVALID_CLOSE_AMOUNT_REQUESTED,
  INVALID_COLLATERAL_FACTOR,
  MATH_ERROR,
  MARKET_NOT_FRESH,
  MARKET_NOT_LISTED,
  TOKEN_INSUFFICIENT_ALLOWANCE,
  TOKEN_INSUFFICIENT_BALANCE,
  TOKEN_INSUFFICIENT_CASH,
  TOKEN_TRANSFER_IN_FAILED,
  TOKEN_TRANSFER_OUT_FAILED,
  UTILIZATION_ABOVE_MAX,
}

export async function testForCTokenErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string
) {
  let response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string of a number.
  if (response[0] !== "0") {
    response = parseInt(response);

    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;

      let msg = ComptrollerErrorCodes[comptrollerResponse];

      if (msg === "BORROW_BELOW_MIN") {
        msg =
          "As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.";
      }

      // This is a comptroller error:
      err = new Error(failMessage + " Comptroller Error: " + msg);
    } else {
      // This is a standard token error:
      err = new Error(
        failMessage + " CToken Code: " + CTokenErrorCodes[response]
      );
    }

    LogRocket.captureException(err);
    throw err;
  }

  return txObject.send({ from: caller });
}

const fetchGasForCall = async (
  call: any,
  amountBN: BN,
  fuse: Fuse,
  address: string
) => {
  const estimatedGas = fuse.web3.utils.toBN(
    (
      (await call.estimateGas({
        from: address,
        // Cut amountBN in half in case it screws up the gas estimation by causing a fail in the event that it accounts for gasPrice > 0 which means there will not be enough ETH (after paying gas)
        value: amountBN.div(fuse.web3.utils.toBN(2)),
      })) *
      // 50% more gas for limit:
      1.5
    ).toFixed(0)
  );

  // Ex: 100 (in GWEI)
  const { standard } = await fetch("https://gasprice.poa.network").then((res) =>
    res.json()
  );

  const gasPrice = fuse.web3.utils.toBN(
    // @ts-ignore For some reason it's returning a string not a BN
    fuse.web3.utils.toWei(standard.toString(), "gwei")
  );

  const gasWEI = estimatedGas.mul(gasPrice);

  return { gasWEI, gasPrice, estimatedGas };
};

async function fetchMaxAmount(
  mode: Mode,
  fuse: Fuse,
  address: string,
  asset: USDPricedFuseAsset,
  comptrollerAddress: string
) {
  if (mode === Mode.SUPPLY) {
    const balance = await fetchTokenBalance(
      asset.underlyingToken,
      fuse.web3,
      address
    );

    return balance;
  }

  if (mode === Mode.REPAY) {
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

  if (mode === Mode.BORROW) {
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

  if (mode === Mode.WITHDRAW) {
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
}

const AmountSelect = ({
  onClose,
  assets,
  index,
  mode,
  setMode,

  comptrollerAddress,
}: {
  onClose: () => any;
  assets: USDPricedFuseAsset[];
  index: number;
  mode: Mode;
  setMode: (mode: Mode) => any;
  comptrollerAddress: string;
}) => {
  const asset = assets[index];

  const { address, fuse } = useRari();

  const toast = useToast();

  const queryClient = useQueryClient();

  const tokenData = useTokenData(asset.underlyingToken);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState("");

  const [amount, _setAmount] = useState<BigNumber | null>(
    () => new BigNumber(0)
  );

  const showEnableAsCollateral = !asset.membership && mode === Mode.SUPPLY;
  const [enableAsCollateral, setEnableAsCollateral] = useState(
    showEnableAsCollateral
  );

  const { t } = useTranslation();

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith("-")) {
      return;
    }

    _setUserEnteredAmount(newAmount);

    try {
      BigNumber.DEBUG = true;

      // Try to set the amount to BigNumber(newAmount):
      const bigAmount = new BigNumber(newAmount);
      _setAmount(bigAmount.multipliedBy(10 ** asset.underlyingDecimals));
    } catch (e) {
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(null);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const { data: amountIsValid } = useQuery(
    (amount?.toString() ?? "null") + " " + mode + " isValid",
    async () => {
      if (amount === null || amount.isZero()) {
        return false;
      }

      try {
        const max = await fetchMaxAmount(
          mode,
          fuse,
          address,
          asset,
          comptrollerAddress
        );

        return amount.lte(max!.toString());
      } catch (e) {
        handleGenericError(e, toast);
        return false;
      }
    }
  );

  let depositOrWithdrawAlert = null;

  if (amount === null || amount.isZero()) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = t("Enter a valid amount to supply.");
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = t("Enter a valid amount to borrow.");
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = t("Enter a valid amount to withdraw.");
    } else {
      depositOrWithdrawAlert = t("Enter a valid amount to repay.");
    }
  } else if (amountIsValid === undefined) {
    depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
      token: asset.underlyingSymbol,
    });
  } else if (!amountIsValid) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = t("You don't have enough {{token}}!", {
        token: asset.underlyingSymbol,
      });
    } else if (mode === Mode.REPAY) {
      depositOrWithdrawAlert = t(
        "You don't have enough {{token}} or are over-repaying!",
        {
          token: asset.underlyingSymbol,
        }
      );
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = t("You cannot withdraw this much!");
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = t("You cannot borrow this much!");
    }
  } else {
    depositOrWithdrawAlert = null;
  }

  const isMobile = useIsMobile();

  const length = depositOrWithdrawAlert?.length ?? 0;
  let depositOrWithdrawAlertFontSize;
  if (length < 40) {
    depositOrWithdrawAlertFontSize = !isMobile ? "xl" : "17px";
  } else if (length < 50) {
    depositOrWithdrawAlertFontSize = !isMobile ? "15px" : "11px";
  } else if (length < 60) {
    depositOrWithdrawAlertFontSize = !isMobile ? "14px" : "10px";
  }

  const onConfirm = async () => {
    try {
      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

      const isETH = asset.underlyingToken === ETH_TOKEN_DATA.address;
      const isRepayingMax =
        amount!.eq(asset.borrowBalance) && !isETH && mode === Mode.REPAY;

      isRepayingMax && console.log("Using max repay!");

      const max = new BigNumber(2).pow(256).minus(1).toFixed(0);

      const amountBN = fuse.web3.utils.toBN(amount!.toFixed(0));

      const cToken = new fuse.web3.eth.Contract(
        isETH
          ? JSON.parse(
              fuse.compoundContracts[
                "contracts/CEtherDelegate.sol:CEtherDelegate"
              ].abi
            )
          : JSON.parse(
              fuse.compoundContracts[
                "contracts/CErc20Delegate.sol:CErc20Delegate"
              ].abi
            ),
        asset.cToken
      );

      if (mode === Mode.SUPPLY || mode === Mode.REPAY) {
        if (!isETH) {
          const token = new fuse.web3.eth.Contract(
            JSON.parse(
              fuse.compoundContracts[
                "contracts/EIP20Interface.sol:EIP20Interface"
              ].abi
            ),
            asset.underlyingToken
          );

          const hasApprovedEnough = fuse.web3.utils
            .toBN(
              await token.methods
                .allowance(address, cToken.options.address)
                .call()
            )
            .gte(amountBN);

          if (!hasApprovedEnough) {
            await token.methods
              .approve(cToken.options.address, max)
              .send({ from: address });
          }

          LogRocket.track("Fuse-Approve");
        }

        if (mode === Mode.SUPPLY) {
          // If they want to enable as collateral now, enter the market:
          if (enableAsCollateral) {
            const comptroller = createComptroller(comptrollerAddress, fuse);
            // Don't await this, we don't care if it gets executed first!
            comptroller.methods
              .enterMarkets([asset.cToken])
              .send({ from: address });

            LogRocket.track("Fuse-ToggleCollateral");
          }

          if (isETH) {
            const call = cToken.methods.mint();

            if (
              // If they are supplying their whole balance:
              amountBN.toString() === (await fuse.web3.eth.getBalance(address))
            ) {
              // Subtract gas for max ETH

              const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
                call,
                amountBN,
                fuse,
                address
              );

              await call.send({
                from: address,
                value: amountBN.sub(gasWEI),

                gasPrice,
                gas: estimatedGas,
              });
            } else {
              await call.send({
                from: address,
                value: amountBN,
              });
            }
          } else {
            await testForCTokenErrorAndSend(
              cToken.methods.mint(amountBN),
              address,
              "Cannot deposit this amount right now!"
            );
          }

          LogRocket.track("Fuse-Supply");
        } else if (mode === Mode.REPAY) {
          if (isETH) {
            const call = cToken.methods.repayBorrow();

            if (
              // If they are repaying their whole balance:
              amountBN.toString() === (await fuse.web3.eth.getBalance(address))
            ) {
              // Subtract gas for max ETH

              const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
                call,
                amountBN,
                fuse,
                address
              );

              await call.send({
                from: address,
                value: amountBN.sub(gasWEI),

                gasPrice,
                gas: estimatedGas,
              });
            } else {
              await call.send({
                from: address,
                value: amountBN,
              });
            }
          } else {
            await testForCTokenErrorAndSend(
              cToken.methods.repayBorrow(isRepayingMax ? max : amountBN),
              address,
              "Cannot repay this amount right now!"
            );
          }

          LogRocket.track("Fuse-Repay");
        }
      } else if (mode === Mode.BORROW) {
        await testForCTokenErrorAndSend(
          cToken.methods.borrow(amountBN),
          address,
          "Cannot borrow this amount right now!"
        );

        LogRocket.track("Fuse-Borrow");
      } else if (mode === Mode.WITHDRAW) {
        await testForCTokenErrorAndSend(
          cToken.methods.redeemUnderlying(amountBN),
          address,
          "Cannot withdraw this amount right now!"
        );

        LogRocket.track("Fuse-Withdraw");
      }

      queryClient.refetchQueries();

      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some refetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onClose();
    } catch (e) {
      handleGenericError(e, toast);
      setUserAction(UserAction.NO_ACTION);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={showEnableAsCollateral ? "575px" : "500px"}
    >
      {userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
        <Column
          expand
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          p={4}
        >
          <HashLoader size={70} color={tokenData?.color ?? "#FFF"} loading />
          <Heading mt="30px" textAlign="center" size="md">
            {t("Check your wallet to submit the transactions")}
          </Heading>
          <Text fontSize="sm" mt="15px" textAlign="center">
            {t("Do not close this tab until you submit all transactions!")}
          </Text>
        </Column>
      ) : (
        <>
          <Row
            width="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            p={4}
            height="72px"
            flexShrink={0}
          >
            <Box height="35px" width="35px">
              <Image
                width="100%"
                height="100%"
                borderRadius="50%"
                src={
                  tokenData?.logoURL ??
                  "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
                }
                alt=""
              />
            </Box>

            <Heading fontSize="27px" ml={3}>
              {!isMobile && asset.underlyingName.length < 25
                ? asset.underlyingName
                : asset.underlyingSymbol}
            </Heading>
          </Row>

          <ModalDivider />

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            px={4}
            pb={4}
            pt={1}
            height="100%"
          >
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              width="100%"
            >
              <TabBar color={tokenData?.color} mode={mode} setMode={setMode} />

              <DashboardBox width="100%" height="70px">
                <Row
                  p={4}
                  mainAxisAlignment="space-between"
                  crossAxisAlignment="center"
                  expand
                >
                  <AmountInput
                    color={tokenData?.color ?? "#FFF"}
                    displayAmount={userEnteredAmount}
                    updateAmount={updateAmount}
                  />
                  <TokenNameAndMaxButton
                    comptrollerAddress={comptrollerAddress}
                    mode={mode}
                    logoURL={
                      tokenData?.logoURL ??
                      "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
                    }
                    asset={asset}
                    updateAmount={updateAmount}
                  />
                </Row>
              </DashboardBox>
            </Column>

            <StatsColumn
              amount={parseInt(amount?.toFixed(0) ?? "0") ?? 0}
              color={tokenData?.color ?? "#FFF"}
              assets={assets}
              index={index}
              mode={mode}
              enableAsCollateral={enableAsCollateral}
            />

            {showEnableAsCollateral ? (
              <DashboardBox p={4} width="100%" mt={4}>
                <Row
                  mainAxisAlignment="space-between"
                  crossAxisAlignment="center"
                  width="100%"
                >
                  <Text fontWeight="bold">{t("Enable As Collateral")}:</Text>
                  <SwitchCSS
                    symbol={asset.underlyingSymbol}
                    color={tokenData?.color}
                  />
                  <Switch
                    h="20px"
                    className={asset.underlyingSymbol + "-switch"}
                    isChecked={enableAsCollateral}
                    onChange={() => {
                      setEnableAsCollateral((past) => !past);
                    }}
                  />
                </Row>
              </DashboardBox>
            ) : null}

            <Button
              mt={4}
              fontWeight="bold"
              fontSize={
                depositOrWithdrawAlert ? depositOrWithdrawAlertFontSize : "2xl"
              }
              borderRadius="10px"
              width="100%"
              height="70px"
              bg={tokenData?.color ?? "#FFF"}
              color={tokenData?.overlayTextColor ?? "#000"}
              // If the size is small, this means the text is large and we don't want the font size scale animation.
              className={
                isMobile ||
                depositOrWithdrawAlertFontSize === "14px" ||
                depositOrWithdrawAlertFontSize === "15px"
                  ? "confirm-button-disable-font-size-scale"
                  : ""
              }
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
              onClick={onConfirm}
              isDisabled={!amountIsValid}
            >
              {depositOrWithdrawAlert ?? t("Confirm")}
            </Button>
          </Column>
        </>
      )}
    </Column>
  );
};

export default AmountSelect;

const TabBar = ({
  color,
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => any;
  color: string | null | undefined;
}) => {
  const isSupplySide = mode < 2;
  const { t } = useTranslation();

  // Woohoo okay so there's some pretty weird shit going on in this component.

  // The AmountSelect component gets passed a `mode` param which is a `Mode` enum. The `Mode` enum has 4 values (SUPPLY, WITHDRAW, BORROW, REPAY).
  // The `mode` param is used to determine what text gets rendered and what action to take on clicking the confirm button.

  // As part of our simple design for the modal, we only show 2 mode options in the tab bar at a time.

  // When the modal is triggered it is given a `defaultMode` (starting mode). This is passed in by the component which renders the modal.
  // - If the user starts off in SUPPLY or WITHDRAW, we only want show them the option to switch between SUPPLY and WITHDRAW.
  // - If the user starts off in BORROW or REPAY, we want to only show them the option to switch between BORROW and REPAY.

  // However since the tab list has only has 2 tabs under it. It accepts an `index` parameter which determines which tab to show as "selected". Since we only show 2 tabs, it can either be 0 or 1.
  // This means we can't just pass `mode` to `index` because `mode` could be 2 or 3 (for BORROW or REPAY respectively) which would be invalid.

  // To solve this, if the mode is BORROW or REPAY we pass the index as `mode - 2` which transforms the BORROW mode to 0 and the REPAY mode to 1.

  // However, we also need to do the opposite of that logic in `onChange`:
  // - If a user clicks a tab and the current mode is SUPPLY or WITHDRAW we just pass that index (0 or 1 respectively) to setMode.
  // - But if a user clicks on a tab and the current mode is BORROW or REPAY, we need to add 2 to the index of the tab so it's the right index in the `Mode` enum.
  //   - Otherwise whenver you clicked on a tab it would always set the mode to SUPPLY or BORROW when clicking the left or right button respectively.

  // Does that make sense? Everything I described above is basically a way to get around the tab component's understanding that it only has 2 tabs under it to make it fit into our 4 value enum setup.
  // Still confused? DM me on Twitter (@transmissions11) for help.

  return (
    <>
      <style>
        {`
            
            .chakra-tabs__tab {
              color: ${color ?? "#FFFFFF"} !important;

              border-bottom-width: 1px;
            }

            .chakra-tabs__tablist {
              border-bottom: 1px solid;
              border-color: #272727;
            }
            
        `}
      </style>
      <Box px={3} width="100%" mt={1} mb="-1px" zIndex={99999}>
        <Tabs
          isFitted
          width="100%"
          align="center"
          index={isSupplySide ? mode : mode - 2}
          onChange={(index: number) => {
            if (isSupplySide) {
              return setMode(index);
            } else {
              return setMode(index + 2);
            }
          }}
        >
          <TabList>
            {isSupplySide ? (
              <>
                <Tab fontWeight="bold" _active={{}} mb="-1px">
                  {t("Supply")}
                </Tab>
                <Tab fontWeight="bold" _active={{}} mb="-1px">
                  {t("Withdraw")}
                </Tab>
              </>
            ) : (
              <>
                <Tab fontWeight="bold" _active={{}} mb="-1px">
                  {t("Borrow")}
                </Tab>
                <Tab fontWeight="bold" _active={{}} mb="-1px">
                  {t("Repay")}
                </Tab>
              </>
            )}
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};

const StatsColumn = ({
  color,
  mode,
  assets,
  index,
  amount,
  enableAsCollateral,
}: {
  color: string;
  mode: Mode;
  assets: USDPricedFuseAsset[];
  index: number;
  amount: number;
  enableAsCollateral: boolean;
}) => {
  const { t } = useTranslation();

  const { rari, fuse } = useRari();

  const { data: updatedAssets }: UseQueryResult<USDPricedFuseAsset[]> =
    useQuery(
      mode + " " + index + " " + JSON.stringify(assets) + " " + amount,
      async () => {
        const ethPrice: number = fuse.web3.utils.fromWei(
          await rari.getEthUsdPriceBN()
        ) as any;

        const assetToBeUpdated = assets[index];

        const interestRateModel = await fuse.getInterestRateModel(
          assetToBeUpdated.cToken
        );

        let updatedAsset: USDPricedFuseAsset;
        if (mode === Mode.SUPPLY) {
          const supplyBalance =
            parseInt(assetToBeUpdated.supplyBalance as any) + amount;

          const totalSupply =
            parseInt(assetToBeUpdated.totalSupply as any) + amount;

          updatedAsset = {
            ...assetToBeUpdated,

            supplyBalance,
            supplyBalanceUSD:
              ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalSupply,
            supplyRatePerBlock: interestRateModel.getSupplyRate(
              fuse.web3.utils.toBN(
                totalSupply > 0
                  ? new BigNumber(assetToBeUpdated.totalBorrow)
                      .dividedBy(totalSupply.toString())
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.WITHDRAW) {
          const supplyBalance =
            parseInt(assetToBeUpdated.supplyBalance as any) - amount;

          const totalSupply =
            parseInt(assetToBeUpdated.totalSupply as any) - amount;

          updatedAsset = {
            ...assetToBeUpdated,

            supplyBalance,
            supplyBalanceUSD:
              ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalSupply,
            supplyRatePerBlock: interestRateModel.getSupplyRate(
              fuse.web3.utils.toBN(
                totalSupply > 0
                  ? new BigNumber(assetToBeUpdated.totalBorrow)
                      .dividedBy(totalSupply.toString())
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.BORROW) {
          const borrowBalance =
            parseInt(assetToBeUpdated.borrowBalance as any) + amount;

          const totalBorrow =
            parseInt(assetToBeUpdated.totalBorrow as any) + amount;

          updatedAsset = {
            ...assetToBeUpdated,

            borrowBalance,
            borrowBalanceUSD:
              ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalBorrow,
            borrowRatePerBlock: interestRateModel.getBorrowRate(
              fuse.web3.utils.toBN(
                assetToBeUpdated.totalSupply > 0
                  ? new BigNumber(totalBorrow.toString())
                      .dividedBy(assetToBeUpdated.totalSupply)
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.REPAY) {
          const borrowBalance =
            parseInt(assetToBeUpdated.borrowBalance as any) - amount;

          const totalBorrow =
            parseInt(assetToBeUpdated.totalBorrow as any) - amount;

          updatedAsset = {
            ...assetToBeUpdated,

            borrowBalance,
            borrowBalanceUSD:
              ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalBorrow,
            borrowRatePerBlock: interestRateModel.getBorrowRate(
              fuse.web3.utils.toBN(
                assetToBeUpdated.totalSupply > 0
                  ? new BigNumber(totalBorrow.toString())
                      .dividedBy(assetToBeUpdated.totalSupply)
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        }

        return assets.map((value, _index) => {
          if (_index === index) {
            return updatedAsset;
          } else {
            return value;
          }
        });
      }
    );

  const asset = assets[index];
  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  const borrowLimit = useBorrowLimit(assets);
  const updatedBorrowLimit = useBorrowLimit(
    updatedAssets ?? [],
    enableAsCollateral
      ? {
          ignoreIsEnabledCheckFor: asset.cToken,
        }
      : undefined
  );

  const isSupplyingOrWithdrawing =
    mode === Mode.SUPPLY || mode === Mode.WITHDRAW;

  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(
    updatedAsset?.supplyRatePerBlock ?? 0,
    365
  );
  const updatedBorrowAPR = convertMantissaToAPR(
    updatedAsset?.borrowRatePerBlock ?? 0
  );

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = isSupplyingOrWithdrawing
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  return (
    <DashboardBox width="100%" height="190px" mt={4}>
      {updatedAsset ? (
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          expand
          py={3}
          px={4}
          fontSize="lg"
        >
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color={color}
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Supply Balance")}:
            </Text>
            <Text
              fontWeight="bold"
              flexShrink={0}
              fontSize={isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {smallUsdFormatter(
                asset.supplyBalance / 10 ** asset.underlyingDecimals
              ).replace("$", "")}
              {isSupplyingOrWithdrawing ? (
                <>
                  {" → "}
                  {smallUsdFormatter(
                    updatedAsset!.supplyBalance /
                      10 ** updatedAsset!.underlyingDecimals
                  ).replace("$", "")}
                </>
              ) : null}{" "}
              {asset.underlyingSymbol}
            </Text>
          </Row>

          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {isSupplyingOrWithdrawing ? t("Supply APY") : t("Borrow APR")}:
            </Text>
            <Text
              fontWeight="bold"
              fontSize={updatedAPYDiffIsLarge ? "sm" : "lg"}
            >
              {isSupplyingOrWithdrawing
                ? supplyAPY.toFixed(2)
                : borrowAPR.toFixed(2)}
              %
              {updatedAPYDiffIsLarge ? (
                <>
                  {" → "}
                  {isSupplyingOrWithdrawing
                    ? updatedSupplyAPY.toFixed(2)
                    : updatedBorrowAPR.toFixed(2)}
                  %
                </>
              ) : null}
            </Text>
          </Row>

          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Borrow Limit")}:
            </Text>
            <Text
              fontWeight="bold"
              fontSize={isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {smallUsdFormatter(borrowLimit)}
              {isSupplyingOrWithdrawing ? (
                <>
                  {" → "} {smallUsdFormatter(updatedBorrowLimit)}
                </>
              ) : null}{" "}
            </Text>
          </Row>

          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
          >
            <Text fontWeight="bold">{t("Debt Balance")}:</Text>
            <Text
              fontWeight="bold"
              fontSize={!isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {smallUsdFormatter(asset.borrowBalanceUSD)}
              {!isSupplyingOrWithdrawing ? (
                <>
                  {" → "}
                  {smallUsdFormatter(updatedAsset.borrowBalanceUSD)}
                </>
              ) : null}
            </Text>
          </Row>
        </Column>
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </DashboardBox>
  );
};

const TokenNameAndMaxButton = ({
  updateAmount,
  logoURL,
  asset,
  mode,
  comptrollerAddress,
}: {
  logoURL: string;
  asset: USDPricedFuseAsset;
  mode: Mode;
  comptrollerAddress: string;
  updateAmount: (newAmount: string) => any;
}) => {
  const { fuse, address } = useRari();

  const toast = useToast();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);

    try {
      const maxBN = await fetchMaxAmount(
        mode,
        fuse,
        address,
        asset,
        comptrollerAddress
      );

      if (maxBN!.isNeg() || maxBN!.isZero()) {
        updateAmount("");
      } else {
        const str = new BigNumber(maxBN!.toString())
          .div(10 ** asset.underlyingDecimals)
          .toFixed(18)
          // Remove trailing zeroes
          .replace(/\.?0+$/, "");

        updateAmount(str);
      }

      setIsMaxLoading(false);
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const { t } = useTranslation();

  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      flexShrink={0}
    >
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <Box height="25px" width="25px" mb="2px" mr={2}>
          <Image
            width="100%"
            height="100%"
            borderRadius="50%"
            backgroundImage={`url(${SmallWhiteCircle})`}
            src={logoURL}
            alt=""
          />
        </Box>
        <Heading fontSize="24px" mr={2} flexShrink={0}>
          {asset.underlyingSymbol}
        </Heading>
      </Row>

      <Button
        ml={1}
        height="28px"
        width="58px"
        bg="transparent"
        border="2px"
        borderRadius="8px"
        borderColor="#272727"
        fontSize="sm"
        fontWeight="extrabold"
        _hover={{}}
        _active={{}}
        onClick={setToMax}
        isLoading={isMaxLoading}
      >
        {t("MAX")}
      </Button>
    </Row>
  );
};

const AmountInput = ({
  displayAmount,
  updateAmount,
  color,
}: {
  displayAmount: string;
  updateAmount: (symbol: string) => any;
  color: string;
}) => {
  return (
    <Input
      type="number"
      inputMode="decimal"
      fontSize="3xl"
      fontWeight="bold"
      variant="unstyled"
      _placeholder={{ color }}
      placeholder="0.0"
      value={displayAmount}
      color={color}
      onChange={(event) => updateAmount(event.target.value)}
      mr={4}
    />
  );
};

import React, { useState } from "react";
import { Row, Column } from "buttered-chakra";

import LogRocket from "logrocket";
import {
  Heading,
  Box,
  Button,
  Text,
  Image,
  Input,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import SmallWhiteCircle from "../../../../../static/small-white-circle.png";

import BigNumber from "bignumber.js";

import { QueryResult, useQuery, useQueryCache } from "react-query";

import { HashLoader } from "react-spinners";

import { useTranslation } from "react-i18next";
import { useRari } from "../../../../../context/RariContext";
import { fetchTokenBalance } from "../../../../../hooks/useTokenBalance";
import { smallUsdFormatter } from "../../../../../utils/bigUtils";

import DashboardBox from "../../../../shared/DashboardBox";
import { ModalDivider } from "../../../../shared/Modal";

import { Mode } from ".";
import { SettingsIcon } from "@chakra-ui/icons";

import {
  ETH_TOKEN_DATA,
  useTokenData,
} from "../../../../../hooks/useTokenData";
import { useBorrowLimit } from "../../../../../hooks/useBorrowLimit";

import Fuse from "../../../../../fuse-sdk";
import { USDPricedFuseAsset } from "../../../../../utils/fetchFusePoolData";

interface Props {
  onClose: () => any;
  assets: USDPricedFuseAsset[];
  index: number;
  mode: Mode;
  comptrollerAddress: string;
  openOptions: () => any;
}

enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

async function testForCompoundErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string
) {
  let response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
  if (response[0] !== "0") {
    throw new Error(failMessage + " Code: " + response);
  }

  return txObject.send({ from: caller });
}

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
    const comptroller = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
      ),
      comptrollerAddress
    );

    const { 0: err, 1: maxBorrow } = await comptroller.methods
      .getMaxBorrow(address, asset.cToken)
      .call();

    if (err !== 0) {
      return fuse.web3.utils.toBN(maxBorrow);
    } else {
      throw new Error("Could not fetch your max borrow amount! Code: " + err);
    }
  }

  if (mode === Mode.WITHDRAW) {
    const comptroller = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
      ),
      comptrollerAddress
    );

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
  openOptions,
  comptrollerAddress,
}: Props) => {
  const asset = assets[index];

  const { address, fuse } = useRari();

  const toast = useToast();

  const queryCache = useQueryCache();

  const tokenData = useTokenData(asset.underlyingToken);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState("");

  const [amount, _setAmount] = useState<BigNumber | null>(
    () => new BigNumber(0)
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
    (amount?.toString() ?? "null") + " isValid",
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
        toast({
          title: "Error!",
          description: e.toString(),
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });

        return false;
      }
    }
  );

  let depositOrWithdrawAlert;

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
      depositOrWithdrawAlert = t("You don't have enough {{token}}.", {
        token: asset.underlyingSymbol,
      });
    } else if (mode === Mode.REPAY) {
      depositOrWithdrawAlert = t(
        "You don't have enough {{token}} or are trying to over-repay!",
        {
          token: asset.underlyingSymbol,
        }
      );
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = t(
        "You cannot withdraw this much; try repaying some debt."
      );
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = t(
        "You cannot borrow this much; try supplying more collateral."
      );
    }
  } else {
    depositOrWithdrawAlert = t("Click confirm to continue!");
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
        }

        if (mode === Mode.SUPPLY) {
          await (isETH
            ? cToken.methods.mint().send({ from: address, value: amountBN })
            : testForCompoundErrorAndSend(
                cToken.methods.mint(amountBN),
                address,
                "Cannot deposit this amount right now!"
              ));
        } else {
          await (isETH
            ? cToken.methods
                .repayBorrow()
                .send({ from: address, value: amountBN })
            : testForCompoundErrorAndSend(
                cToken.methods.repayBorrow(isRepayingMax ? max : amountBN),
                address,
                "Cannot repay this amount right now!"
              ));
        }
      } else if (mode === Mode.BORROW) {
        await testForCompoundErrorAndSend(
          cToken.methods.borrow(amountBN),
          address,
          "Cannot borrow this amount right now!"
        );
      } else if (mode === Mode.WITHDRAW) {
        await testForCompoundErrorAndSend(
          cToken.methods.redeemUnderlying(amountBN),
          address,
          "Cannot withdraw this amount right now!"
        );
      }

      await queryCache.refetchQueries();
      onClose();
    } catch (e) {
      console.log(e);
      let message: string;

      if (e instanceof Error) {
        message = e.toString();
        LogRocket.captureException(e);
      } else {
        message = JSON.stringify(e);
        LogRocket.captureException(new Error(message));
      }

      toast({
        title: "Error!",
        description: message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });

      setUserAction(UserAction.NO_ACTION);
    }
  };

  return userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center" p={4}>
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
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        p={4}
      >
        <Box width="40px" />
        <Heading fontSize="27px">
          {mode === Mode.SUPPLY
            ? t("Supply")
            : mode === Mode.BORROW
            ? t("Borrow")
            : mode === Mode.WITHDRAW
            ? t("Withdraw")
            : t("Repay")}
        </Heading>
        <IconButton
          color="#FFFFFF"
          variant="ghost"
          aria-label="Options"
          icon={<SettingsIcon />}
          _hover={{
            transform: "rotate(360deg)",
            transition: "all 0.7s ease-in-out",
          }}
          _active={{}}
          onClick={openOptions}
        />
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        p={4}
        height="100%"
      >
        <Text fontWeight="bold" fontSize="sm" textAlign="center">
          {depositOrWithdrawAlert}
        </Text>

        <DashboardBox width="100%" height="70px" mt={4}>
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

        <StatsColumn
          amount={parseInt(amount?.toFixed(0) ?? "0") ?? 0}
          color={tokenData?.color ?? "#FFF"}
          assets={assets}
          index={index}
          mode={mode}
        />

        <Button
          mt={4}
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="10px"
          width="100%"
          height="70px"
          bg={tokenData?.color ?? "#FFF"}
          color={tokenData?.overlayTextColor ?? "#000"}
          _hover={{ transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.95)" }}
          onClick={onConfirm}
          // isLoading={!poolTokenBalance}
          isDisabled={!amountIsValid}
        >
          {t("Confirm")}
        </Button>
      </Column>
    </>
  );
};

export default AmountSelect;

const StatsColumn = ({
  color,
  mode,
  assets,
  index,
  amount,
}: {
  color: string;
  mode: Mode;
  assets: USDPricedFuseAsset[];
  index: number;
  amount: number;
}) => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const { data: updatedAssets }: QueryResult<USDPricedFuseAsset[]> = useQuery(
    mode + " " + index + " " + JSON.stringify(assets) + " " + amount,
    async () => {
      const ethPrice: number = rari.web3.utils.fromWei(
        await rari.getEthUsdPriceBN()
      ) as any;

      return assets.map((value, _index) => {
        if (_index === index) {
          if (mode === Mode.SUPPLY) {
            const supplyBalance = parseInt(value.supplyBalance as any) + amount;

            return {
              ...value,
              supplyBalance,
              supplyBalanceUSD:
                ((supplyBalance * value.underlyingPrice) / 1e36) * ethPrice,
            };
          } else if (mode === Mode.WITHDRAW) {
            const supplyBalance = parseInt(value.supplyBalance as any) - amount;

            return {
              ...value,
              supplyBalance,
              supplyBalanceUSD:
                ((supplyBalance * value.underlyingPrice) / 1e36) * ethPrice,
            };
          } else if (mode === Mode.BORROW) {
            const borrowBalance = parseInt(value.borrowBalance as any) + amount;

            return {
              ...value,
              borrowBalance,

              borrowBalanceUSD:
                ((borrowBalance * value.underlyingPrice) / 1e36) * ethPrice,
            };
          } else if (mode === Mode.REPAY) {
            const borrowBalance = parseInt(value.borrowBalance as any) - amount;

            return {
              ...value,
              borrowBalance,
              borrowBalanceUSD:
                ((borrowBalance * value.underlyingPrice) / 1e36) * ethPrice,
            };
          }
        }

        return value;
      });
    }
  );

  const asset = assets[index];
  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  const borrowLimit = useBorrowLimit(assets);
  const updatedBorrowLimit = useBorrowLimit(updatedAssets ?? []);

  const supplyAPY = (asset.supplyRatePerBlock * 2372500) / 1e16;
  const borrowAPY = (asset.borrowRatePerBlock * 2372500) / 1e16;

  return (
    <DashboardBox mt={4} width="100%" height="190px">
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
            fontSize={
              mode === Mode.SUPPLY || mode === Mode.WITHDRAW ? "sm" : "lg"
            }
          >
            {smallUsdFormatter(
              asset.supplyBalance / 10 ** asset.underlyingDecimals
            ).replace("$", "")}
            {(mode === Mode.SUPPLY || mode === Mode.WITHDRAW) &&
            updatedAsset ? (
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
            {mode === Mode.SUPPLY || mode === Mode.WITHDRAW
              ? t("Supply APY")
              : t("Borrow APY")}
          </Text>
          <Text fontWeight="bold">
            {mode === Mode.SUPPLY || mode === Mode.WITHDRAW
              ? supplyAPY.toFixed(3)
              : borrowAPY.toFixed(3)}
            %
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
            fontSize={
              mode === Mode.SUPPLY || mode === Mode.WITHDRAW ? "sm" : "lg"
            }
          >
            {smallUsdFormatter(borrowLimit)}

            {/* The borrow limit won't increase if the asset is not enabled for collateral. Maybe we should have "max" borrow limit? */}
            {(mode === Mode.SUPPLY || mode === Mode.WITHDRAW) &&
            updatedAsset ? (
              <>
                {" → "}
                {smallUsdFormatter(updatedBorrowLimit)}
              </>
            ) : null}
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
            fontSize={mode === Mode.REPAY || mode === Mode.BORROW ? "sm" : "lg"}
          >
            {smallUsdFormatter(asset.borrowBalanceUSD)}
            {(mode === Mode.REPAY || mode === Mode.BORROW) && updatedAsset ? (
              <>
                {" → "}
                {smallUsdFormatter(updatedAsset.borrowBalanceUSD)}
              </>
            ) : null}
          </Text>
        </Row>
      </Column>
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
      toast({
        title: "Error!",
        description: e.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
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
import React, { useState } from "react";
import { Row, Column, Center } from "buttered-chakra";
import SmallWhiteCircle from "../../../static/small-white-circle.png";

import { ChevronDownIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Heading,
  Box,
  Button,
  Text,
  Image,
  IconButton,
  Input,
  Link,
  useToast,
} from "@chakra-ui/react";
import DashboardBox from "../../shared/DashboardBox";
import { tokens } from "../../../utils/tokenUtils";

import {
  useTokenBalance,
  fetchTokenBalance,
} from "../../../hooks/useTokenBalance";

import { Mode } from ".";

import { useTranslation } from "react-i18next";
import { ModalDivider } from "../../shared/Modal";
import { useRari } from "../../../context/RariContext";
import { Pool, usePoolType } from "../../../context/PoolContext";
import { BN, smallStringUsdFormatter } from "../../../utils/bigUtils";

import BigNumber from "bignumber.js";

import { useQueryCache } from "react-query";

import { getSDKPool, poolHasDivergenceRisk } from "../../../utils/poolUtils";
import {
  fetchMaxWithdraw,
  useMaxWithdraw,
} from "../../../hooks/useMaxWithdraw";
import { AttentionSeeker } from "react-awesome-reveal";

import LogRocket from "logrocket";
import { HashLoader } from "react-spinners";

interface Props {
  selectedToken: string;
  openCoinSelect: () => any;
  openOptions: () => any;
  onClose: () => any;
  mode: Mode;
}

enum UserAction {
  NO_ACTION,
  REQUESTED_QUOTE,
  VIEWING_QUOTE,
  WAITING_FOR_TRANSACTIONS,
}

const AmountSelect = ({
  selectedToken,
  openCoinSelect,
  mode,
  openOptions,
  onClose,
}: Props) => {
  const token = tokens[selectedToken];

  const poolType = usePoolType();

  const { rari, address } = useRari();

  const {
    data: selectedTokenBalance,
    isLoading: isSelectedTokenBalanceLoading,
  } = useTokenBalance(token);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [quoteAmount, setQuoteAmount] = useState<null | BN>(null);

  const [userEnteredAmount, _setUserEnteredAmount] = useState("");

  const [amount, _setAmount] = useState<BigNumber | null>(
    () => new BigNumber(0)
  );

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith("-")) {
      return;
    }

    _setUserEnteredAmount(newAmount);

    try {
      BigNumber.DEBUG = true;

      // Try to set the amount to BigNumber(newAmount):
      const bigAmount = new BigNumber(newAmount);
      _setAmount(bigAmount.multipliedBy(10 ** token.decimals));
    } catch (e) {
      console.log(e);

      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(null);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const { max, isMaxLoading } = useMaxWithdraw(token.symbol);

  const amountIsValid = (() => {
    if (amount === null || amount.isZero()) {
      return false;
    }

    if (mode === Mode.DEPOSIT) {
      if (isSelectedTokenBalanceLoading) {
        return false;
      }

      return amount.lte(selectedTokenBalance!.toString());
    } else {
      if (isMaxLoading) {
        return false;
      }

      return amount.lte(max!.toString());
    }
  })();

  const { t } = useTranslation();

  let depositOrWithdrawAlert;

  if (amount === null) {
    depositOrWithdrawAlert =
      mode === Mode.DEPOSIT
        ? t("Enter a valid amount to deposit.")
        : t("Enter a valid amount to withdraw.");
  } else if (amount.isZero()) {
    if (poolType === Pool.ETH) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Enter a valid amount to deposit.")
          : t("Enter a valid amount to withdraw.");
    } else {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Choose which token you want to deposit.")
          : t("Choose which token you want to withdraw.");
    }
  } else if (isSelectedTokenBalanceLoading) {
    depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
      token: selectedToken,
    });
  } else if (!amountIsValid) {
    depositOrWithdrawAlert =
      mode === Mode.DEPOSIT
        ? t("You don't have enough {{token}}.", {
            token: selectedToken,
          })
        : t("You cannot withdraw this much {{token}}.", {
            token: selectedToken,
          });
  } else {
    if (poolType === Pool.YIELD) {
      depositOrWithdrawAlert = t(
        "This pool has withdrawal & interest fees. Click to learn more."
      );
    } else {
      if (mode === Mode.DEPOSIT) {
        depositOrWithdrawAlert = t(
          "This pool has performance fees. Click to learn more."
        );
      } else {
        depositOrWithdrawAlert = t("Click review + confirm to withdraw!");
      }
    }
  }

  const toast = useToast();

  const queryCache = useQueryCache();

  const onConfirm = async () => {
    try {
      const pool = getSDKPool({ rari, pool: poolType });

      //@ts-ignore
      const amountBN = rari.web3.utils.toBN(amount!.decimalPlaces(0));

      // If clicking for the first time:
      if (userAction === UserAction.NO_ACTION) {
        setUserAction(UserAction.REQUESTED_QUOTE);

        let quote: BN;
        let slippage: BN;

        if (mode === Mode.DEPOSIT) {
          const [
            amountToBeAdded,
            ,
            _slippage,
          ] = (await pool.deposits.validateDeposit(
            token.symbol,
            amountBN,
            address,
            true
          )) as BN[];

          quote = amountToBeAdded;
          slippage = _slippage;
        } else {
          const [
            amountToBeRemoved,
            ,
            _slippage,
          ] = (await pool.withdrawals.validateWithdrawal(
            token.symbol,
            amountBN,
            address,
            true
          )) as BN[];

          quote = amountToBeRemoved;
          slippage = _slippage;
        }

        if (slippage) {
          const slippagePercent = (parseInt(slippage.toString()) / 1e18) * 100;
          const formattedSlippage = slippagePercent.toFixed(2) + "%";

          console.log("Slippage of " + formattedSlippage);

          // If slippage is >4% and user does not want to continue:
          if (
            slippagePercent > 4 &&
            !window.confirm(
              t(
                "High slippage of {{formattedSlippage}} for {{token}}, do you still wish to continue with this transaction?",
                { formattedSlippage, token: token.symbol }
              )
            )
          ) {
            setUserAction(UserAction.NO_ACTION);
            return;
          }
        }

        setQuoteAmount(quote);

        setUserAction(UserAction.VIEWING_QUOTE);

        return;
      }

      // They must have already seen the quote as the button to trigger this function is disabled while it's loading:
      // This means they are now ready to start sending transactions:

      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

      if (mode === Mode.DEPOSIT) {
        // (Third item in array is approvalReceipt)
        const [, , , depositReceipt] = await pool.deposits.deposit(
          token.symbol,
          amountBN,
          quoteAmount!,
          {
            from: address,
          }
        );

        if (!depositReceipt) {
          throw new Error(
            t(
              "Prices and/or slippage have changed. Please reload the page and try again. If the problem persists, please contact us."
            )
          );
        }
      } else {
        // (Third item in array is withdrawReceipt)
        await pool.withdrawals.withdraw(token.symbol, amountBN, quoteAmount!, {
          from: address,
        });
      }

      await queryCache.refetchQueries();

      onClose();
    } catch (e) {
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
      <HashLoader size={70} color={token.color} loading />
      <Heading mt="30px" textAlign="center" size="md">
        {mode === Mode.DEPOSIT
          ? t("Check your wallet to submit the transactions")
          : t("Check your wallet to submit the transaction")}
      </Heading>
      <Text fontSize="sm" mt="15px" textAlign="center">
        {mode === Mode.DEPOSIT
          ? t("Do not close this tab until you submit both transactions!")
          : t("You may close this tab after submitting the transaction.")}
      </Text>
      <Text fontSize="xs" mt="5px" textAlign="center">
        {t(
          "Do not increase the price of gas more than 1.5x the prefilled amount!"
        )}
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
          {mode === Mode.DEPOSIT ? t("Deposit") : t("Withdraw")}
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
        <Text fontWeight="bold" fontSize="13px" textAlign="center">
          <Link
            href="https://www.notion.so/Fees-e4689d7b800f485098548dd9e9d0a69f"
            isExternal
          >
            {depositOrWithdrawAlert}
          </Link>
        </Text>
        <DashboardBox width="100%" height="70px">
          <Row
            p={4}
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            expand
          >
            <AmountInput
              selectedToken={selectedToken}
              displayAmount={userEnteredAmount}
              updateAmount={updateAmount}
            />

            <TokenNameAndMaxButton
              openCoinSelect={openCoinSelect}
              selectedToken={selectedToken}
              updateAmount={updateAmount}
              mode={mode}
            />
          </Row>
        </DashboardBox>

        <Button
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="10px"
          width="100%"
          height="70px"
          bg={token.color}
          _hover={{ transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.95)" }}
          color={token.overlayTextColor}
          isLoading={
            isSelectedTokenBalanceLoading ||
            userAction === UserAction.REQUESTED_QUOTE
          }
          onClick={onConfirm}
          isDisabled={!amountIsValid}
        >
          {userAction === UserAction.VIEWING_QUOTE ? t("Confirm") : t("Review")}
        </Button>

        {poolHasDivergenceRisk(poolType) ? (
          <Link
            href="https://www.notion.so/Capital-Allocation-Risks-f4bccf324a594f46b849e6358e0a2464#631d223f598b42e28f9758541c1b1525"
            isExternal
          >
            <Text fontSize="xs" textAlign="center">
              {t(
                "You may experience divergence loss in this pool. Click for more info."
              )}
            </Text>
          </Link>
        ) : null}
      </Column>
      {userAction === UserAction.VIEWING_QUOTE ? (
        <ApprovalNotch color={token.color} mode={mode} amount={quoteAmount!} />
      ) : null}
    </>
  );
};

export default AmountSelect;

const TokenNameAndMaxButton = ({
  openCoinSelect,
  selectedToken,
  updateAmount,
  mode,
}: {
  selectedToken: string;
  openCoinSelect: () => any;
  updateAmount: (newAmount: string) => any;
  mode: Mode;
}) => {
  const token = tokens[selectedToken];

  const { rari, address } = useRari();

  const poolType = usePoolType();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);
    let maxBN: BN;

    if (mode === Mode.DEPOSIT) {
      const balance = await fetchTokenBalance(token, rari, address);

      if (token.symbol === "ETH") {
        const ethPriceBN = await rari.getEthUsdPriceBN();

        const gasAnd0xFeesInUSD = 23;

        // Subtract gasAnd0xFeesInUSD worth of ETH.
        maxBN = balance.sub(
          rari.web3.utils.toBN(
            // @ts-ignore
            new BigNumber(gasAnd0xFeesInUSD * 1e18)
              .div(ethPriceBN.toString())
              .multipliedBy(1e18)
              .decimalPlaces(0)
          )
        );
      } else {
        maxBN = balance;
      }
    } else {
      const max = await fetchMaxWithdraw({
        rari,
        address,
        poolType,
        symbol: token.symbol,
      });

      maxBN = max;
    }

    if (maxBN.isNeg() || maxBN.isZero()) {
      updateAmount("0.0");
    } else {
      const str = new BigNumber(maxBN.toString())
        .div(10 ** token.decimals)
        .toFixed(18)
        // Remove trailing zeroes
        .replace(/\.?0+$/, "");

      if (str.startsWith("0.000000")) {
        updateAmount("0.0");
      } else {
        updateAmount(str);
      }
    }

    setIsMaxLoading(false);
  };

  const { t } = useTranslation();

  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        as="button"
        onClick={openCoinSelect}
      >
        <Box height="25px" width="25px" mr={2}>
          <Image
            width="100%"
            height="100%"
            borderRadius="50%"
            backgroundImage={`url(${SmallWhiteCircle})`}
            src={token.logoURL}
            alt=""
          />
        </Box>
        <Heading fontSize="24px">{selectedToken}</Heading>
        <ChevronDownIcon boxSize="32px" />
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
  selectedToken,
}: {
  displayAmount: string;
  updateAmount: (symbol: string) => any;
  selectedToken: string;
}) => {
  const token = tokens[selectedToken];

  return (
    <Input
      type="number"
      inputMode="decimal"
      fontSize="3xl"
      fontWeight="bold"
      variant="unstyled"
      _placeholder={{ color: token.color }}
      placeholder="0.0"
      value={displayAmount}
      color={token.color}
      onChange={(event) => updateAmount(event.target.value)}
      mr={4}
    />
  );
};

const ApprovalNotch = ({
  color,
  mode,
  amount,
}: {
  amount: BN;
  mode: Mode;
  color: string;
}) => {
  const { t } = useTranslation();

  const poolType = usePoolType();

  const { rari } = useRari();

  const formattedAmount = (() => {
    const usdFormatted = smallStringUsdFormatter(
      rari.web3.utils.fromWei(amount)
    );

    return poolType === Pool.ETH
      ? usdFormatted.replace("$", "") + " ETH"
      : usdFormatted;
  })();

  return (
    <AttentionSeeker effect="headShake" triggerOnce>
      <Box
        borderRadius="0 0 10px 10px"
        borderWidth="0 1px 1px 1px"
        borderColor="#272727"
        bg="#121212"
        width={{ md: "auto", base: "90%" }}
        height={{ md: "30px", base: "60px" }}
        color={color}
        position="absolute"
        mx="auto"
        px={4}
        left="50%"
        transform="translateX(-50%)"
        bottom={{ md: "-30px", base: "-60px" }}
        whiteSpace={{ md: "nowrap", base: "inherit" }}
      >
        <Center expand>
          <Text fontSize="xs" pb="5px" textAlign="center" className="blinking">
            {mode === Mode.DEPOSIT
              ? t("You will deposit {{amount}}. Click confirm to approve.", {
                  amount: formattedAmount,
                })
              : poolType === Pool.YIELD
              ? t(
                  "You will withdraw {{amount}} before fees. Click confirm to approve.",
                  { amount: formattedAmount }
                )
              : t("You will withdraw {{amount}}. Click confirm to approve.", {
                  amount: formattedAmount,
                })}
          </Text>
        </Center>
      </Box>
    </AttentionSeeker>
  );
};

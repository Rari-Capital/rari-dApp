import React, { useState } from "react";
import { Row, Column, Center } from "buttered-chakra";

import LogRocket from "logrocket";
import {
  Heading,
  Box,
  Button,
  Text,
  Image,
  Input,
  Link,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import SmallWhiteCircle from "../../../../../static/small-white-circle.png";

import BigNumber from "bignumber.js";

import { useQueryCache } from "react-query";

import { AttentionSeeker } from "react-awesome-reveal";

import { HashLoader } from "react-spinners";

import { useTranslation } from "react-i18next";
import { useRari } from "../../../../../context/RariContext";
import { fetchTokenBalance } from "../../../../../hooks/useTokenBalance";
import { BN, smallStringUsdFormatter } from "../../../../../utils/bigUtils";
import { tokens } from "../../../../../utils/tokenUtils";
import DashboardBox, {
  DASHBOARD_BOX_SPACING,
} from "../../../../shared/DashboardBox";
import { ModalDivider } from "../../../../shared/Modal";

import { Mode } from ".";
import { SettingsIcon } from "@chakra-ui/icons";

interface Props {
  onClose: () => any;
  token: string;
  mode: Mode;
  openOptions: () => any;
}

enum UserAction {
  NO_ACTION,
  REQUESTED_QUOTE,
  VIEWING_QUOTE,
  WAITING_FOR_TRANSACTIONS,
}

const AmountSelect = ({ onClose, token, mode, openOptions }: Props) => {
  const toast = useToast();

  const queryCache = useQueryCache();

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [quoteAmount, setQuoteAmount] = useState<null | BN>(null);

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
      // _setAmount(bigAmount.multipliedBy(10 ** token.decimals));
    } catch (e) {
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(null);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const amountIsValid = (() => {
    // if (amount === null || amount.isZero()) {
    //   return false;
    // }

    // if (!poolTokenBalance) {
    //   return false;
    // }

    // return amount.lte(poolTokenBalance.toString());

    return true;
  })();

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
  }
  // else if (!poolTokenBalance || !sfiBalance) {
  //   depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
  //     token: tranchePool,
  //   });
  // }
  else if (!amountIsValid) {
    depositOrWithdrawAlert = t("You don't have enough {{token}}.", {
      token,
    });
  } else {
    depositOrWithdrawAlert = t("Click review + confirm to continue!");
  }

  const onConfirm = async () => {
    try {
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
      <HashLoader
        size={70}
        //TODO: COLOR
        color={"#C34535"}
        loading
      />
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
        p={DASHBOARD_BOX_SPACING.asPxString()}
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
        p={DASHBOARD_BOX_SPACING.asPxString()}
        height="100%"
      >
        <Text fontWeight="bold" fontSize="sm" textAlign="center">
          <Link
            href="https://www.notion.so/Fees-e4689d7b800f485098548dd9e9d0a69f"
            isExternal
          >
            {depositOrWithdrawAlert}
          </Link>
        </Text>

        <DashboardBox width="100%" height="70px" mt={4}>
          <Row
            p={DASHBOARD_BOX_SPACING.asPxString()}
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            expand
          >
            <AmountInput
              selectedToken={token}
              displayAmount={userEnteredAmount}
              updateAmount={updateAmount}
            />

            <TokenNameAndMaxButton
              selectedToken={token}
              updateAmount={updateAmount}
            />
          </Row>
        </DashboardBox>

        <StatsColumn token={token} mode={mode} />

        <Button
          mt={4}
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="10px"
          width="100%"
          height="70px"
          //TODO: COLOR
          bg={"#C34535"}
          _hover={{ transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.95)" }}
          //TODO: COLOR
          color={"#FFF"}
          onClick={onConfirm}
          // isLoading={!poolTokenBalance}
          isDisabled={!amountIsValid}
        >
          {userAction === UserAction.VIEWING_QUOTE ? t("Confirm") : t("Review")}
        </Button>
      </Column>
      {userAction === UserAction.VIEWING_QUOTE ? (
        //TODO: COLOR
        <ApprovalNotch color={"#C34535"} amount={quoteAmount!} />
      ) : null}
    </>
  );
};

export default AmountSelect;

const StatsColumn = ({ token, mode }: { token: string; mode: Mode }) => {
  //TODO: BETTER COLOR SOURCE
  const tokenData = tokens[token] ?? {
    color: "#C34535",
    logoURL:
      "https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144",
  };

  const { t } = useTranslation();
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
          color={tokenData.color}
        >
          <Text fontWeight="bold">{t("Wallet Balance")}:</Text>
          <Text fontWeight="bold">
            {"25,000.01"} {token}
          </Text>
        </Row>

        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontWeight="bold">{t("Supply Rate")}:</Text>
          <Text fontWeight="bold">{"4.37%"}</Text>
        </Row>

        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontWeight="bold">{t("Borrow Limit")}:</Text>
          <Text fontWeight="bold">{"$10,000.00"}</Text>
        </Row>

        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontWeight="bold">{t("Borrow Limit Used")}:</Text>
          <Text fontWeight="bold">{"$1,512.00"}</Text>
        </Row>
      </Column>
    </DashboardBox>
  );
};

const TokenNameAndMaxButton = ({
  selectedToken,
  updateAmount,
}: {
  selectedToken: string;

  updateAmount: (newAmount: string) => any;
}) => {
  //TODO: BETTER COLOR SOURCE
  const token = tokens[selectedToken] ?? {
    color: "#C34535",
    logoURL:
      "https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144",
  };

  const { rari, address } = useRari();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);
    let maxBN: BN;

    const balance = await fetchTokenBalance(token.address, rari, address);

    maxBN = balance;

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
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
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
        <Heading fontSize="24px" mr={2}>
          {selectedToken}
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
  selectedToken,
}: {
  displayAmount: string;
  updateAmount: (symbol: string) => any;
  selectedToken: string;
}) => {
  //TODO: BETTER COLOR SOURCE
  const token = tokens[selectedToken] ?? { color: "#C34535" };

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
      mr={DASHBOARD_BOX_SPACING.asPxString()}
    />
  );
};

const ApprovalNotch = ({ color, amount }: { amount: BN; color: string }) => {
  const { t } = useTranslation();

  const formattedAmount = (() => {
    const usdFormatted = smallStringUsdFormatter(
      new BigNumber(amount.toString()).div(1e18).toString()
    );

    return usdFormatted;
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
            {t("You will deposit {{amount}}. Click confirm to approve.", {
              amount: formattedAmount,
            })}
          </Text>
        </Center>
      </Box>
    </AttentionSeeker>
  );
};

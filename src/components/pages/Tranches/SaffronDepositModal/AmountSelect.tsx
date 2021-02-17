import React, { useState } from "react";
import { Row, Column, Center } from "buttered-chakra";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";

import LogRocket from "logrocket";
import {
  Heading,
  Box,
  Button,
  Text,
  Image,
  Input,
  useToast,
} from "@chakra-ui/react";
import DashboardBox from "../../../shared/DashboardBox";
import { tokens } from "../../../../utils/tokenUtils";

import {
  useTokenBalance,
  fetchTokenBalance,
} from "../../../../hooks/useTokenBalance";

import { useTranslation } from "react-i18next";
import { ModalDivider } from "../../../shared/Modal";
import { useRari } from "../../../../context/RariContext";

import { BN, smallStringUsdFormatter } from "../../../../utils/bigUtils";

import BigNumber from "bignumber.js";

import { useQuery, useQueryCache } from "react-query";

import { AttentionSeeker } from "react-awesome-reveal";

import { HashLoader } from "react-spinners";
import {
  TrancheRating,
  TranchePool,
  useSaffronData,
  trancheRatingIndex,
} from "../TranchesPage";

import ERC20ABI from "../../../../rari-sdk/abi/ERC20.json";
import { Token } from "rari-tokens-generator";

function noop() {}

const SFIToken = {
  symbol: "SFI",
  address: "0xb753428af26e81097e7fd17f40c88aaa3e04902c",
  name: "Spice",
  decimals: 18,
  color: "#C34535",
  overlayTextColor: "#fff",
  logoURL:
    "https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144",
} as Token;

interface Props {
  onClose: () => any;

  tranchePool: TranchePool;
  trancheRating: TrancheRating;
}

enum UserAction {
  NO_ACTION,
  VIEWING_QUOTE,
  WAITING_FOR_TRANSACTIONS,
}

export const requiresSFIStaking = (trancheRating: TrancheRating) => {
  return trancheRating === TrancheRating.A;
};

const useSFIBalance = () => {
  const { rari, address } = useRari();

  const { data } = useQuery("sfiBalance", async () => {
    const stringBalance = await new rari.web3.eth.Contract(
      ERC20ABI as any,
      SFIToken.address
    ).methods
      .balanceOf(address)
      .call();

    return rari.web3.utils.toBN(stringBalance);
  });

  return { sfiBalance: data };
};

const AmountSelect = ({ onClose, tranchePool, trancheRating }: Props) => {
  const token = tokens[tranchePool];

  const toast = useToast();

  const queryCache = useQueryCache();

  const { rari, address } = useRari();

  const { data: poolTokenBalance } = useTokenBalance(token.address);

  const { sfiBalance } = useSFIBalance();

  const { saffronPool } = useSaffronData();

  const { data: sfiRatio } = useQuery(tranchePool + " sfiRatio", async () => {
    return parseFloat(
      rari.web3.utils.fromWei(await saffronPool.methods.SFI_ratio().call())
    );
  });

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
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(null);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const amountIsValid = (() => {
    if (amount === null || amount.isZero()) {
      return false;
    }

    if (!poolTokenBalance) {
      return false;
    }

    return amount.lte(poolTokenBalance.toString());
  })();

  const sfiRequired = (() => {
    return amount && sfiRatio
      ? amount
          .div(10 ** token.decimals)
          .multipliedBy((1 / sfiRatio) * 10 ** SFIToken.decimals)
      : new BigNumber(0);
  })();

  const hasEnoughSFI = (() => {
    if (!requiresSFIStaking(trancheRating)) {
      return true;
    }

    if (!sfiBalance || sfiBalance.isZero()) {
      return false;
    }

    return sfiRequired.lte(sfiBalance.toString());
  })();

  const { t } = useTranslation();

  let depositOrWithdrawAlert;

  if (amount === null) {
    depositOrWithdrawAlert = t("Enter a valid amount to deposit.");
  } else if (amount.isZero()) {
    depositOrWithdrawAlert = t("Enter a valid amount to deposit.");
  } else if (!poolTokenBalance || !sfiBalance) {
    depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
      token: tranchePool,
    });
  } else if (!amountIsValid) {
    depositOrWithdrawAlert = t("You don't have enough {{token}}.", {
      token: tranchePool,
    });
  } else if (!hasEnoughSFI) {
    depositOrWithdrawAlert = t(
      "You need {{sfiMissing}} more SFI to deposit (1 SFI : {{sfiRatio}} {{tranchePool}})",
      {
        sfiRatio: sfiRatio ?? "?",
        tranchePool,
        sfiMissing: sfiRequired
          .minus(sfiBalance.toString())
          .div(10 ** SFIToken.decimals)
          .decimalPlaces(2)
          .toString(),
      }
    );
  } else {
    depositOrWithdrawAlert = t("Click review + confirm to continue!");
  }

  const onConfirm = async () => {
    try {
      //@ts-ignore
      const amountBN = rari.web3.utils.toBN(amount!.decimalPlaces(0));

      // If clicking for the first time:
      if (userAction === UserAction.NO_ACTION) {
        // Check A tranche cap
        if (trancheRating === TrancheRating.A) {
          const limits = await saffronPool.methods
            .get_available_S_balances()
            .call();

          const amountLeftBeforeCap = new BigNumber(limits[0] + limits[1]).div(
            10
          );

          if (amountLeftBeforeCap.lt(amountBN.toString())) {
            toast({
              title: "Error!",
              description: `The A tranche is capped at 1/10 the liquidity of the S tranche. Currently you must deposit less than ${amountLeftBeforeCap
                .div(10 ** token.decimals)
                .decimalPlaces(2)
                .toString()} ${
                token.symbol
              } or deposit into the S tranche (as more is deposited into S tranche, the cap on the A tranche increases).`,
              status: "error",
              duration: 18000,
              isClosable: true,
              position: "top-right",
            });

            return;
          }
        }

        setQuoteAmount(amountBN);
        setUserAction(UserAction.VIEWING_QUOTE);
        return;
      }

      // They must have already seen the quote as the button to trigger this function is disabled while it's loading:
      // This means they are now ready to start sending transactions:
      setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

      const poolAddress = saffronPool.options.address;

      const SFIContract = new rari.web3.eth.Contract(
        ERC20ABI as any,
        SFIToken.address
      );

      const trancheToken = new rari.web3.eth.Contract(
        ERC20ABI as any,
        token.address
      );

      const hasApprovedEnoughSFI = requiresSFIStaking(trancheRating)
        ? rari.web3.utils
            .toBN(
              await SFIContract.methods.allowance(address, poolAddress).call()
            )
            .gte(amountBN)
        : true;

      const hasApprovedEnoughPoolToken = rari.web3.utils
        .toBN(await trancheToken.methods.allowance(address, poolAddress).call())
        .gte(amountBN);

      if (!hasApprovedEnoughSFI) {
        // Approve the amount of poolToken because it will always be more than sfiRequired
        const txn = SFIContract.methods
          .approve(poolAddress, amountBN.toString())
          .send({ from: address });

        // If the user has already approved the poolToken we need to wait for this txn to complete before showing the add liquidity txn
        if (hasApprovedEnoughPoolToken) {
          await txn;
        }
      }

      if (!hasApprovedEnoughPoolToken) {
        // Approve tranche token (DAI or USDC)
        await trancheToken.methods
          .approve(saffronPool.options.address, amountBN.toString())
          .send({ from: address });
      }

      await saffronPool.methods
        .add_liquidity(amountBN.toString(), trancheRatingIndex(trancheRating))
        .send({ from: address });

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
        color={requiresSFIStaking(trancheRating) ? SFIToken.color : token.color}
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
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        p={4}
      >
        <Heading fontSize="27px">
          {t("{{trancheRating}} Tranche Deposit", { trancheRating })}
        </Heading>
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
        <DashboardBox width="100%" height="70px">
          <Row
            p={4}
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            expand
          >
            <AmountInput
              selectedToken={tranchePool}
              displayAmount={userEnteredAmount}
              updateAmount={updateAmount}
            />

            <TokenNameAndMaxButton
              selectedToken={tranchePool}
              updateAmount={updateAmount}
            />
          </Row>
        </DashboardBox>

        {requiresSFIStaking(trancheRating) ? (
          <DashboardBox width="100%" height="70px">
            <Row
              p={4}
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              expand
            >
              <AmountInput
                selectedToken="SFI"
                displayAmount={
                  sfiRequired.isZero()
                    ? "0.0"
                    : sfiRequired.div(10 ** SFIToken.decimals).toString()
                }
                updateAmount={noop}
              />

              <TokenNameAndMaxButton selectedToken="SFI" updateAmount={noop} />
            </Row>
          </DashboardBox>
        ) : null}

        <Button
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="10px"
          width="100%"
          height="70px"
          bg={requiresSFIStaking(trancheRating) ? SFIToken.color : token.color}
          _hover={{ transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.95)" }}
          color={token.overlayTextColor}
          onClick={onConfirm}
          isLoading={!poolTokenBalance}
          isDisabled={!amountIsValid || !hasEnoughSFI}
        >
          {userAction === UserAction.VIEWING_QUOTE ? t("Confirm") : t("Review")}
        </Button>
      </Column>
      {userAction === UserAction.VIEWING_QUOTE ? (
        <ApprovalNotch
          color={
            requiresSFIStaking(trancheRating) ? SFIToken.color : token.color
          }
          amount={quoteAmount!}
        />
      ) : null}
    </>
  );
};

export default AmountSelect;

const TokenNameAndMaxButton = ({
  selectedToken,
  updateAmount,
}: {
  selectedToken: string;

  updateAmount: (newAmount: string) => any;
}) => {
  const isSFI = selectedToken === "SFI";

  const token = isSFI ? SFIToken : tokens[selectedToken];

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

      {isSFI ? null : (
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
      )}
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
  const isSFI = selectedToken === "SFI";

  const token = isSFI ? SFIToken : tokens[selectedToken];

  return (
    <Input
      style={isSFI ? { pointerEvents: "none" } : {}}
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

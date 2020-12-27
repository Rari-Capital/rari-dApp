import React, { useCallback, useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import DashboardBox, {
  DASHBOARD_BOX_SPACING,
} from "../../../shared/DashboardBox";
import { tokens } from "../../../../utils/tokenUtils";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import {
  useTokenBalance,
  fetchTokenBalance,
} from "../../../../hooks/useTokenBalance";

import { Mode } from ".";

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
  color: "#B64E3D",
  overlayTextColor: "#fff",
  logoURL:
    "https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144",
} as Token;

interface Props {
  openOptions: () => any;
  onClose: () => any;
  mode: Mode;
  tranchePool: TranchePool;
  trancheRating: TrancheRating;
}

enum UserAction {
  NO_ACTION,
  REQUESTED_QUOTE,
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

const AmountSelect = React.memo(
  ({ mode, onClose, tranchePool, trancheRating }: Props) => {
    const token = tokens[tranchePool];

    const { rari, address } = useRari();

    const { data: poolTokenBalance } = useTokenBalance(token);

    const { sfiBalance } = useSFIBalance();

    const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

    const [quoteAmount, setQuoteAmount] = useState<null | BN>(null);

    const [userEnteredAmount, _setUserEnteredAmount] = useState("");

    const [amount, _setAmount] = useState<BigNumber | null>(
      () => new BigNumber(0)
    );

    const sfiRequired = useMemo(() => {
      return amount
        ? amount
            .div(10 ** token.decimals)
            .multipliedBy((1 / 500) * 10 ** SFIToken.decimals)
        : new BigNumber(0);
    }, [amount, token.decimals]);

    const updateAmount = useCallback(
      (newAmount: string) => {
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
      },
      [_setUserEnteredAmount, _setAmount, token.decimals]
    );

    const amountIsValid = useMemo(() => {
      if (amount === null || amount.isZero()) {
        return false;
      }

      if (mode === Mode.DEPOSIT) {
        if (!poolTokenBalance) {
          return false;
        }

        return amount.lte(poolTokenBalance.toString());
      } else {
        // TODO

        // if (!max) {
        //   return false;
        // }

        // return amount.lte(max.toString());
        return true;
      }
    }, [poolTokenBalance, amount, mode]);

    const hasEnoughSFI = useMemo(() => {
      if (mode === Mode.DEPOSIT) {
      }

      if (!requiresSFIStaking(trancheRating)) {
        return true;
      }

      if (!sfiBalance || sfiBalance.isZero()) {
        return false;
      }

      return sfiRequired.lte(sfiBalance.toString());
    }, [sfiRequired, mode, sfiBalance, trancheRating]);

    const { t } = useTranslation();

    let depositOrWithdrawAlert;

    if (amount === null) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Enter a valid amount to deposit.")
          : t("Enter a valid amount to withdraw.");
    } else if (amount.isZero()) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Enter a valid amount to deposit.")
          : t("Enter a valid amount to withdraw.");
    } else if (!poolTokenBalance) {
      depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
        token: tranchePool,
      });
    } else if (!amountIsValid) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("You don't have enough {{token}}.", {
              token: tranchePool,
            })
          : t("You cannot withdraw this much {{token}}.", {
              token: tranchePool,
            });
    } else if (!hasEnoughSFI) {
      depositOrWithdrawAlert = t(
        "You need 1 SFI for every 500 {{tranchePool}} to enter this tranche.",
        { tranchePool }
      );
    } else {
      depositOrWithdrawAlert = t("Click review + confirm to continue!");
    }

    const toast = useToast();

    const queryCache = useQueryCache();

    const { saffronPool } = useSaffronData();

    const onConfirm = useCallback(async () => {
      try {
        //@ts-ignore
        const amountBN = rari.web3.utils.toBN(amount!.decimalPlaces(0));

        // If clicking for the first time:
        if (userAction === UserAction.NO_ACTION) {
          setUserAction(UserAction.REQUESTED_QUOTE);

          //TODO: WITHDRAWS

          setQuoteAmount(amountBN);
          setUserAction(UserAction.VIEWING_QUOTE);
          return;
        }

        // They must have already seen the quote as the button to trigger this function is disabled while it's loading:
        // This means they are now ready to start sending transactions:
        setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

        if (mode === Mode.DEPOSIT) {
          if (requiresSFIStaking(trancheRating)) {
            // Aprove SFI
            new rari.web3.eth.Contract(
              ERC20ABI as any,
              SFIToken.address
            ).methods
              .approve(saffronPool.options.address, amountBN.toString())
              .send({ from: address });
          }

          // Approve tranche token (DAI or USDC)
          await new rari.web3.eth.Contract(
            ERC20ABI as any,
            token.address
          ).methods
            .approve(saffronPool.options.address, amountBN.toString())
            .send({ from: address });

          // Call add liquidity
          await saffronPool.methods
            .add_liquidity(
              amountBN.toString(),
              trancheRatingIndex(trancheRating)
            )
            .send({ from: address });
        } else {
          //TODO: WITHDRAWS
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
    }, [
      address,
      token.address,
      saffronPool,
      trancheRating,
      userAction,
      mode,
      onClose,
      rari,
      amount,
      toast,
      queryCache,
    ]);

    return userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
      <Column
        expand
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        p={4}
      >
        <HashLoader size={70} color={token.color} loading />
        <Heading mt="30px" textAlign="center" size="md">
          {mode === Mode.DEPOSIT
            ? t("Check your wallet to submit the transactions")
            : t("Check your wallet to submit the transaction")}
        </Heading>
        <Text fontSize="sm" mt="15px" textAlign="center">
          {mode === Mode.DEPOSIT
            ? t("Do not close this tab until you submit all 3 transactions!")
            : t("You may close this tab after submitting the transaction.")}
        </Text>
      </Column>
    ) : (
      <>
        <Row
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          p={DASHBOARD_BOX_SPACING.asPxString()}
        >
          {/* <Box width="40px" /> */}
          <Heading fontSize="27px">
            {mode === Mode.DEPOSIT ? t("Deposit") : t("Withdraw")}
          </Heading>
          {/* <IconButton
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
          /> */}
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
          <DashboardBox width="100%" height="70px">
            <Row
              p={DASHBOARD_BOX_SPACING.asPxString()}
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
                mode={mode}
              />
            </Row>
          </DashboardBox>

          {requiresSFIStaking(trancheRating) ? (
            <DashboardBox width="100%" height="70px">
              <Row
                p={DASHBOARD_BOX_SPACING.asPxString()}
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                expand
              >
                <AmountInput
                  selectedToken="SFI"
                  displayAmount={sfiRequired
                    .div(10 ** SFIToken.decimals)
                    .toString()}
                  updateAmount={noop}
                />

                <TokenNameAndMaxButton
                  selectedToken="SFI"
                  updateAmount={noop}
                  mode={mode}
                />
              </Row>
            </DashboardBox>
          ) : null}

          <Button
            fontWeight="bold"
            fontSize="2xl"
            borderRadius="10px"
            width="100%"
            height="70px"
            bg={
              requiresSFIStaking(trancheRating) ? SFIToken.color : token.color
            }
            _hover={{ transform: "scale(1.02)" }}
            _active={{ transform: "scale(0.95)" }}
            color={token.overlayTextColor}
            isLoading={
              !poolTokenBalance || userAction === UserAction.REQUESTED_QUOTE
            }
            onClick={onConfirm}
            isDisabled={!amountIsValid || !hasEnoughSFI}
          >
            {userAction === UserAction.VIEWING_QUOTE
              ? t("Confirm")
              : t("Review")}
          </Button>
        </Column>
        {userAction === UserAction.VIEWING_QUOTE ? (
          <ApprovalNotch
            color={token.color}
            mode={mode}
            amount={quoteAmount!}
          />
        ) : null}
      </>
    );
  }
);

export default AmountSelect;

const TokenNameAndMaxButton = React.memo(
  ({
    selectedToken,
    updateAmount,
    mode,
  }: {
    selectedToken: string;

    updateAmount: (newAmount: string) => any;
    mode: Mode;
  }) => {
    const isSFI = selectedToken === "SFI";

    const token = isSFI ? SFIToken : tokens[selectedToken];

    const { rari, address } = useRari();

    const [isMaxLoading, setIsMaxLoading] = useState(false);

    const setToMax = useCallback(async () => {
      setIsMaxLoading(true);
      let maxBN: BN;

      if (mode === Mode.DEPOSIT) {
        const balance = await fetchTokenBalance(token, rari, address);

        maxBN = balance;
      } else {
        //TODO
        maxBN = rari.web3.utils.toBN(0);
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
    }, [updateAmount, token, rari, address, mode]);

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
  }
);

const AmountInput = React.memo(
  ({
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

    const onChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) =>
        updateAmount(event.target.value),
      [updateAmount]
    );

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
        onChange={isSFI ? noop : onChange}
        mr={DASHBOARD_BOX_SPACING.asPxString()}
      />
    );
  }
);

const ApprovalNotch = React.memo(
  ({ color, mode, amount }: { amount: BN; mode: Mode; color: string }) => {
    const { t } = useTranslation();

    const formattedAmount = useMemo(() => {
      const usdFormatted = smallStringUsdFormatter(
        new BigNumber(amount.toString()).div(1e18).toString()
      );

      return usdFormatted;
    }, [amount]);

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
            <Text
              fontSize="xs"
              pb="5px"
              textAlign="center"
              className="blinking"
            >
              {mode === Mode.DEPOSIT
                ? t("You will deposit {{amount}}. Click confirm to approve.", {
                    amount: formattedAmount,
                  })
                : t("You will withdraw {{amount}}. Click confirm to approve.", {
                    amount: formattedAmount,
                  })}
            </Text>
          </Center>
        </Box>
      </AttentionSeeker>
    );
  }
);

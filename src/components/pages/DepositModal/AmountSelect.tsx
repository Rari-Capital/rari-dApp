import React, { useCallback, useState, useMemo } from "react";
import { Row, Column } from "buttered-chakra";
import {
  Heading,
  Box,
  Icon,
  Button,
  Text,
  Image,
  IconButton,
  Input,
} from "@chakra-ui/core";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import { tokens } from "../../../utils/tokenUtils";
import SmallWhiteCircle from "../../../static/small-white-circle.png";
import {
  useTokenBalance,
  getTokenBalance,
} from "../../../hooks/useTokenBalance";

import { Mode } from ".";

import { useTranslation } from "react-i18next";
import { ModalDivider } from "../../shared/Modal";
import { useRari } from "../../../context/RariContext";
import { Pool, usePoolType } from "../../../context/PoolContext";
import { stringUsdFormatter } from "../../../utils/bigUtils";
import StablePool from "../../../rari-sdk/pools/stable";
import EthereumPool from "../../../rari-sdk/pools/ethereum";
import YieldPool from "../../../rari-sdk/pools/yield";

import Notify from "bnc-notify";

const notify = Notify({
  dappId: "0855eca3-50ec-49da-b80c-b4734bd51de6", // [String] The API key created by step one above
  networkId: 0, // [Integer] The Ethereum network ID your Dapp uses.
});

interface Props {
  selectedToken: string;
  openCoinSelect: () => any;
  openOptions: () => any;
  mode: Mode;
}

const AmountSelect = React.memo(
  ({ selectedToken, openCoinSelect, mode, openOptions }: Props) => {
    const token = tokens[selectedToken];

    const poolType = usePoolType();

    const { rari, address } = useRari();

    const {
      data: selectedTokenBalance,
      isLoading: isSelectedTokenBalanceLoading,
    } = useTokenBalance(token);

    const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");

    //TODO: this is ugly af fix this later
    const [amount, _setAmount] = useState<any>(() => rari.web3.utils.toBN(0.0));

    const updateAmount = useCallback(
      (newAmount: string) => {
        if (newAmount.startsWith("-")) {
          return;
        }

        _setUserEnteredAmount(newAmount);

        try {
          // Try to set the amount to Big(amount):
          const bigAmount = rari.web3.utils.toBN(newAmount);
          _setAmount(bigAmount);
        } catch (e) {
          // If the number was invalid, set the amount to null to disable confirming:
          _setAmount(null);
        }
      },
      [_setUserEnteredAmount, _setAmount, rari.web3.utils]
    );

    const isAmountGreaterThanSelectedTokenBalance = useMemo(
      () =>
        isSelectedTokenBalanceLoading || amount === null
          ? false
          : selectedTokenBalance!.lt(amount),
      [isSelectedTokenBalanceLoading, selectedTokenBalance, amount]
    );

    const { t } = useTranslation();

    const onDeposit = useCallback(async () => {
      let pool: StablePool | EthereumPool | YieldPool;

      if (poolType === Pool.ETH) {
        pool = rari.pools.ethereum;
      } else if (poolType === Pool.STABLE) {
        pool = rari.pools.stable;
      } else {
        pool = rari.pools.yield;
      }

      const amountInTheirTokenScaledWithDecimal = rari.web3.utils
        .toBN(10 ** token.decimals)
        .mul(amount);

      const [amountToBeAdded] = await pool.deposits.validateDeposit(
        token.symbol,
        amountInTheirTokenScaledWithDecimal,
        address
      );

      const amountToBeAddedInFormat =
        poolType === Pool.ETH
          ? rari.web3.utils.fromWei(amountToBeAdded).toString() + " ETH"
          : stringUsdFormatter(
              rari.web3.utils.fromWei(amountToBeAdded).toString()
            );

      if (
        window.confirm(
          t("You will deposit {{amount}}. Do you approve?", {
            amount: amountToBeAddedInFormat,
          })
        )
      ) {
        pool.deposits.deposit(
          token.symbol,
          amountInTheirTokenScaledWithDecimal,
          amountToBeAdded,
          {
            from: address,
          }
        );
      }
    }, [address, poolType, rari.pools, rari.web3.utils, token, amount, t]);

    const onWithdraw = useCallback(async () => {
      let pool: StablePool | EthereumPool | YieldPool;

      if (poolType === Pool.ETH) {
        pool = rari.pools.ethereum;
      } else if (poolType === Pool.STABLE) {
        pool = rari.pools.stable;
      } else {
        pool = rari.pools.yield;
      }

      const amountInTheirTokenScaledWithDecimal = rari.web3.utils
        .toBN(10 ** token.decimals)
        .mul(amount);

      const [amountToBeRemoved] = await pool.withdrawals.validateWithdrawal(
        token.symbol,
        amountInTheirTokenScaledWithDecimal,
        address
      );

      const amountToBeRemovedInFormat =
        poolType === Pool.ETH
          ? rari.web3.utils.fromWei(amountToBeRemoved).toString() + " ETH"
          : stringUsdFormatter(
              rari.web3.utils.fromWei(amountToBeRemoved).toString()
            );

      if (
        window.confirm(
          t("You will withdraw {{amount}}. Do you approve?", {
            amount: amountToBeRemovedInFormat,
          })
        )
      ) {
        const [
          ,
          ,
          approvalReceipt,
          depositReceipt,
        ] = await pool.withdrawals.withdraw(
          token.symbol,
          amountInTheirTokenScaledWithDecimal,
          amountToBeRemoved,
          {
            from: address,
          }
        );

        if (approvalReceipt?.transactionHash) {
          notify.hash(approvalReceipt?.transactionHash);
        }

        if (depositReceipt?.transactionHash) {
          notify.hash(depositReceipt?.transactionHash);
        }
      }
    }, [address, poolType, rari.pools, rari.web3.utils, token, amount, t]);

    let depositOrWithdrawAlert;

    if (amount === null) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Enter a valid amount to deposit.")
          : t("Enter a valid amount to withdraw.");
    } else if (amount.isZero()) {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Choose which crypto you want to deposit.")
          : t("Choose which crypto you want to withdraw.");
    } else if (isSelectedTokenBalanceLoading) {
      depositOrWithdrawAlert = t("Loading your balance of {{token}}...", {
        token: selectedToken,
      });
    } else if (
      isAmountGreaterThanSelectedTokenBalance &&
      mode === Mode.DEPOSIT
    ) {
      depositOrWithdrawAlert = t("You don't have enough {{token}}.", {
        token: selectedToken,
      });
    } else {
      depositOrWithdrawAlert =
        mode === Mode.DEPOSIT
          ? t("Click confirm to start earning interest!")
          : t("Click confirm to withdraw.");
    }

    return (
      <>
        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={DASHBOARD_BOX_SPACING.asPxString()}
        >
          <Box width="40px" />
          <Heading fontSize="27px">
            {mode === Mode.DEPOSIT ? t("Deposit") : t("Withdraw")}
          </Heading>
          <IconButton
            color="#FFFFFF"
            variant="ghost"
            aria-label="Options"
            icon="settings"
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
            {depositOrWithdrawAlert}
          </Text>
          <DashboardBox width="100%" height="70px">
            <Row
              p={DASHBOARD_BOX_SPACING.asPxString()}
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
            isLoading={isSelectedTokenBalanceLoading}
            onClick={mode === Mode.DEPOSIT ? onDeposit : onWithdraw}
            isDisabled={
              amount === null ||
              amount.isZero() ||
              (isAmountGreaterThanSelectedTokenBalance && mode === Mode.DEPOSIT)
            }
          >
            {t("Confirm")}
          </Button>
        </Column>
      </>
    );
  }
);

export default AmountSelect;

const TokenNameAndMaxButton = React.memo(
  ({
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

    const [isMaxLoading, _setIsMaxLoading] = useState(false);

    const setToMax = useCallback(async () => {
      _setIsMaxLoading(true);

      const balance = await getTokenBalance(token, rari, address);

      updateAmount(balance.toString());

      _setIsMaxLoading(false);
    }, [_setIsMaxLoading, updateAmount, token, rari, address]);

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
          <Icon name="chevron-down" size="32px" />
        </Row>

        {mode === Mode.WITHDRAW ? null : (
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
    const token = tokens[selectedToken];

    const onChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) =>
        updateAmount(event.target.value),
      [updateAmount]
    );

    return (
      <Input
        type="number"
        inputMode="decimal"
        fontSize="3xl"
        fontWeight="bold"
        variant="unstyled"
        placeholder="0.0"
        value={displayAmount}
        color={token.color}
        onChange={onChange}
        mr={DASHBOARD_BOX_SPACING.asPxString()}
      />
    );
  }
);

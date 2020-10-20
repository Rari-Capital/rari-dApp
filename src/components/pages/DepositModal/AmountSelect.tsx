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

interface Props {
  selectedToken: string;
  openCoinSelect: () => any;
  openOptions: () => any;
  mode: Mode;
}

const AmountSelect = React.memo(
  ({ selectedToken, openCoinSelect, mode, openOptions }: Props) => {
    const token = tokens[selectedToken];

    const { rari } = useRari();

    const {
      data: selectedTokenBalance,
      isLoading: isSelectedTokenBalanceLoading,
    } = useTokenBalance(token);

    const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");

    //TODO: this is ugly af fix this later
    const [amount, _setAmount] = useState<any>(() => rari.web3.utils.BN(0.0));

    const updateAmount = useCallback(
      (newAmount: string) => {
        if (newAmount.startsWith("-")) {
          return;
        }

        _setUserEnteredAmount(newAmount);

        try {
          // Try to set the amount to Big(amount):
          const bigAmount = rari.web3.utils.BN(newAmount);
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
            {amount !== null
              ? !amount.gt(0)
                ? mode === Mode.DEPOSIT
                  ? t("Choose which crypto you want to deposit.")
                  : t("Choose which crypto you want to withdraw.")
                : isSelectedTokenBalanceLoading
                ? t("Loading your balance of {{token}}...", {
                    token: selectedToken,
                  })
                : isAmountGreaterThanSelectedTokenBalance
                ? t("You don't have enough {{token}}.", {
                    token: selectedToken,
                  })
                : t("Click confirm to start earning interest!")
              : mode === Mode.DEPOSIT
              ? t("Enter a valid amount to deposit.")
              : t("Enter a valid amount to withdraw.")}
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
            isDisabled={
              amount === null ||
              !amount.gt(0) ||
              isAmountGreaterThanSelectedTokenBalance
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
  }: {
    selectedToken: string;
    openCoinSelect: () => any;
    updateAmount: (newAmount: string) => any;
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

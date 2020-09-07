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
import DashboardBox from "../../shared/DashboardBox";
import { tokens } from "../../../utils/tokenUtils";
import SmallWhiteCircle from "../../../static/small-white-circle.png";
import {
  useTokenBalance,
  getTokenBalance,
} from "../../../hooks/useTokenBalance";
import { toBig } from "../../../utils/bigUtils";
import { Mode, modeToTitleCaseString, modeToLowerCaseString } from ".";
import Big from "big.js";
import { useAuthedWeb3 } from "../../../context/Web3Context";

interface Props {
  selectedToken: string;
  openCoinSelect: () => any;
  openOptions: () => any;
  mode: Mode;
}

const AmountSelect = React.memo(
  ({ selectedToken, openCoinSelect, mode, openOptions }: Props) => {
    const token = tokens[selectedToken];

    const {
      data: selectedTokenBalance,
      isLoading: isSelectedTokenBalanceLoading,
    } = useTokenBalance(token);

    const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");
    const [amount, _setAmount] = useState<Big | null>(() => toBig(0.0));

    const updateAmount = useCallback(
      (newAmount: string) => {
        if (newAmount.startsWith("-")) {
          return;
        }

        _setUserEnteredAmount(newAmount);

        try {
          // Try to set the amount to Big(amount):
          const bigAmount = toBig(newAmount);
          _setAmount(bigAmount);
        } catch (e) {
          // If the number was invalid, set the amount to null to disable confirming:
          _setAmount(null);
        }
      },
      [_setUserEnteredAmount, _setAmount]
    );

    const isAmountGreaterThanSelectedTokenBalance = useMemo(
      () =>
        isSelectedTokenBalanceLoading || amount === null
          ? false
          : selectedTokenBalance!.lt(amount),
      [isSelectedTokenBalanceLoading, selectedTokenBalance, amount]
    );

    return (
      <>
        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={4}
        >
          <Box width="40px" />
          <Heading fontSize="27px">{modeToTitleCaseString(mode)}</Heading>
          <IconButton
            width="20px"
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
        <Box h="1px" bg="#272727" />
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={4}
          height="100%"
        >
          <Text fontWeight="bold" fontSize="sm" textAlign="center">
            {amount !== null
              ? !amount.gt(0)
                ? `Choose which crypto you want to ${modeToLowerCaseString(
                    mode
                  )}:`
                : isSelectedTokenBalanceLoading
                ? `Loading your balance of ${selectedToken}...`
                : isAmountGreaterThanSelectedTokenBalance
                ? `You don't have enough ${selectedToken}, enter a smaller amount!`
                : "Click confirm to start earning interest:"
              : `Please enter a valid amount to ${modeToLowerCaseString(
                  mode
                )}:`}
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
                mode={mode}
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
            Confirm
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

    const { web3, address } = useAuthedWeb3();

    const [isMaxLoading, _setIsMaxLoading] = useState(false);

    const setToMax = useCallback(async () => {
      _setIsMaxLoading(true);

      const balance = await getTokenBalance(token, web3, address);

      updateAmount(balance.toString());

      _setIsMaxLoading(false);
    }, [_setIsMaxLoading, updateAmount, token, web3, address]);

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

        {mode === Mode.DEPOSIT ? (
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
            MAX
          </Button>
        ) : null}
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
        mr={4}
      />
    );
  }
);

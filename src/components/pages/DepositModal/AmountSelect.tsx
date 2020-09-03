import React, { useCallback, useState, useMemo } from "react";
import { Row, Column } from "buttered-chakra";
import {
  Heading,
  Box,
  Editable,
  EditablePreview,
  EditableInput,
  Icon,
  Button,
  Text,
  Image,
} from "@chakra-ui/core";
import DashboardBox from "../../shared/DashboardBox";
import { tokens, createTokenContract } from "../../../utils/tokenUtils";
import SmallWhiteCircle from "../../../static/small-white-circle.png";
import { useTokenBalance } from "../../../hooks/useTokenBalance";
import { toBig, divBigBy1e18 } from "../../../utils/bigUtils";
import { Mode } from ".";
import Big from "big.js";
import { useAuthedWeb3 } from "../../../context/Web3Context";

interface Props {
  selectedToken: string;
  openCoinSelect: () => any;
  mode: Mode;
}

const AmountSelect = React.memo(
  ({ selectedToken, openCoinSelect, mode }: Props) => {
    const {
      data: selectedTokenBalance,
      isLoading: isSelectedTokenBalanceLoading,
    } = useTokenBalance(tokens[selectedToken]);

    const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");
    const [amount, _setAmount] = useState<Big | null>(() => toBig(0.0));

    const updateAmount = useCallback(
      (amount: string) => {
        if (amount.startsWith("-")) {
          return;
        }

        _setUserEnteredAmount(amount);

        try {
          // Try to set the amount to Big(amount):
          const bigAmount = toBig(amount);
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
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          p={4}
        >
          <Heading fontSize="27px">Deposit</Heading>
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
                ? "Choose which crypto you want to deposit:"
                : isSelectedTokenBalanceLoading
                ? `Loading your balance of ${selectedToken}...`
                : isAmountGreaterThanSelectedTokenBalance
                ? `You don't have enough ${selectedToken}, enter a smaller amount!`
                : "Click confirm to start earning interest:"
              : "Please enter a valid amount to deposit:"}
          </Text>
          <DashboardBox width="100%" height="70px">
            <Row
              py={4}
              pl={2}
              pr={4}
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              expand
            >
              <Box overflow="hidden" p={2}>
                <Editable
                  value={userEnteredAmount.toString()}
                  onChange={updateAmount}
                  placeholder="0.0"
                  fontSize="3xl"
                  fontWeight="bold"
                  color={tokens[selectedToken].color}
                >
                  <EditablePreview />
                  <EditableInput />
                </Editable>
              </Box>

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
            bg={tokens[selectedToken].color}
            _hover={{ transform: "scale(1.02)" }}
            _active={{ transform: "scale(0.95)" }}
            color={tokens[selectedToken].overlayTextColor}
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
  }: Props & { updateAmount: (newAmount: string) => any }) => {
    const { web3, address } = useAuthedWeb3();

    const [isMaxLoading, _setIsMaxLoading] = useState(false);

    const setToMax = useCallback(async () => {
      _setIsMaxLoading(true);
      const balance = await createTokenContract(tokens[selectedToken], web3)
        .methods.balanceOf(address)
        .call();

      updateAmount(divBigBy1e18(toBig(balance)).toString());

      _setIsMaxLoading(false);
    }, [_setIsMaxLoading, updateAmount, selectedToken, web3, address]);

    return (
      <Row ml={4} mainAxisAlignment="flex-start" crossAxisAlignment="center">
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
              src={tokens[selectedToken].logoURL}
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
          MAX
        </Button>
      </Row>
    );
  }
);

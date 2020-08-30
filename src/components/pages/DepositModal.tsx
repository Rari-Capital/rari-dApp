import React, { useState, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Button,
  Editable,
  EditablePreview,
  EditableInput,
  Image,
  Heading,
  Icon,
} from "@chakra-ui/core";
import { Row, Column } from "buttered-chakra";
import DashboardBox from "../shared/DashboardBox";
import SlideIn from "../shared/SlideIn";
import { Fade } from "react-awesome-reveal";
import { Token } from "rari-tokens-generator";
import { useAuthedWeb3 } from "../../context/Web3Context";
import { divBigBy1e18, toBig, formatBig } from "../../utils/bigUtils";
import SlowlyLoadedList from "../shared/SlowlyLoadedList";
import BigWhiteCircle from "../../static/big-white-circle.png";
import SmallWhiteCircle from "../../static/small-white-circle.png";
import { tokens, createTokenContract } from "../../utils/tokenUtils";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import Big from "big.js";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

enum CurrentScreen {
  MAIN,
  COIN_SELECT,
}

enum Mode {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

const DepositModal = (props: Props) => {
  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

  const [mode, setMode] = useState(Mode.DEPOSIT);

  const [selectedToken, _setSelectedToken] = useState("DAI");

  const {
    data: selectedTokenBalance,
    isLoading: isSelectedTokenBalanceLoading,
  } = useTokenBalance(tokens[selectedToken]);

  const onSelectToken = (symbol: string) => {
    _setSelectedToken(symbol);
    setCurrentScreen(CurrentScreen.MAIN);
    updateAmount("0.0");
  };

  const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");
  const [amount, _setAmount] = useState<Big | null>(() => toBig(0.0));

  const updateAmount = (amount: string) => {
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
  };

  const [isMaxLoading, _setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    _setIsMaxLoading(true);
    const balance = await createTokenContract(tokens[selectedToken], web3)
      .methods.balanceOf(address)
      .call();

    updateAmount(divBigBy1e18(toBig(balance)).toString());

    _setIsMaxLoading(false);
  };

  const { web3, address } = useAuthedWeb3();

  const isAmountGreaterThanSelectedTokenBalance = useMemo(
    () =>
      isSelectedTokenBalanceLoading || amount === null
        ? false
        : selectedTokenBalance!.lt(amount),
    [isSelectedTokenBalanceLoading, selectedTokenBalance, amount]
  );

  return (
    <SlideIn
      isActivted={props.isOpen}
      render={(styles) => (
        <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
          <ModalOverlay />
          <ModalContent
            {...styles}
            height="300px"
            width={{ md: "450px", xs: "92%" }}
            backgroundColor="#121212"
            borderRadius="10px"
            border="1px"
            borderColor="#272727"
            color="#FFFFFF"
          >
            {currentScreen === CurrentScreen.MAIN ? (
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
                          onChange={(event) => updateAmount(event)}
                          placeholder="0.0"
                          fontSize="3xl"
                          fontWeight="bold"
                          color={tokens[selectedToken].color}
                        >
                          <EditablePreview />
                          <EditableInput />
                        </Editable>
                      </Box>

                      <Row
                        ml={4}
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="center"
                      >
                        <Row
                          mainAxisAlignment="flex-start"
                          crossAxisAlignment="center"
                          as="button"
                          onClick={() =>
                            setCurrentScreen(CurrentScreen.COIN_SELECT)
                          }
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
            ) : (
              <Fade>
                <Row
                  width="100%"
                  mainAxisAlignment="center"
                  crossAxisAlignment="center"
                  p={4}
                >
                  <Heading fontSize="27px">Select a Token</Heading>
                </Row>
                <Box h="1px" bg="#272727" />
                <TokenList tokens={tokens} onClick={onSelectToken} />
              </Fade>
            )}
          </ModalContent>
        </Modal>
      )}
    />
  );
};

export default DepositModal;

const TokenList = ({
  tokens,
  onClick,
}: {
  tokens: { [key: string]: Token };
  onClick: (symbol: string) => any;
}) => {
  const tokenKeys = Object.keys(tokens);
  tokenKeys.sort();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      pt={4}
      px={4}
      height="230px"
      width="400px"
      overflowY="auto"
    >
      <SlowlyLoadedList
        length={tokenKeys.length}
        chunkAmount={10}
        chunkDelayMs={500}
        renderItem={(index) => {
          const token = tokens[tokenKeys[index]];

          return (
            <TokenRow key={token.address} token={token} onClick={onClick} />
          );
        }}
      />
    </Column>
  );
};

const TokenRow = (props: {
  token: Token;
  onClick: (symbol: string) => any;
}) => {
  const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
    props.token
  );

  return (
    <Row
      flexShrink={0}
      as="button"
      onClick={() => props.onClick(props.token.symbol)}
      mb={4}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
    >
      <Box height="45px" width="45px" borderRadius="50%" mr={2}>
        <Image
          width="100%"
          height="100%"
          borderRadius="50%"
          backgroundImage={`url(${BigWhiteCircle})`}
          src={props.token.logoURL}
          alt=""
        />
      </Box>
      <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
        <Heading fontSize="20px" color={props.token.color}>
          {props.token.symbol}
        </Heading>
        <Text fontWeight="thin" fontSize="15px">
          {isBalanceLoading ? "$?" : formatBig(balance!)}
        </Text>
      </Column>
    </Row>
  );
};

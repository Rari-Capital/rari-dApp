import React, {
  useState,
  useMemo,
  useCallback,
  CSSProperties,
  useEffect,
} from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/core";
import { Row, Column } from "buttered-chakra";
import DashboardBox from "../shared/DashboardBox";
import SlideIn from "../shared/SlideIn";
import { Fade } from "react-awesome-reveal";

import { useAuthedWeb3 } from "../../context/Web3Context";
import { divBigBy1e18, toBig, formatBig } from "../../utils/bigUtils";

import BigWhiteCircle from "../../static/big-white-circle.png";
import SmallWhiteCircle from "../../static/small-white-circle.png";
import { tokens, createTokenContract } from "../../utils/tokenUtils";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import Big from "big.js";
import { FixedSizeList as List, areEqual } from "react-window";

enum CurrentScreen {
  MAIN,
  COIN_SELECT,
}

enum Mode {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = React.memo((props: Props) => {
  const { web3, address } = useAuthedWeb3();

  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

  const openCoinSelect = useCallback(
    () => setCurrentScreen(CurrentScreen.COIN_SELECT),
    [setCurrentScreen]
  );

  useEffect(() => {
    // When the modal closes return to the main screen.
    if (!props.isOpen) {
      setCurrentScreen(CurrentScreen.MAIN);
    }
  }, [props.isOpen]);

  const [mode, setMode] = useState(Mode.DEPOSIT);

  const [selectedToken, _setSelectedToken] = useState("DAI");

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

  const onSelectToken = useCallback(
    (symbol: string) => {
      _setSelectedToken(symbol);
      setCurrentScreen(CurrentScreen.MAIN);
      updateAmount("0.0");
    },
    [_setSelectedToken, setCurrentScreen, updateAmount]
  );

  const [isMaxLoading, _setIsMaxLoading] = useState(false);

  const setToMax = useCallback(async () => {
    _setIsMaxLoading(true);
    const balance = await createTokenContract(tokens[selectedToken], web3)
      .methods.balanceOf(address)
      .call();

    updateAmount(divBigBy1e18(toBig(balance)).toString());

    _setIsMaxLoading(false);
  }, [_setIsMaxLoading, updateAmount, selectedToken, web3, address]);

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
              <TokenSelect onSelectToken={onSelectToken} />
            )}
          </ModalContent>
        </Modal>
      )}
    />
  );
});

export default DepositModal;

const TokenSelect = React.memo(
  (props: { onSelectToken: (symbol: string) => any }) => {
    const [searchNeedle, setSearchNeedle] = useState("");

    const tokenKeys = useMemo(
      () =>
        searchNeedle === ""
          ? Object.keys(tokens)
          : Object.keys(tokens).filter((symbol) =>
              symbol.toLowerCase().startsWith(searchNeedle.toLowerCase())
            ),
      [searchNeedle]
    );

    return (
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
        <InputGroup mb={2} mx={4}>
          <InputLeftElement
            ml={-1}
            children={<Icon name="search" color="gray.300" />}
          />
          <Input
            variant="flushed"
            type="tel"
            roundedLeft="0"
            placeholder="Try searching for 'DAI'"
            focusBorderColor="#FFFFFF"
            value={searchNeedle}
            onChange={(event: any) => setSearchNeedle(event.target.value)}
          />
        </InputGroup>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          pt={1}
          px={4}
          width="100%"
        >
          <TokenList tokenKeys={tokenKeys} onClick={props.onSelectToken} />
        </Column>
      </Fade>
    );
  }
);

const TokenRow = React.memo(
  ({
    data,
    index,
    style,
  }: {
    index: number;
    style: CSSProperties;
    data: { tokenKeys: string[]; onClick: (symbol: string) => any };
  }) => {
    const token = tokens[data.tokenKeys[index]];

    const { data: balance, isLoading: isBalanceLoading } = useTokenBalance(
      token
    );

    return (
      <div style={style}>
        <Row
          flexShrink={0}
          as="button"
          onClick={() => data.onClick(token.symbol)}
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
              src={token.logoURL}
              alt=""
            />
          </Box>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
          >
            <Heading fontSize="20px" color={token.color}>
              {token.symbol}
            </Heading>
            <Text fontWeight="thin" fontSize="15px">
              {isBalanceLoading ? "$?" : formatBig(balance!)}
            </Text>
          </Column>
        </Row>
      </div>
    );
  },
  areEqual
);

const TokenList = React.memo(
  ({
    tokenKeys,
    onClick,
  }: {
    tokenKeys: string[];
    onClick: (symbol: string) => any;
  }) => {
    const sortedKeys = useMemo(() => {
      return [...tokenKeys].sort();
    }, [tokenKeys]);

    const itemData = useMemo(
      () => ({
        tokenKeys: sortedKeys,
        onClick,
      }),
      [sortedKeys, onClick]
    );

    return (
      <List
        height={175}
        itemCount={sortedKeys.length}
        itemKey={(index, data) => data.tokenKeys[index]}
        itemSize={55}
        width={415}
        itemData={itemData}
        overscanCount={3}
      >
        {TokenRow}
      </List>
    );
  }
);

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Select,
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
import { useTokens, createTokenContract } from "../../context/TokensContext";
import { useAuthedWeb3 } from "../../context/Web3Context";
import { divBigBy1e18, toBig } from "../../utils/1e18";

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
  const initialRef = React.useRef();

  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

  const [mode, setMode] = useState(Mode.DEPOSIT);

  const [selectedToken, setSelectedToken] = useState("DAI");

  const [userEnteredAmount, _setUserEnteredAmount] = useState("0.0");
  const [amount, _setAmount] = useState<number | null>(0.0);

  const updateAmount = (amount: string) => {
    _setUserEnteredAmount(amount);

    const parsed = parseFloat(amount);
    // If the number converted version of the user input is not a number:
    if (isNaN(parsed)) {
      // Set the amount to null to disable confirming.
      _setAmount(null);
    } else {
      // Set the amount to the parsed amount.
      _setAmount(parsed);
    }
  };

  const { web3, address } = useAuthedWeb3();

  const tokens = useTokens();

  const setToMax = async () => {
    const balance = await createTokenContract(tokens[selectedToken], web3)
      .methods.balanceOf(address)
      .call();

    updateAmount(divBigBy1e18(toBig(balance)).toString());
  };

  return (
    <SlideIn
      isActivted={props.isOpen}
      render={(styles) => (
        <Modal
          //@ts-ignore
          initialFocusRef={initialRef}
          isOpen={props.isOpen}
          onClose={props.onClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            {...styles}
            height={{ md: "300px", xs: "350px" }}
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
                  height="65px"
                  width="100%"
                  mainAxisAlignment="center"
                  crossAxisAlignment="center"
                  py={4}
                  pl={4}
                  pr={3}
                >
                  <Select
                    value={mode}
                    onChange={(event) =>
                      setMode(
                        event.target.value === "Deposit"
                          ? Mode.DEPOSIT
                          : Mode.WITHDRAW
                      )
                    }
                    style={{ textAlignLast: "center", marginLeft: "15px" }}
                    fontSize="2xl"
                    fontWeight="bold"
                    variant="unstyled"
                    iconSize="27px"
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdraw">Withdraw</option>
                  </Select>
                </Row>
                <Box h="1px" bg="#272727" />
                <Column
                  mainAxisAlignment="space-between"
                  crossAxisAlignment="center"
                  p={4}
                  height="100%"
                >
                  <Text fontWeight="bold" fontSize="sm">
                    {amount != null
                      ? amount === 0
                        ? "Choose which crypto you want to deposit:"
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
                          color="#F3B85D"
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
                        <Box
                          height="25px"
                          width="25px"
                          borderRadius="50%"
                          bg="white"
                          mr={2}
                        >
                          <Image
                            borderRadius="50%"
                            src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
                          />
                        </Box>
                        <Row
                          mainAxisAlignment="flex-start"
                          crossAxisAlignment="center"
                          as="button"
                          onClick={() =>
                            setCurrentScreen(CurrentScreen.COIN_SELECT)
                          }
                        >
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
                    bg="#F3B85D"
                    isDisabled={
                      // Disable the button if the user entered amount is not valid.
                      !amount
                    }
                    ref={initialRef}
                    _hover={{ transform: "scale(1.02)" }}
                    _active={{ transform: "scale(0.95)" }}
                  >
                    Confirm
                  </Button>
                </Column>
              </>
            ) : (
              <Fade>
                <Text>Coin Select</Text>
              </Fade>
            )}
          </ModalContent>
        </Modal>
      )}
    />
  );
};

export default DepositModal;

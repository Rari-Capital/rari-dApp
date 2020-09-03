import React, { useState, useCallback, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/core";
import SlideIn from "../../shared/SlideIn";
import { TokenSelect } from "./TokenSelect";
import AmountSelect from "./AmountSelect";

enum CurrentScreen {
  MAIN,
  COIN_SELECT,
}

export enum Mode {
  DEPOSIT,
  WITHDRAW,
}

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = React.memo((props: Props) => {
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

  const [selectedToken, _setSelectedToken] = useState("DAI");

  const onSelectToken = useCallback(
    (symbol: string) => {
      _setSelectedToken(symbol);
      setCurrentScreen(CurrentScreen.MAIN);
    },
    [_setSelectedToken, setCurrentScreen]
  );

  const [mode, setMode] = useState(Mode.DEPOSIT);

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
              <AmountSelect
                selectedToken={selectedToken}
                openCoinSelect={openCoinSelect}
                mode={mode}
              />
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

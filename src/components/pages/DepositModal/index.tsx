import React, { useState, useCallback, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/core";
import ModalAnimation from "../../shared/ModalAnimation";
import TokenSelect from "./TokenSelect";
import AmountSelect from "./AmountSelect";
import OptionsMenu from "./OptionsMenu";
import { MODAL_PROPS } from "../../shared/Modal";
import { Pool, usePoolType } from "../../../context/PoolContext";

enum CurrentScreen {
  MAIN,
  COIN_SELECT,
  OPTIONS,
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

  const openOptions = useCallback(
    () => setCurrentScreen(CurrentScreen.OPTIONS),
    [setCurrentScreen]
  );

  const openAmountSelect = useCallback(
    () => setCurrentScreen(CurrentScreen.MAIN),
    [setCurrentScreen]
  );

  useEffect(() => {
    // When the modal closes return to the main screen.
    if (!props.isOpen) {
      setCurrentScreen(CurrentScreen.MAIN);
    }
  }, [props.isOpen]);

  const poolType = usePoolType();

  const [selectedToken, setSelectedToken] = useState(() => {
    if (poolType === Pool.ETH) {
      return "ETH";
    } else {
      return "USDC";
    }
  });

  const [mode, setMode] = useState(Mode.DEPOSIT);

  return (
    <ModalAnimation
      isActivted={props.isOpen}
      render={(styles) => (
        <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
          <ModalOverlay />
          <ModalContent
            {...styles}
            {...MODAL_PROPS}
            height={{ md: "320px", xs: "350px" }}
          >
            {currentScreen === CurrentScreen.MAIN ? (
              <AmountSelect
                openCoinSelect={openCoinSelect}
                openOptions={openOptions}
                selectedToken={selectedToken}
                mode={mode}
              />
            ) : currentScreen === CurrentScreen.COIN_SELECT ? (
              <TokenSelect
                onClose={openAmountSelect}
                onSelectToken={setSelectedToken}
                mode={mode}
              />
            ) : (
              <OptionsMenu
                onClose={openAmountSelect}
                onSetMode={setMode}
                mode={mode}
              />
            )}
          </ModalContent>
        </Modal>
      )}
    />
  );
});

export default DepositModal;

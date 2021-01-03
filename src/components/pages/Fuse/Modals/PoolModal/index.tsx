import React, { useCallback, useState } from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";

import AmountSelect from "./AmountSelect";
import { MODAL_PROPS } from "../../../../shared/Modal";
import OptionsMenu from "./OptionsMenu";

interface Props {
  isOpen: boolean;
  onClose: () => any;
  token: string;
  depositSide: boolean;
}

enum CurrentScreen {
  MAIN,
  OPTIONS,
}

export enum Mode {
  SUPPLY = "Supply",
  WITHDRAW = "Withdraw",
  BORROW = "Borrow",
  REPAY = "Repay",
}

const DepositModal = React.memo((props: Props) => {
  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

  const openAmountSelect = useCallback(
    () => setCurrentScreen(CurrentScreen.MAIN),
    [setCurrentScreen]
  );
  const openOptions = useCallback(
    () => setCurrentScreen(CurrentScreen.OPTIONS),
    [setCurrentScreen]
  );

  const [mode, setMode] = useState(
    props.depositSide ? Mode.SUPPLY : Mode.REPAY
  );

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={props.isOpen}
      onClose={props.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        {...MODAL_PROPS}
        height={{
          md: "500px",
          base: "500px",
        }}
      >
        {currentScreen === CurrentScreen.MAIN ? (
          <AmountSelect
            onClose={props.onClose}
            mode={mode}
            openOptions={openOptions}
            token={props.token}
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
  );
});

export default DepositModal;

import React, { useState, useCallback, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";

import AmountSelect, { requiresSFIStaking } from "./AmountSelect";
import OptionsMenu from "./OptionsMenu";
import { MODAL_PROPS } from "../../../shared/Modal";
import { TranchePool, TrancheRating } from "../TranchesPage";

enum CurrentScreen {
  MAIN,
  OPTIONS,
}

export enum Mode {
  DEPOSIT,
  WITHDRAW,
}

interface Props {
  isOpen: boolean;

  onClose: () => any;

  tranchePool: TranchePool;
  trancheRating: TrancheRating;
}

const DepositModal = React.memo((props: Props) => {
  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

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

  const [mode, setMode] = useState(Mode.DEPOSIT);

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
          md: requiresSFIStaking(props.trancheRating) ? "380px" : "295px",
          base: requiresSFIStaking(props.trancheRating) ? "390px" : "310px",
        }}
      >
        {currentScreen === CurrentScreen.MAIN ? (
          <AmountSelect
            onClose={props.onClose}
            openOptions={openOptions}
            mode={mode}
            tranchePool={props.tranchePool}
            trancheRating={props.trancheRating}
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

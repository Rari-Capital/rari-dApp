import React from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";

import AmountSelect, { requiresSFIStaking } from "./AmountSelect";

import { MODAL_PROPS } from "../../../shared/Modal";
import { TranchePool, TrancheRating } from "hooks/tranches/useSaffronData";
interface Props {
  isOpen: boolean;

  onClose: () => any;

  tranchePool: TranchePool;
  trancheRating: TrancheRating;
}

const DepositModal = (props: Props) => {
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
        <AmountSelect
          onClose={props.onClose}
          tranchePool={props.tranchePool}
          trancheRating={props.trancheRating}
        />
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;

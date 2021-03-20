import {
  Modal,
  ModalOverlay,
  ModalContent,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import { Column } from "buttered-chakra";
import React, { useRef, useEffect } from "react";

import { MODAL_PROPS } from "./Modal";

import { useRari } from "../../context/RariContext";
import { useTranslation } from "react-i18next";

function noop() {}

const ForceAuthModal = React.memo(() => {
  const { isAuthed } = useRari();

  return !isAuthed ? <GetOrConnectModal /> : null;
});

const GetOrConnectModal = () => {
  const { t } = useTranslation();

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  return (
    <Modal
      isOpen
      isCentered
      onClose={noop}
      blockScrollOnMount={false}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS} overflow="hidden">
        <Column
          height="300px"
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
        >
          <Spinner size="lg" />

          <Heading size="md" mt={8}>
            {t("Connecting to your wallet...")}
          </Heading>
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default ForceAuthModal;

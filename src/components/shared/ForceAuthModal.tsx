import {
  Modal,
  ModalOverlay,
  ModalContent,
  Heading,
  Spinner,
  Box,
  Icon,
} from "@chakra-ui/react";
import { Center, Column, useIsMobile } from "buttered-chakra";
import React, { useRef, useEffect, useState } from "react";
import { VscDebugDisconnect } from "react-icons/vsc";

import { MODAL_PROPS } from "./Modal";

import { useRari } from "../../context/RariContext";
import { useTranslation } from "react-i18next";

function noop() {}

const ForceAuthModal = React.memo(() => {
  const { isAuthed } = useRari();

  return !isAuthed ? <GetOrConnectModal /> : null;
});

export const AuthModal = React.memo(({ forceAuth = false } : { forceAuth?: boolean} ) => {
  return forceAuth ? <GetOrConnectModal /> : null;
});

const GetOrConnectModal = () => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const { login } = useRari();

  const [isLoading, setLoading] = useState(false);

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
        {isMobile ? (
          isLoading ? (
            <Center height="150px" width="100%">
              <Spinner size="lg" />
            </Center>
          ) : (
            <Box
              as="button"
              display="flex"
              _focus={{ bg: "#1a1a1a", outline: "none" }}
              flexDirection="column"
              height="150px"
              width="100%"
              justifyContent="center"
              alignItems="center"
              onClick={() => {
                const loadAndLogin = async () => {
                  setLoading(true);

                  try {
                    await login();
                  } catch (_) {}

                  if (componentIsMounted.current) {
                    setLoading(false);
                  }
                };

                loadAndLogin();
              }}
            >
              <Icon as={VscDebugDisconnect} boxSize="40px" mb={4} />
              <Heading fontSize="25px" textAlign="center">
                {t("Connect Wallet")}
              </Heading>
            </Box>
          )
        ) : (
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
        )}
      </ModalContent>
    </Modal>
  );
};

export default ForceAuthModal;

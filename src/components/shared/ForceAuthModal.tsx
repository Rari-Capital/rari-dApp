import {
  Modal,
  ModalOverlay,
  ModalContent,
  Heading,
  Box,
  Spinner,
  Link,
  Icon,
} from "@chakra-ui/react";
import { Center, Column } from "buttered-chakra";
import React, { useCallback, useState, useRef, useEffect } from "react";

import { MODAL_PROPS } from "./Modal";
import { VscDebugDisconnect } from "react-icons/vsc";
import { FaWallet } from "react-icons/fa";
import { useRari } from "../../context/RariContext";
import { useTranslation } from "react-i18next";

function noop() {}

const ForceAuthModal = React.memo(() => {
  const { isAuthed } = useRari();

  return !isAuthed ? <GetOrConnectModal /> : null;
});

const GetOrConnectModal = React.memo(() => {
  const { login } = useRari();

  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(false);

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  const connectWallet = useCallback(() => {
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
  }, [setLoading, login]);

  return (
    <Modal isOpen isCentered onClose={noop} blockScrollOnMount={false}>
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS} overflow="hidden">
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          expand
        >
          {isLoading ? (
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
              onClick={connectWallet}
            >
              <Icon as={VscDebugDisconnect} boxSize="40px" mb={4} />
              <Heading fontSize="25px" textAlign="center">
                {t("Connect Wallet")}
              </Heading>
            </Box>
          )}

          <Box h="1px" width="100%" bg="#272727" />

          <Link
            height="150px"
            width="100%"
            isExternal
            href="https://ethereum.org/en/wallets/"
            textDecoration="none !important"
            _focus={{ bg: "#1a1a1a" }}
          >
            <Column
              expand
              crossAxisAlignment="center"
              mainAxisAlignment="center"
            >
              <Icon as={FaWallet} boxSize="40px" mb={4} />
              <Heading fontSize="25px" textAlign="center">
                {t("Get Wallet")}
              </Heading>
            </Column>
          </Link>
        </Column>
      </ModalContent>
    </Modal>
  );
});

export default ForceAuthModal;

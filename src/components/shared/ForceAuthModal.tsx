import {
  Modal,
  ModalOverlay,
  ModalContent,
  Heading,
  Box,
  Spinner,
  Link,
  PseudoBox,
} from "@chakra-ui/core";
import { Center, Column } from "buttered-chakra";
import React, { useCallback, useState } from "react";

import { MODAL_PROPS } from "./Modal";
import { VscDebugDisconnect } from "react-icons/vsc";
import { FaWallet } from "react-icons/fa";
import { useWeb3 } from "../../context/Web3Context";
import { useTranslation } from "react-i18next";

const ForceAuthModal = React.memo(() => {
  const { isAuthed } = useWeb3();

  return !isAuthed ? <GetOrConnectModal /> : null;
});

const GetOrConnectModal = React.memo(() => {
  const { login } = useWeb3();

  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(false);

  const connectWallet = useCallback(() => {
    let isCanceled = false;

    const loadAndLogin = async () => {
      setLoading(true);

      try {
        await login();
      } catch (_) {}

      if (!isCanceled) {
        setLoading(false);
      }
    };

    loadAndLogin();

    return () => (isCanceled = true);
  }, [setLoading, login]);

  return (
    <Modal isOpen={true} isCentered>
      <ModalOverlay zIndex={1} />
      <ModalContent
        zIndex={1}
        {...MODAL_PROPS}
        height="300px"
        flexShrink={0}
        overflow="hidden"
      >
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          expand
        >
          {isLoading ? (
            <Center expand>
              <Spinner size="lg" />
            </Center>
          ) : (
            <PseudoBox
              as="button"
              display="flex"
              _focus={{ bg: "#1a1a1a", outline: "none" }}
              flexDirection="column"
              height="100%"
              width="100%"
              justifyContent="center"
              alignItems="center"
              onClick={connectWallet}
            >
              <Box as={VscDebugDisconnect} size="40px" mb={4} />
              <Heading fontSize="25px" textAlign="center">
                {t("Connect Wallet")}
              </Heading>
            </PseudoBox>
          )}

          <Box h="1px" width="100%" bg="#272727" />

          <Link
            height="100%"
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
              <Box as={FaWallet} size="40px" mb={4} />
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

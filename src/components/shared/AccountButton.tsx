import React, { useCallback } from "react";
import { useWeb3 } from "../../context/Web3Context";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Text,
} from "@chakra-ui/core";
import { useIsMobile, Row, Column } from "buttered-chakra";
import DashboardBox from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress, mediumAddress } from "../../utils/shortAddress";

import ModalAnimation from "./ModalAnimation";
import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalDivider, ModalTitleWithCloseButton } from "./Modal";
import { LanguageSelect } from "./TranslateButton";
import { useNavigate } from "react-router-dom";

function noop() {}

export const AccountButton = React.memo(() => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  return (
    <>
      <SettingsModal isOpen={isModalOpen} onClose={closeModal} />
      <AddressButton openModal={openModal} />
    </>
  );
});

const AddressButton = React.memo(({ openModal }: { openModal: () => any }) => {
  const { isAuthed, address } = useWeb3();

  const isMobile = useIsMobile();

  return (
    <DashboardBox
      as="button"
      height="40px"
      width={{
        md: "245px",
        xs: "auto",
      }}
      onClick={isAuthed ? openModal : noop}
    >
      <Row
        expand
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        px={3}
      >
        <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />

        <Text ml={2} fontWeight="semibold">
          {isMobile ? shortAddress(address) : mediumAddress(address)}
        </Text>
      </Row>
    </DashboardBox>
  );
});

export const SettingsModal = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => any }) => {
    const { logout, login } = useWeb3();

    const onSwitchWallet = useCallback(() => {
      onClose();
      setTimeout(() => login(), 100);
    }, [login, onClose]);

    const navigate = useNavigate();

    const onLogout = useCallback(() => {
      logout();
      navigate("/");
    }, [logout, navigate]);

    const { t } = useTranslation();

    return (
      <ModalAnimation
        isActivted={isOpen}
        render={(styles) => (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent {...styles} {...MODAL_PROPS}>
              <ModalTitleWithCloseButton
                text={t("Account")}
                onClose={onClose}
              />
              <ModalDivider />
              <Column
                width="100%"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                p={4}
              >
                <Button
                  leftIcon="repeat"
                  bg="whatsapp.500"
                  width="100%"
                  height="45px"
                  fontSize="xl"
                  borderRadius="7px"
                  fontWeight="bold"
                  onClick={onSwitchWallet}
                  _hover={{}}
                  _active={{}}
                >
                  {t("Switch Wallet")}
                </Button>

                <Button
                  my={4}
                  leftIcon="unlock"
                  bg="red.500"
                  width="100%"
                  height="45px"
                  fontSize="xl"
                  borderRadius="7px"
                  fontWeight="bold"
                  onClick={onLogout}
                  _hover={{}}
                  _active={{}}
                >
                  {t("Disconnect")}
                </Button>

                <LanguageSelect />
              </Column>
            </ModalContent>
          </Modal>
        )}
      />
    );
  }
);

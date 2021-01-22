import React from "react";
import { useRari } from "../../context/RariContext";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Text,
} from "@chakra-ui/react";

import { Row, Column, Center, useIsMobile } from "buttered-chakra";
import DashboardBox from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress } from "../../utils/shortAddress";

import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalDivider, ModalTitleWithCloseButton } from "./Modal";
import { LanguageSelect } from "./TranslateButton";

import { GlowingButton } from "./GlowingButton";
import { ClaimRGTModal } from "./ClaimRGTModal";
import { version } from "../..";

import MoonpayModal from "../pages/MoonpayModal";

export const AccountButton = React.memo(() => {
  const {
    isOpen: isSettingsModalOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure();

  const {
    isOpen: isClaimRGTModalOpen,
    onOpen: openClaimRGTModal,
    onClose: closeClaimRGTModal,
  } = useDisclosure();

  const {
    isOpen: isMoonpayModalOpen,
    onOpen: openMoonpayModal,
    onClose: closeMoonpayModal,
  } = useDisclosure();

  return (
    <>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        openClaimRGTModal={openClaimRGTModal}
        openMoonpayModal={openMoonpayModal}
      />
      <ClaimRGTModal
        isOpen={isClaimRGTModalOpen}
        onClose={closeClaimRGTModal}
      />
      <MoonpayModal isOpen={isMoonpayModalOpen} onClose={closeMoonpayModal} />
      <Buttons
        openModal={openSettingsModal}
        openClaimRGTModal={openClaimRGTModal}
        openMoonpayModal={openMoonpayModal}
      />
    </>
  );
});

const Buttons = ({
  openModal,
  openClaimRGTModal,
  openMoonpayModal,
}: {
  openModal: () => any;
  openClaimRGTModal: () => any;
  openMoonpayModal: () => any;
}) => {
  const { address } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? null : (
        <>
          <DashboardBox
            as="button"
            flexShrink={0}
            width="110px"
            height="40px"
            fontWeight="bold"
            onClick={openMoonpayModal}
          >
            <Center expand>{t("Buy Crypto")}</Center>
          </DashboardBox>
          <DashboardBox
            ml={4}
            as="button"
            height="40px"
            flexShrink={0}
            width="100px"
            onClick={openClaimRGTModal}
            fontWeight="bold"
          >
            <Center expand>{t("Claim RGT")}</Center>
          </DashboardBox>
        </>
      )}

      <DashboardBox
        ml={{ md: 4, base: 0 }}
        as="button"
        height="40px"
        flexShrink={0}
        width="auto"
        onClick={openModal}
      >
        <Row
          expand
          mainAxisAlignment="space-around"
          crossAxisAlignment="center"
          px={3}
        >
          <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />

          <Text ml={2} fontWeight="semibold">
            {shortAddress(address)}
          </Text>
        </Row>
      </DashboardBox>
    </>
  );
};

export const SettingsModal = ({
  isOpen,
  onClose,
  openClaimRGTModal,
  openMoonpayModal,
}: {
  isOpen: boolean;
  onClose: () => any;
  openClaimRGTModal: () => any;
  openMoonpayModal: () => any;
}) => {
  const { t } = useTranslation();

  const { login } = useRari();

  const onSwitchWallet = () => {
    onClose();
    setTimeout(() => login(), 100);
  };

  const onClaimRGT = () => {
    onClose();
    setTimeout(() => openClaimRGTModal(), 100);
  };

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <ModalTitleWithCloseButton text={t("Account")} onClose={onClose} />

        <ModalDivider />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={4}
        >
          <GlowingButton
            label={t("Claim RGT")}
            onClick={onClaimRGT}
            width="100%"
            height="51px"
            mb={4}
          />

          <Button
            bg="red.500"
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={openMoonpayModal}
            _hover={{}}
            _active={{}}
            mb={4}
          >
            {t("Buy Crypto")}
          </Button>

          <Button
            bg="whatsapp.500"
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={onSwitchWallet}
            _hover={{}}
            _active={{}}
            mb={4}
          >
            {t("Switch Wallet")}
          </Button>

          <LanguageSelect />

          <Text mt={4} fontSize="10px">
            Version {version}
          </Text>
        </Column>
      </ModalContent>
    </Modal>
  );
};

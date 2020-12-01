import React, { useCallback } from "react";
import { useRari } from "../../context/RariContext";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Text,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { Row, Column, Center } from "buttered-chakra";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress } from "../../utils/shortAddress";

import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalDivider, ModalTitleWithCloseButton } from "./Modal";
import { LanguageSelect } from "./TranslateButton";

import { GlowingButton } from "./GlowingButton";
import { ClaimRGTModal } from "./ClaimRGTModal";
import { version } from "../..";
import { VerifiedBadge } from "./VerifiedBadge";
import { useQuery } from "react-query";

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

  return (
    <>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        openClaimRGTModal={openClaimRGTModal}
      />
      <ClaimRGTModal
        isOpen={isClaimRGTModalOpen}
        onClose={closeClaimRGTModal}
      />
      <AddressButton
        openModal={openSettingsModal}
        openClaimRGTModal={openClaimRGTModal}
      />
    </>
  );
});

const AddressButton = React.memo(
  ({
    openModal,
    openClaimRGTModal,
  }: {
    openModal: () => any;
    openClaimRGTModal: () => any;
  }) => {
    const { address } = useRari();

    const { data: isVerified } = useQuery(address + " isVerified", async () => {
      const fetched = await fetch(
        `https://api-mainnet.rarible.com/profiles/${address}`
      );

      const json: { badges: string[] } = await fetched.json();

      if (json.badges.includes("VERIFIED")) {
        return true;
      } else {
        return false;
      }
    });

    return (
      <>
        <DashboardBox
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
            {isVerified ? (
              <VerifiedBadge />
            ) : (
              <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />
            )}

            <Text ml={2} fontWeight="semibold">
              {shortAddress(address)}
            </Text>
          </Row>
        </DashboardBox>
        <DashboardBox
          ml={DASHBOARD_BOX_SPACING.asPxString()}
          as="button"
          height="40px"
          flexShrink={0}
          width="100px"
          onClick={openClaimRGTModal}
          fontWeight="bold"
        >
          <Center expand>Claim RGT</Center>
        </DashboardBox>
      </>
    );
  }
);

export const SettingsModal = React.memo(
  ({
    isOpen,
    onClose,
    openClaimRGTModal,
  }: {
    isOpen: boolean;
    onClose: () => any;
    openClaimRGTModal: () => any;
  }) => {
    const { t } = useTranslation();

    const { login } = useRari();

    const onSwitchWallet = useCallback(() => {
      onClose();
      setTimeout(() => login(), 100);
    }, [login, onClose]);

    const onClaimRGT = useCallback(() => {
      onClose();
      setTimeout(() => openClaimRGTModal(), 100);
    }, [onClose, openClaimRGTModal]);

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
            p={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <GlowingButton
              label={t("Claim RGT")}
              onClick={onClaimRGT}
              width="100%"
              height="51px"
              mb={DASHBOARD_BOX_SPACING.asPxString()}
            />

            <Button
              leftIcon={<RepeatIcon />}
              bg="whatsapp.500"
              width="100%"
              height="45px"
              fontSize="xl"
              borderRadius="7px"
              fontWeight="bold"
              onClick={onSwitchWallet}
              _hover={{}}
              _active={{}}
              mb={DASHBOARD_BOX_SPACING.asPxString()}
            >
              {t("Switch Wallet")}
            </Button>

            <LanguageSelect />

            <Text mt={DASHBOARD_BOX_SPACING.asPxString()} fontSize="10px">
              Version {version}
            </Text>
          </Column>
        </ModalContent>
      </Modal>
    );
  }
);

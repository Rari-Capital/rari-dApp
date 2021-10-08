import { memo, useCallback } from "react";
import { useRari } from "../../context/RariContext";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Link,
  Text,
  Spinner,
} from "@chakra-ui/react";

import { Row, Column, Center } from "utils/chakraUtils";
import DashboardBox from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress } from "../../utils/shortAddress";

import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalDivider, ModalTitleWithCloseButton } from "./Modal";
import { LanguageSelect } from "./TranslateButton";

import { DarkGlowingButton, GlowingButton } from "./GlowingButton";
import { ClaimRGTModal } from "./ClaimRGTModal";
import { version } from "../..";

import { useIsSmallScreen } from "../../hooks/useIsSmallScreen";
import { useAuthedCallback } from "../../hooks/useAuthedCallback";
import { useClaimable } from "hooks/rewards/useClaimable";

export const AccountButton = memo(() => {
  const {
    isOpen: isSettingsModalOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure();

  const authedOpenSettingsModal = useAuthedCallback(openSettingsModal);

  const {
    isOpen: isClaimRGTModalOpen,
    onOpen: openClaimRGTModal,
    onClose: closeClaimRGTModal,
  } = useDisclosure();

  const authedOpenClaimRGTModal = useAuthedCallback(openClaimRGTModal);

  const { hasClaimableRewards } = useClaimable();

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
      <Buttons
        openModal={authedOpenSettingsModal}
        openClaimRGTModal={authedOpenClaimRGTModal}
        hasClaimableRewards={hasClaimableRewards}
      />
    </>
  );
});

const Buttons = ({
  openModal,
  openClaimRGTModal,
  hasClaimableRewards,
}: {
  openModal: () => any;
  openClaimRGTModal: () => any;
  hasClaimableRewards: boolean;
}) => {
  const { address, isAuthed, login, isAttemptingLogin } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  const handleAccountButtonClick = useCallback(() => {
    if (isAuthed) {
      openModal();
    } else login();
  }, [isAuthed, login, openModal]);

  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      {isMobile ? null : (
        <>
          {hasClaimableRewards ? (
            <DarkGlowingButton
              label={t("Claim")}
              onClick={openClaimRGTModal}
              height="40px"
              flexShrink={0}
              width="95px"
              fontSize="15px"
              fontWeight="bold"
            />
          ) : (
            <DashboardBox
              ml={1}
              as="button"
              height="40px"
              flexShrink={0}
              width="95px"
              fontSize="15px"
              fontWeight="bold"
              onClick={openClaimRGTModal}
            >
              <Center expand>{t("Claim")}</Center>
            </DashboardBox>
          )}
        </>
      )}

      {/* Connect + Account button */}
      <DashboardBox
        ml={isMobile ? 0 : 4}
        as="button"
        height="40px"
        flexShrink={0}
        flexGrow={0}
        width="133px"
        onClick={handleAccountButtonClick}
      >
        <Row
          expand
          mainAxisAlignment="space-around"
          crossAxisAlignment="center"
          px={3}
          py={1}
        >
          {/* Conditionally display Connect button or Account button */}
          {!isAuthed ? (
            isAttemptingLogin ? (
              <Spinner />
            ) : (
              <Text fontWeight="semibold">{t("Connect")}</Text>
            )
          ) : (
            <>
              <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />
              <Text ml={2} fontWeight="semibold">
                {shortAddress(address)}
              </Text>
            </>
          )}
        </Row>
      </DashboardBox>
    </Row>
  );
};

export const SettingsModal = ({
  isOpen,
  onClose,
  openClaimRGTModal,
}: {
  isOpen: boolean;
  onClose: () => any;
  openClaimRGTModal: () => any;
}) => {
  const { t } = useTranslation();

  const { login, logout } = useRari();

  const onSwitchWallet = () => {
    onClose();
    setTimeout(() => login(false), 100);
  };

  const handleDisconnectClick = () => {
    onClose();
    logout();
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
          <GlowingButton onClick={onClaimRGT} width="100%" height="51px" mb={4}>
            {t("Claim")}
          </GlowingButton>

          <Button
            bg={"whatsapp.500"}
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

          <Button
            bg="red.500"
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={handleDisconnectClick}
            _hover={{}}
            _active={{}}
            mb={4}
          >
            {t("Disconnect")}
          </Button>

          <LanguageSelect />

          <Row
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            mt={4}
            width="100%"
          >
            <Link isExternal href="https://docs.rari.capital/">
              <Text mx={2} text="sm" textDecoration="underline">
                {t("Developer Docs")}
              </Text>
            </Link>
            <Link
              isExternal
              href="https://www.notion.so/Rari-Capital-3d762a07d2c9417e9cd8c2e4f719e4c3"
            >
              <Text mx={2} text="sm" textDecoration="underline">
                {t("Learn")}
              </Text>
            </Link>
            <Link
              isExternal
              href="https://info.rari.capital/security/#smart-contract-audits"
            >
              <Text mx={2} text="sm" textDecoration="underline">
                {t("Audits")}
              </Text>
            </Link>
          </Row>

          <Text mt={4} fontSize="10px">
            {t("Version")} {version}
          </Text>
        </Column>
      </ModalContent>
    </Modal>
  );
};

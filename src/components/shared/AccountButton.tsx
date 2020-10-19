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
import DashboardBox, { DASHBOARD_BOX_SPACING } from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress, mediumAddress } from "../../utils/shortAddress";

import ModalAnimation from "./ModalAnimation";
import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalDivider, ModalTitleWithCloseButton } from "./Modal";
import { LanguageSelect } from "./TranslateButton";

import { GlowingButton } from "./GlowingButton";
import { ClaimRGTModal } from "./ClaimRGTModal";

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
      <AddressButton openModal={openSettingsModal} />
    </>
  );
});

const AddressButton = React.memo(({ openModal }: { openModal: () => any }) => {
  const { address } = useWeb3();

  const isMobile = useIsMobile();

  return (
    <DashboardBox
      as="button"
      height="40px"
      flexShrink={0}
      width={{
        md: "245px",
        xs: "auto",
      }}
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
          {isMobile ? shortAddress(address) : mediumAddress(address)}
        </Text>
      </Row>
    </DashboardBox>
  );
});

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

    const { login } = useWeb3();

    const onSwitchWallet = useCallback(() => {
      onClose();
      setTimeout(() => login(), 100);
    }, [login, onClose]);

    const onClaimRGT = useCallback(() => {
      onClose();
      setTimeout(() => openClaimRGTModal(), 100);
    }, [onClose, openClaimRGTModal]);

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
                  mb={DASHBOARD_BOX_SPACING.asPxString()}
                >
                  {t("Switch Wallet")}
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

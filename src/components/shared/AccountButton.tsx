import React, { useCallback } from "react";
import { useAuthedWeb3, useWeb3 } from "../../context/Web3Context";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Text,
  Select,
} from "@chakra-ui/core";
import { useIsMobile, Row, Column } from "buttered-chakra";
import DashboardBox from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress, mediumAddress } from "../../utils/shortAddress";

import ModalAnimation from "./ModalAnimation";
import { useTranslation } from "react-i18next";
import { MODAL_PROPS, ModalTitle, ModalDivider } from "./Modal";

export const AccountButton = React.memo(() => {
  const { address } = useAuthedWeb3();
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  return (
    <>
      <SettingsModal isOpen={isModalOpen} onClose={closeModal} />
      <AddressButton openModal={openModal} address={address} />
    </>
  );
});

const AddressButton = React.memo(
  ({ openModal, address }: { openModal: () => any; address: string }) => {
    const isMobile = useIsMobile();

    return (
      <DashboardBox
        as="button"
        height="40px"
        width={{
          md: "245px",
          xs: "auto",
        }}
        onClick={openModal}
      >
        <Row
          expand
          mainAxisAlignment="center"
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
  }
);

export const SettingsModal = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => any }) => {
    const { logout, login } = useWeb3();

    const onSwitch = useCallback(() => {
      onClose();
      setTimeout(() => login(), 100);
    }, [login, onClose]);

    const { t, i18n } = useTranslation();

    const selectLang = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(event.target.value);
        localStorage.setItem("rariLang", event.target.value);
      },
      [i18n]
    );

    return (
      <ModalAnimation
        isActivted={isOpen}
        render={(styles) => (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent {...styles} {...MODAL_PROPS}>
              <ModalTitle text={t("Account")} />
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
                  onClick={onSwitch}
                  _hover={{}}
                  _active={{}}
                >
                  {t("Switch Wallet")}
                </Button>

                <Button
                  mt={4}
                  leftIcon="unlock"
                  bg="red.500"
                  width="100%"
                  height="45px"
                  fontSize="xl"
                  borderRadius="7px"
                  fontWeight="bold"
                  onClick={logout}
                  _hover={{}}
                  _active={{}}
                >
                  {t("Disconnect")}
                </Button>

                <Select
                  mt={4}
                  value={i18n.language}
                  onChange={selectLang}
                  color="#000000"
                  fontWeight="bold"
                  width="100%"
                >
                  <option value="en">English</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="zh-TW">中國傳統的</option>
                </Select>
              </Column>
            </ModalContent>
          </Modal>
        )}
      />
    );
  }
);

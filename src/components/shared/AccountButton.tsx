import React, { useCallback } from "react";
import { useAuthedWeb3, useWeb3 } from "../../context/Web3Context";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Heading,
  Box,
  Button,
  Text,
  Select,
} from "@chakra-ui/core";
import { useIsMobile, Row, Column } from "buttered-chakra";
import DashboardBox from "./DashboardBox";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { shortAddress, mediumAddress } from "../../utils/shortAddress";

import SlideIn from "./SlideIn";
import { useTranslation } from "react-i18next";

export const AccountButton = React.memo(() => {
  const { address } = useAuthedWeb3();
  const {
    isOpen: isWalletModalOpen,
    onOpen: openWalletModal,
    onClose: closeWalletModal,
  } = useDisclosure();

  return (
    <>
      <WalletModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />
      {/* eslint-disable-next-line */}
      <OpenModalButton openWalletModal={openWalletModal} address={address} />
    </>
  );
});

const OpenModalButton = React.memo(
  ({
    openWalletModal,
    address,
  }: {
    openWalletModal: () => any;
    address: string;
  }) => {
    const isMobile = useIsMobile();

    return (
      <DashboardBox
        as="button"
        height="40px"
        width={{
          md: "245px",
          xs: "auto",
        }}
        onClick={openWalletModal}
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

export const WalletModal = React.memo(
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
      <SlideIn
        isActivted={isOpen}
        render={(styles) => (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent
              {...styles}
              width={{ md: "450px", xs: "92%" }}
              backgroundColor="#121212"
              borderRadius="10px"
              border="1px"
              borderColor="#272727"
              color="#FFFFFF"
            >
              <Row
                width="100%"
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                p={4}
              >
                <Heading fontSize="27px">{t("Account")}</Heading>
              </Row>
              <Box h="1px" bg="#272727" />
              <Column
                width="100%"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                p={4}
              >
                <Select
                  value={i18n.language}
                  onChange={selectLang}
                  color="#000000"
                  fontWeight="bold"
                  width="100%"
                >
                  <option value="en">{t("English")}</option>
                  <option value="zh-CN">{t("Chinese Simplified")}</option>
                  <option value="zh-TW">{t("Chinese Traditional")}</option>
                </Select>

                <Button
                  mt={4}
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
              </Column>
            </ModalContent>
          </Modal>
        )}
      />
    );
  }
);

import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
} from "@chakra-ui/react";
import { Center, Column } from "buttered-chakra";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../../context/RariContext";
import DashboardBox, {
  DASHBOARD_BOX_PROPS,
} from "../../../shared/DashboardBox";

import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const AddToWhitelistModal = (props: Props) => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const [address, _setAddress] = useState<string>("");

  const whitelist = [
    "0x7eD52863829AB99354F3a0503A622e82AcD5F7d3",
    "0x36bf265638d3F0D61d5d453682854673a3D62C05",
    "0xfb9F8Ea924dDbDB8C23c6a519ea8C70Cf8F7B92A",
  ];

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={props.isOpen}
      onClose={props.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {t("Whitelist")}
        </Heading>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={4}
        >
          <Input
            width="100%"
            placeholder="New Member: 0x00000000000000000000000000000000000000"
            height="40px"
            variant="filled"
            size="sm"
            value={address}
            onChange={(event) => {
              _setAddress(event.target.value);
            }}
            {...DASHBOARD_BOX_PROPS}
            _placeholder={{ color: "#e0e0e0" }}
            _focus={{ bg: "#121212" }}
            _hover={{ bg: "#282727" }}
            bg="#282727"
            mb={5}
          />

          <Heading size="sm" textAlign="center">
            {t("Current Members:")}
          </Heading>

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height="110px"
            width="100%"
            overflowY="auto"
          >
            {whitelist.map((address) => {
              return (
                <DashboardBox
                  fontSize="15px"
                  width="100%"
                  height="40px"
                  mt={2}
                  key={address}
                >
                  <Center expand>{address}</Center>
                </DashboardBox>
              );
            })}
          </Column>

          <Button
            mt={4}
            fontWeight="bold"
            fontSize="2xl"
            borderRadius="10px"
            width="100%"
            height="70px"
            color="#000"
            bg="#FFF"
            _hover={{ transform: "scale(1.02)" }}
            _active={{ transform: "scale(0.95)" }}
            isDisabled={!rari.web3.utils.isAddress(address)}
          >
            {t("Confirm")}
          </Button>
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddToWhitelistModal;

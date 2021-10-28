import { InfoIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Heading,
} from "@chakra-ui/react";

import BigNumber from "bignumber.js";
import { Column, Row } from "lib/chakraUtils";

import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useQuery } from "react-query";

import { useRari } from "context/RariContext";

import { GlowingButton } from "../GlowingButton";
import { AnimatedSmallLogo } from "../Logos";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "../Modal";

import { SimpleTooltip } from "../SimpleTooltip";
import HeaderSearchbar from "./HeaderSearchbar";
import AppLink from "../AppLink";

export const MobileNavModal = ({
  isOpen,
  onClose,
  defaultMode,
}: {
  isOpen: boolean;
  onClose: () => any;
  defaultMode?: string;
}) => {
  const { t } = useTranslation();

  const { address, rari } = useRari();

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <ModalTitleWithCloseButton text={t("Nav")} onClose={onClose} />

        <ModalDivider />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={4}
        >
          <AppLink
            href="/fuse"
            as={Box}
            h="100%"
            w="100%"
            flex="1"
            _hover={{ background: "grey" }}
            p={3}
            onClick={onClose}
          >
            <Heading size="md">Fuse</Heading>
          </AppLink>

          <Accordion allowToggle w="100%">
            {/* Vaults */}
            <AccordionItem p={3} h="100%" w="100%" flex="1">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Vaults</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <AppLink
                  href="/pools/usdc"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">USDC</Heading>
                </AppLink>
                <ModalDivider />
                <AppLink
                  href="/pools/dai"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">DAI</Heading>
                </AppLink>
              </AccordionPanel>
            </AccordionItem>

            {/* Gov */}
            <AccordionItem p={3} h="100%" w="100%" flex="1">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Governance</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <AppLink
                  href="https://vote.rari.capital"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">Snapshot</Heading>
                </AppLink>
                <ModalDivider />
                <AppLink
                  href="https://forums.rari.capital"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">Forums</Heading>
                </AppLink>
              </AccordionPanel>
            </AccordionItem>

            {/* Tools */}
            <AccordionItem p={3} h="100%" w="100%" flex="1">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Tools</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <AppLink
                  href="/positions"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">Positions</Heading>
                </AppLink>
                <ModalDivider />
                <AppLink
                  href="utils/interest-rates"
                  as={Box}
                  h="100%"
                  w="100%"
                  flex="1"
                  _hover={{ background: "grey" }}
                  p={3}
                  onClick={onClose}
                >
                  <Heading size="sm">Interest Rates</Heading>
                </AppLink>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <ModalDivider />

          <HeaderSearchbar w="100%" mx="auto" />
        </Column>
      </ModalContent>
    </Modal>
  );
};

import React, { useCallback } from "react";
import {
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Select,
  SelectProps,
} from "@chakra-ui/core";
import { MdTranslate } from "react-icons/md";
import { useTranslation } from "react-i18next";
import ModalAnimation from "./ModalAnimation";
import { MODAL_PROPS, ModalTitle, ModalDivider } from "./Modal";
import { Column } from "buttered-chakra";

export const TranslateButton = React.memo(() => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  return (
    <>
      <TranslateModal isOpen={isModalOpen} onClose={closeModal} />
      <LanguageIconButton openModal={openModal} />
    </>
  );
});

const LanguageIconButton = React.memo(
  ({ openModal }: { openModal: () => any }) => {
    return (
      <IconButton
        onClick={openModal}
        color="#FFFFFF"
        variant="ghost"
        aria-label="Set Language"
        icon={MdTranslate}
        fontSize="25px"
        _hover={{
          transform: "scale(1.2)",
          transition: "all 0.3s linear",
        }}
        _active={{
          transform: "scale(0.9)",
          transition: "all 0.2s linear",
        }}
      />
    );
  }
);

export const TranslateModal = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => any }) => {
    const { t } = useTranslation();

    return (
      <ModalAnimation
        isActivted={isOpen}
        render={(styles) => (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent {...styles} {...MODAL_PROPS}>
              <ModalTitle text={t("Language")} />
              <ModalDivider />
              <Column
                width="100%"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                p={4}
              >
                <LanguageSelect />
              </Column>
            </ModalContent>
          </Modal>
        )}
      />
    );
  }
);

export const LanguageSelect = React.memo((extraProps: SelectProps) => {
  const { i18n } = useTranslation();

  const onSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      i18n.changeLanguage(event.target.value);
      localStorage.setItem("rariLang", event.target.value);
    },
    [i18n]
  );

  return (
    <Select
      value={i18n.language}
      onChange={onSelect}
      color="#000000"
      fontWeight="bold"
      width="100%"
      {...extraProps}
    >
      <option value="en">English</option>
      <option value="zh-CN">简体中文</option>
      <option value="zh-TW">中國傳統的</option>
    </Select>
  );
});

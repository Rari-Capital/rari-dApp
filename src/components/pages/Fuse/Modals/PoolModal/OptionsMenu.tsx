import React from "react";

import { Button } from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";

import {
  ModalTitleWithCloseButton,
  ModalDivider,
} from "../../../../shared/Modal";

const OptionsMenu = ({
  mode,
  onSetMode,
  onClose,
}: {
  mode: Mode;
  onClose: () => any;
  onSetMode: (mode: Mode) => any;
}) => {
  const setMode = (newMode: Mode) => {
    onSetMode(newMode);

    onClose();
  };

  const { t } = useTranslation();

  return (
    <Fade>
      <ModalTitleWithCloseButton text={t("Options")} onClose={onClose} />
      <ModalDivider />
      <Column
        mt={4}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
      >
        {mode !== Mode.SUPPLY ? (
          <Button
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.SUPPLY)}
          >
            {t("Want to supply?")}
          </Button>
        ) : null}

        {mode !== Mode.BORROW ? (
          <Button
            mt={4}
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.BORROW)}
          >
            {t("Want to borrow?")}
          </Button>
        ) : null}

        {mode !== Mode.REPAY ? (
          <Button
            mt={4}
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.REPAY)}
          >
            {t("Want to repay?")}
          </Button>
        ) : null}

        {mode !== Mode.WITHDRAW ? (
          <Button
            mt={4}
            colorScheme="red"
            variant="solid"
            onClick={() => setMode(Mode.WITHDRAW)}
          >
            {t("Want to withdraw?")}
          </Button>
        ) : null}
      </Column>
    </Fade>
  );
};

export default OptionsMenu;

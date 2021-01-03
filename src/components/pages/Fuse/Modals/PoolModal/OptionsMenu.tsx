import React, { useCallback } from "react";

import { Button } from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";
import { DASHBOARD_BOX_SPACING } from "../../../../shared/DashboardBox";
import {
  ModalTitleWithCloseButton,
  ModalDivider,
} from "../../../../shared/Modal";

const OptionsMenu = React.memo(
  ({
    mode,
    onSetMode,
    onClose,
  }: {
    mode: Mode;
    onClose: () => any;
    onSetMode: (mode: Mode) => any;
  }) => {
    const setMode = useCallback(
      (newMode: Mode) => {
        onSetMode(newMode);

        onClose();
      },
      [onSetMode, onClose]
    );

    const { t } = useTranslation();

    return (
      <Fade>
        <ModalTitleWithCloseButton text={t("Options")} onClose={onClose} />
        <ModalDivider />
        <Column
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
        >
          <Button
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.SUPPLY)}
          >
            {t("Want to supply?")}
          </Button>

          <Button
            mt={4}
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.BORROW)}
          >
            {t("Want to borrow?")}
          </Button>

          <Button
            mt={4}
            colorScheme="whatsapp"
            variant="solid"
            onClick={() => setMode(Mode.REPAY)}
          >
            {t("Want to repay?")}
          </Button>

          <Button
            mt={4}
            colorScheme="red"
            variant="solid"
            onClick={() => setMode(Mode.WITHDRAW)}
          >
            {t("Want to withdraw?")}
          </Button>
        </Column>
      </Fade>
    );
  }
);

export default OptionsMenu;

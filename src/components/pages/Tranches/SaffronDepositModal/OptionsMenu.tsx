import React, { useCallback } from "react";

import { Button } from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";
import { ModalDivider, ModalTitleWithCloseButton } from "../../../shared/Modal";
import { DASHBOARD_BOX_SPACING } from "../../../shared/DashboardBox";

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
    const toggleMode = useCallback(() => {
      onSetMode(mode === Mode.DEPOSIT ? Mode.WITHDRAW : Mode.DEPOSIT);

      onClose();
    }, [onSetMode, onClose, mode]);

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
          <Button colorScheme="red" variant="solid" onClick={toggleMode}>
            {mode === Mode.DEPOSIT
              ? t("Want to withdraw?")
              : t("Want to deposit?")}
          </Button>
        </Column>
      </Fade>
    );
  }
);

export default OptionsMenu;

import React, { useCallback } from "react";

import { Heading, Box, Button, CloseButton } from "@chakra-ui/core";

import { Fade } from "react-awesome-reveal";
import { Row, Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";

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
        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={4}
        >
          <Box width="32px" />
          <Heading fontSize="27px">{t("Options")}</Heading>
          <CloseButton onClick={onClose} />
        </Row>
        <Box h="1px" bg="#272727" />
        <Column
          mt={4}
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
        >
          <Button
            variantColor="whiteAlpha"
            variant="solid"
            onClick={toggleMode}
          >
            {t("Want to")}{" "}
            {mode === Mode.DEPOSIT ? t("withdraw") : t("deposit")}?
          </Button>
        </Column>
      </Fade>
    );
  }
);

export default OptionsMenu;

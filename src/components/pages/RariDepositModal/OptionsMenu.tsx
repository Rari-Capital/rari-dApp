import { Button } from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";
import { ModalDivider, ModalTitleWithCloseButton } from "../../shared/Modal";

const OptionsMenu = ({
  mode,
  onSetMode,
  onClose,
}: {
  mode: Mode;
  onClose: () => any;
  onSetMode: (mode: Mode) => any;
}) => {
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
        <Button
          colorScheme="red"
          variant="solid"
          onClick={() => {
            onSetMode(mode === Mode.DEPOSIT ? Mode.WITHDRAW : Mode.DEPOSIT);

            onClose();
          }}
        >
          {mode === Mode.DEPOSIT
            ? t("Want to withdraw?")
            : t("Want to deposit?")}
        </Button>
      </Column>
    </Fade>
  );
};

export default OptionsMenu;

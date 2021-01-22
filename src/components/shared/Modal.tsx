import React from "react";
import { DASHBOARD_BOX_PROPS } from "./DashboardBox";
import { Box, Heading, CloseButton } from "@chakra-ui/react";
import { Row } from "buttered-chakra";

export const MODAL_PROPS = {
  width: { md: "450px", base: "92%" },
  color: "#FFFFFF",
  ...DASHBOARD_BOX_PROPS,
};

export const ModalTitle = ({ text }: { text: string }) => {
  return (
    <Row
      width="100%"
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      p={4}
    >
      <Heading fontSize="27px">{text}</Heading>
    </Row>
  );
};

export const ModalTitleWithCloseButton = ({
  text,
  onClose,
}: {
  text: string;
  onClose: () => any;
}) => {
  return (
    <Row
      width="100%"
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      p={4}
    >
      <Box width="32px" />
      <Heading fontSize="27px" lineHeight="1.25em">
        {text}
      </Heading>
      <CloseButton onClick={onClose} />
    </Row>
  );
};

export const ModalDivider = () => {
  return <Box h="1px" width="100%" bg="#272727" />;
};

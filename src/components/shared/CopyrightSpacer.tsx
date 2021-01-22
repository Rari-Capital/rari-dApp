import React from "react";
import { Text } from "@chakra-ui/react";

const CopyrightSpacer = ({ forceShow = false }: { forceShow?: boolean }) => {
  return (
    <Text
      color="#FFFFFF"
      fontSize="xs"
      display={forceShow ? "block" : { md: "none", base: "block" }}
      textAlign="center"
      width="100%"
      py={8}
    >
      © {new Date().getFullYear()} Rari Capital. All rights reserved.
    </Text>
  );
};

export default CopyrightSpacer;

import React from "react";
import { Text } from "@chakra-ui/core";

const CopyrightSpacer = () => {
  return (
    <Text
      display={{ md: "none", xs: "block" }}
      textAlign="center"
      width="100%"
      py={8}
    >
      © {new Date().getFullYear()} Rari Capital. All rights reserved.
    </Text>
  );
};

export default CopyrightSpacer;

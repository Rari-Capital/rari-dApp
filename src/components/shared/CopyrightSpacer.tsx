import React from "react";
import { Text } from "@chakra-ui/core";

const CopyrightSpacer = React.memo(
  ({ forceShow = false }: { forceShow?: boolean }) => {
    return (
      <Text
        fontSize="xs"
        display={forceShow ? "block" : { md: "none", xs: "block" }}
        textAlign="center"
        width="100%"
        py={8}
      >
        © {new Date().getFullYear()} Rari Capital. All rights reserved.
      </Text>
    );
  }
);

export default CopyrightSpacer;

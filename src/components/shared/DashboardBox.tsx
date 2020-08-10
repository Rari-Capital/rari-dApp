import React from "react";
import { Box } from "@chakra-ui/core";

type Props = {
  [props: string]: any;
};

const DashboardBox = ({ children, ...props }: Props) => {
  return (
    <Box
      {...props}
      backgroundColor="#121212"
      borderRadius="10px"
      border="1px"
      borderColor="#272727"
    >
      {children}
    </Box>
  );
};

export default DashboardBox;

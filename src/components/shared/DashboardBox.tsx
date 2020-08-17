import React from "react";
import { Box, BoxProps } from "@chakra-ui/core";
import { PixelMeasurement } from "buttered-chakra";

export const DASHBOARD_BOX_SPACING = new PixelMeasurement(15);

const DashboardBox = ({ children, ...props }: BoxProps) => {
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

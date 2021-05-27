import { Box, BoxProps } from "@chakra-ui/react";
import { PixelMeasurement } from "utils/buttered-chakra";

export const DASHBOARD_BOX_SPACING = new PixelMeasurement(15);

export const DASHBOARD_BOX_PROPS = {
  backgroundColor: "#121212",
  borderRadius: "10px",
  border: "1px",
  borderColor: "#272727",
};

const DashboardBox = ({ children, ...props }: BoxProps) => {
  return (
    <Box {...DASHBOARD_BOX_PROPS} {...props}>
      {children}
    </Box>
  );
};

export default DashboardBox;

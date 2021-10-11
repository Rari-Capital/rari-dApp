import { Box, BoxProps } from "@chakra-ui/react";
import { PixelMeasurement } from "utils/chakraUtils";
import { DarkGlowingBox } from "./GlowingButton";

export const DASHBOARD_BOX_SPACING = new PixelMeasurement(15);

export const DASHBOARD_BOX_PROPS = {
  backgroundColor: "#121212",
  borderRadius: "10px",
  border: "1px",
  borderColor: "#272727",
};

type ExtendedBoxProps = BoxProps & { glow?: boolean };

const DashboardBox = ({
  children,
  glow = false,
  ...props
}: ExtendedBoxProps) => {
  return (
    <>
      {glow ? (
        <DarkGlowingBox {...DASHBOARD_BOX_PROPS} {...props}>
          {children}
        </DarkGlowingBox>
      ) : (
        <Box {...DASHBOARD_BOX_PROPS} {...props}>
          {children}
        </Box>
      )}
    </>
  );
};

export default DashboardBox;

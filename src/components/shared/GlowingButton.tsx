import { Box, BoxProps, Button } from "@chakra-ui/core";
import { Icons } from "@chakra-ui/core/dist/theme/icons";

import React from "react";

export const GlowingButton = React.memo(
  ({
    label,
    onClick,
    leftIcon,
    ...boxProps
  }: BoxProps & {
    leftIcon?: Icons | React.ComponentType;
    onClick: () => any;
    label: string;
  }) => {
    return (
      <Box
        padding="3px"
        borderRadius="10px"
        background="linear-gradient(45deg,
        rgb(255, 0, 0) 0%,
        rgb(255, 154, 0) 10%,
        rgb(208, 222, 33) 20%,
        rgb(79, 220, 74) 30%,
        rgb(63, 218, 216) 40%,
        rgb(47, 201, 226) 50%,
        rgb(28, 127, 238) 60%,
        rgb(95, 21, 242) 70%,
        rgb(186, 12, 248) 80%,
        rgb(251, 7, 217) 90%,
        rgb(255, 0, 0) 100%)"
        backgroundSize="500% 500%"
        animation="GradientBackgroundAnimation 6s linear infinite"
        {...boxProps}
      >
        <Button
          bg="#FFFFFF"
          color="#000000"
          borderRadius="7px"
          fontWeight="bold"
          width="100%"
          height="100%"
          leftIcon={leftIcon}
          onClick={onClick}
          _focus={{ boxShadow: "0 0 3pt 3pt #2F74AF" }}
          fontSize={boxProps.fontSize ?? "xl"}
        >
          {label}
        </Button>
      </Box>
    );
  }
);

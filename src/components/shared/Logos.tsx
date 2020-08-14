import React from "react";
import { Fade, Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import LargeLogo from "../../static/wide-logo.png";
import Logo from "../../static/small-logo.png";

export const WideLogo = () => {
  return (
    <Fade direction="down">
      <Box width="200px" height="53px" mb={4} flexShrink={0}>
        <Image width="200px" height="53px" alt="Logo" src={LargeLogo} />
      </Box>
    </Fade>
  );
};

export const SmallLogo = () => {
  return (
    <Flip>
      <Box width="37px" height="37px" flexShrink={0}>
        <Image alt="Logo" width="37px" height="37px" src={Logo} />
      </Box>
    </Flip>
  );
};

import React from "react";
import { Fade, Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import LargeLogo from "../../static/wide-logo.png";
import Logo from "../../static/small-logo.png";

export const WideLogo = () => {
  return (
    <Fade direction="down">
      <Box w="200px" h="53px" mb={4} flexShrink={0}>
        <Image alt="Logo" src={LargeLogo} />
      </Box>
    </Fade>
  );
};

export const SmallLogo = () => {
  return (
    <Flip>
      <Box w="37px" h="37px" flexShrink={0}>
        <Image alt="Logo" w="37px" h="37px" src={Logo} />
      </Box>
    </Flip>
  );
};

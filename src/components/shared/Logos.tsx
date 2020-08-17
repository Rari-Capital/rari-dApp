import React from "react";
import { Fade, Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import LargeLogo from "../../static/wide-logo.png";
import Logo from "../../static/small-logo.png";

export const WideLogo = React.memo(() => {
  return (
    <Fade direction="down" delay={200}>
      <Box width="200px" height="53px" flexShrink={0}>
        <Image width="200px" height="53px" alt="" src={LargeLogo} />
      </Box>
    </Fade>
  );
});

export const SmallLogo = React.memo(() => {
  return (
    <Flip delay={200}>
      <Box width="37px" height="37px" flexShrink={0}>
        <Image alt="" width="37px" height="37px" src={Logo} />
      </Box>
    </Flip>
  );
});

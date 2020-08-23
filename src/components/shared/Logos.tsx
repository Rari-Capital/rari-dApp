import React from "react";
import { Fade, Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import LargeLogo from "../../static/wide-logo.png";
import Logo from "../../static/small-logo.png";
import BookBrainLogo from "../../static/book-brain.png";

export const WideLogo = React.memo(() => {
  return (
    <Fade direction="down" delay={200}>
      <Box width="200px" height="50px" flexShrink={0}>
        <Image width="200px" height="50px" alt="" src={LargeLogo} />
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

export const BookBrain = React.memo(({ isTall }: { isTall: boolean }) => {
  return (
    <Box
      h={isTall ? "100px" : "55px"}
      w={isTall ? "100px" : "55px"}
      flexShrink={0}
    >
      <Image
        alt=""
        h={isTall ? "100px" : "55px"}
        w={isTall ? "100px" : "55px"}
        src={BookBrainLogo}
      />
    </Box>
  );
});

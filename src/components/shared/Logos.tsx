import React from "react";
import { Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import Logo from "../../static/small-logo.png";
import BookBrainLogo from "../../static/book-brain.png";
import { usePoolInfoFromContext } from "../../hooks/usePoolInfo";

export const AnimatedSmallLogo = React.memo(() => {
  return (
    <Flip delay={300}>
      <SmallLogo />
    </Flip>
  );
});

export const SmallLogo = React.memo(() => {
  return (
    <Box width="37px" height="37px" flexShrink={0}>
      <Image src={Logo} />
    </Box>
  );
});

export const AnimatedPoolLogo = React.memo(() => {
  return (
    <Flip delay={300}>
      <PoolLogo />
    </Flip>
  );
});

export const PoolLogo = React.memo(() => {
  const { poolLogo } = usePoolInfoFromContext();

  return (
    <Box width="37px" height="37px" flexShrink={0}>
      <Image src={poolLogo} />
    </Box>
  );
});

export const BookBrain = React.memo(({ isTall }: { isTall: boolean }) => {
  return (
    <Box
      h={isTall ? "80px" : "55px"}
      w={isTall ? "80px" : "55px"}
      flexShrink={0}
    >
      <Image src={BookBrainLogo} />
    </Box>
  );
});

import React from "react";
import { Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/core";
import Logo from "../../static/small-logo.png";
import TransparentLogo from "../../static/small-transparent-logo.png";

import { usePoolInfoFromContext } from "../../hooks/usePoolInfo";

export const ExtraSmallTransparentLogo = React.memo(() => {
  return <SmallTransparentLogo size="20px" />;
});

export const AnimatedSmallLogo = React.memo(({ size }: { size?: string }) => {
  return (
    <Flip delay={300}>
      <SmallLogo size={size} />
    </Flip>
  );
});

export const SmallLogo = React.memo(({ size }: { size?: string }) => {
  return (
    <Box size={size ?? "37px"} flexShrink={0}>
      <Image size={size ?? "37px"} src={Logo} />
    </Box>
  );
});

export const SmallTransparentLogo = React.memo(
  ({ size }: { size?: string }) => {
    return (
      <Box size={size ?? "37px"} flexShrink={0}>
        <Image size={size ?? "37px"} src={TransparentLogo} />
      </Box>
    );
  }
);

export const AnimatedPoolLogo = React.memo(({ size }: { size?: string }) => {
  return (
    <Flip delay={300}>
      <PoolLogo size={size} />
    </Flip>
  );
});

export const PoolLogo = React.memo(({ size }: { size?: string }) => {
  const { poolLogo } = usePoolInfoFromContext();

  return (
    <Box size={size ?? "37px"} flexShrink={0}>
      <Image size={size ?? "37px"} src={poolLogo} />
    </Box>
  );
});

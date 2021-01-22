import React from "react";
import { Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/react";
import Logo from "../../static/small-logo.png";
import FuseLogo from "../../static/fuseicon.png";
import TransparentLogo from "../../static/small-transparent-logo.png";

import { usePoolInfoFromContext } from "../../hooks/usePoolInfo";

export const ExtraSmallTransparentLogo = () => {
  return <SmallTransparentLogo boxSize="20px" />;
};

export const SmallLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={Logo} />
    </Box>
  );
};

export const AnimatedSmallLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Flip delay={300}>
      <SmallLogo boxSize={boxSize} />
    </Flip>
  );
};

export const FuseSmallLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={FuseLogo} />
    </Box>
  );
};

export const AnimatedFuseSmallLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Flip delay={300}>
      <FuseSmallLogo boxSize={boxSize} />
    </Flip>
  );
};

export const SmallTransparentLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={TransparentLogo} />
    </Box>
  );
};

export const AnimatedPoolLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Flip delay={300}>
      <PoolLogo boxSize={boxSize} />
    </Flip>
  );
};

export const PoolLogo = ({ boxSize }: { boxSize?: string }) => {
  const { poolLogo } = usePoolInfoFromContext();

  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={poolLogo} />
    </Box>
  );
};

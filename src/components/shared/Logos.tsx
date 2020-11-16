import React from "react";
import { Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/react";
import Logo from "../../static/small-logo.png";
import TransparentLogo from "../../static/small-transparent-logo.png";

import { usePoolInfoFromContext } from "../../hooks/usePoolInfo";

export const ExtraSmallTransparentLogo = React.memo(() => {
  return <SmallTransparentLogo boxSize="20px" />;
});

export const AnimatedSmallLogo = React.memo(
  ({ boxSize }: { boxSize?: string }) => {
    return (
      <Flip delay={300}>
        <SmallLogo boxSize={boxSize} />
      </Flip>
    );
  }
);

export const SmallLogo = React.memo(({ boxSize }: { boxSize?: string }) => {
  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={Logo} />
    </Box>
  );
});

export const SmallTransparentLogo = React.memo(
  ({ boxSize }: { boxSize?: string }) => {
    return (
      <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
        <Image boxSize={boxSize ?? "37px"} src={TransparentLogo} />
      </Box>
    );
  }
);

export const AnimatedPoolLogo = React.memo(
  ({ boxSize }: { boxSize?: string }) => {
    return (
      <Flip delay={300}>
        <PoolLogo boxSize={boxSize} />
      </Flip>
    );
  }
);

export const PoolLogo = React.memo(({ boxSize }: { boxSize?: string }) => {
  const { poolLogo } = usePoolInfoFromContext();

  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image boxSize={boxSize ?? "37px"} src={poolLogo} />
    </Box>
  );
});

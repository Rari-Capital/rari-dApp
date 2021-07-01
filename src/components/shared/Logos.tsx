// @ts-ignore

import { Flip } from "react-awesome-reveal";
import { Box, Image } from "@chakra-ui/react";

//PNGS
import Logo from "../../static/small-logo.png";
import FuseLogo from "../../static/fuseicon.png";
import TransparentLogo from "../../static/small-transparent-logo.png";

import StatsPNGWhite from "static/icons/stats.png";
import StatsPNGGreen from "static/icons/statsGreen.png";
import EarnPNGWhite from "static/icons/earn.png";
import EarnPNGGreen from "static/icons/earnGreen.png";
import FusePNGWhite from "static/icons/fuse.png";
import FusePNGGreen from "static/icons/fuseGreen.png";
import Pool2PNGWhite from "static/icons/pool2.png";
import Pool2PNGGreen from "static/icons/pool2Green.png";
import TranchesPNGWhite from "static/icons/tranches.png";
import TranchesPNGGreen from "static/icons/tranchesGreen.png";

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

export const PNGLogo = ({
  boxSize = "20px",
  Logo = FuseLogo,
  width = "20px",
  height = "20px",
  ...props
}: {
  boxSize?: string;
  Logo?: any;
  width?: string;
  height?: string;
  props?: any;
}) => {
  return (
    <Box boxSize={boxSize} flexShrink={0}>
      <Image
        boxSize={boxSize}
        src={Logo}
        width={width}
        height={height}
        {...props}
      />
    </Box>
  );
};

export const StatsLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={StatsPNGWhite} />
);

export const StatsLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={StatsPNGGreen} />
);

export const EarnLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={EarnPNGWhite} />
);

export const EarnLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={EarnPNGGreen} />
);

export const FuseLogoPNGWhite = ({
  boxSize,
  ...props
}: {
  boxSize?: string;
  props?: any;
}) => <PNGLogo boxSize={boxSize} Logo={FusePNGWhite} {...props} />;

export const FuseLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={FusePNGGreen} />
);

export const Pool2LogoPNGWhite = ({
  boxSize,
  width,
  height,
}: {
  boxSize?: string;
  width?: string;
  height?: string;
}) => (
  <PNGLogo
    boxSize={boxSize}
    Logo={Pool2PNGWhite}
    width={width}
    height={height}
  />
);

export const Pool2LogoPNGGreen = ({
  boxSize,
  width,
  height,
}: {
  boxSize?: string;
  width?: string;
  height?: string;
}) => (
  <PNGLogo
    boxSize={boxSize}
    Logo={Pool2PNGGreen}
    width={width}
    height={height}
  />
);

export const TranchesLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={TranchesPNGWhite} />
);

export const TranchesLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={TranchesPNGGreen} />
);

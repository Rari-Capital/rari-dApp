// @ts-ignore
import React from "react";
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

// SVGS
import { ReactComponent as EarnSVG } from "static/icons/earn.svg";
import { ReactComponent as FuseSVG } from "static/icons/fuse.svg";
import { ReactComponent as Pool2SVG } from "static/icons/pool2.svg";
import { ReactComponent as TrancheSVG } from "static/icons/tranche.svg";
import { ReactComponent as StatsSVG } from "static/icons/stats.svg";
import { ReactComponent as EarnSVGGreen } from "static/icons/earnGreen.svg";
import { ReactComponent as FuseSVGGreen } from "static/icons/fuseGreen.svg";
import { ReactComponent as Pool2SVGGreen } from "static/icons/pool2Green.svg";
import { ReactComponent as TrancheSVGGreen } from "static/icons/trancheGreen.svg";
import { ReactComponent as StatsSVGGreen } from "static/icons/statsGreen.svg";

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

export const EarnLogoSVGWhite = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <EarnSVG width={width} height={height} {...props} />;
};
export const FuseLogoSVGWhite = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <FuseSVG width={width} height={height} {...props} />;
};
export const Pool2LogoSVGWhite = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <Pool2SVG width={width} height={height} {...props} />;
};
export const TranchesLogoSVGWhite = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <TrancheSVG width={width} height={height} {...props} />;
};
export const StatsLogoSVGWhite = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <StatsSVG width={width} height={height} {...props} />;
};

export const EarnLogoSVGGreen = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <EarnSVGGreen width={width} height={height} {...props} />;
};
export const FuseLogoSVGGreen = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <FuseSVGGreen width={width} height={height} {...props} />;
};
export const Pool2LogoSVGGreen = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <Pool2SVGGreen width={width} height={height} {...props} />;
};
export const TranchesLogoSVGGreen = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <TrancheSVGGreen width={width} height={height} {...props} />;
};
export const StatsLogoSVGGreen = ({
  width = "20px",
  height = "20px",
  ...props
}) => {
  return <StatsSVGGreen width={width} height={height} {...props} />;
};

export const PNGLogo = ({
  boxSize = "23px",
  Logo = FuseLogo,
}: {
  boxSize?: string;
  Logo?: any;
}) => { 
  console.log({Logo})
  return (
    <Box boxSize={boxSize} flexShrink={0} pb={1}>
      <Image boxSize={boxSize} src={Logo} />
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

export const FuseLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={FusePNGWhite} />
);

export const FuseLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={FusePNGGreen} />
);

export const Pool2LogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={Pool2PNGWhite} />
);

export const Pool2LogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={Pool2PNGGreen} />
);

export const TranchesLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={TranchesPNGWhite} />
);

export const TranchesLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} Logo={TranchesPNGGreen} />
);

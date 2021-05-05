// @ts-ignore
import React from "react";
import { Flip } from "react-awesome-reveal";
import { Box, Image, Icon } from "@chakra-ui/react";
//
import Logo from "../../static/small-logo.png";
import FuseLogo from "../../static/fuseicon.png";
import TransparentLogo from "../../static/small-transparent-logo.png";

// Icons - todo: move to Logos.tsx
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

export const RariEarnIcon = (props: any) => (
  <Icon viewBox="0 0 530 530" width="20px" height="20px" {...props}>
    <path
      fill="currentColor"
      d="M286.71 419.6c6.82 32.65 32.83 49.15 64.53 49.15 40.68 0 61-16.5 61-48.63 0-27.7-13.76-44.81-65.95-59.31-73.16-20.58-99.56-45.2-99.56-91.79 0-52.36 43.68-85 100.43-85 78.15 0 102.42 45.81 105.93 79.2h-45.88c-5.74-22-19.41-43.6-60.75-43.6-39.34 0-53.32 20.63-53.32 44 0 26.57 14 41.25 66.65 55.1C437.12 339.49 460 371.54 460 415c0 58.53-42.85 90.31-110.63 90.05-65.73-.26-104.12-36-109.37-85.4zm49.59 128.08V152.32h28.53v395.36z"
    />
  </Icon>
);

export const RariFuseIcon = (props: any) => (
  <Icon viewBox="0 0 530 530" {...props}>
    <path
      fill="currentColor"
      d="M424.14 145.5L309.41 262.19c-16.76 17.06-15.27 43.12 3.47 60.52l71.6 66.49c18.55 17.23 20.23 43 3.9 60.07L286.47 556"
    />
  </Icon>
);

export const RariPool2IconWhite = (props: any) => (
  <Icon viewBox="0 0 628 530" {...props}>
    <path
      fill="currentColor"
      d="M594.62 298.45q-2.34-11.11-5.74-22.19C548.35 144.31 408.53 70.2 276.58 110.74A249.42 249.42 0 00118.72 254.8M104.76 398.11a251.94 251.94 0 006.29 24.89c40.54 132 180.36 206.1 312.31 165.57A249.45 249.45 0 00581.82 443"
    />
    <path
      fill="currentColor"
      d="M650 271.88c-49.81 29.44-71.44 44.06-160.75 47.55-106.36 4.16-183.4-79.24-285.29-79.24-70.19 0-108.68 13.58-154 45.28M650 342c-49.81 29.43-71.44 44.06-160.75 47.55C382.89 393.7 305.85 310.3 204 310.3c-70.19 0-108.68 13.59-154 45.29M650 412.28c-49.81 29.44-71.44 44.06-160.75 47.55C382.89 464 305.85 380.59 204 380.59c-70.19 0-108.68 13.58-154 45.28"
    />
  </Icon>
);

export const RariStatsIconWhite = (props: any) => (
  <Icon viewBox="0 0 450.5 501" {...props}>
    <path
      fill="currentColor"
      d="M.5 280.5H100.5V500.5H.5zM181 .5H281V500.5H181zM350 150.5H450V500.5H350z"
    />
  </Icon>
);

export const RariTrancheIconWhite = (props: any) => (
  <Icon viewBox="0 0 570 537" {...props}>
    <path fill="currentColor" d="M270 175H300V257H270z" />
    <path fill="currentColor" d="M335.03 171.26H365.03V551.26H335.03z" />
  </Icon>
);

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

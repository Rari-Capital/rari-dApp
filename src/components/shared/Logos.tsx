// @ts-ignore

import { Flip } from "react-awesome-reveal";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

//PNGS
import { usePoolInfoFromContext } from "hooks/usePoolInfo";

export const ExtraSmallTransparentLogo = () => {
  return <SmallTransparentLogo boxSize="20px" />;
};

export const SmallLogo = ({ boxSize }: { boxSize?: string }) => {
  return (
    <Box boxSize={boxSize ?? "37px"} flexShrink={0}>
      <Image
        src="/static/small-logo.png"
        alt="Logo"
        width={boxSize ?? 37}
        height={boxSize ?? 37}
      />
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
      <Image
        src="/static/fuseicon.png"
        alt="Logo"
        width={boxSize ?? 37}
        height={boxSize ?? 37}
      />
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
      <Image
        src="/static/small-transparent-logo.png"
        alt="Logo"
        width={boxSize ?? 37}
        height={boxSize ?? 37}
      />
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
      <Image
        src={poolLogo}
        alt="Logo"
        width={boxSize ?? 37}
        height={boxSize ?? 37}
      />
    </Box>
  );
};

export const PNGLogo = ({
  boxSize = "20px",
  logo,
  width = 20,
  height = 20,
}: {
  boxSize?: string;
  logo: string;
  width?: number;
  height?: number;
  props?: any;
}) => {
  return (
    <Box boxSize={boxSize} flexShrink={0}>
      <Image src={logo} width={width} height={height} />
    </Box>
  );
};

export const StatsLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/stats.png" />
);

export const StatsLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/statsGreen.png" />
);

export const EarnLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/earn.png" />
);

export const EarnLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/earnGreen.png" />
);

export const FuseLogoPNGWhite = ({
  boxSize,
  ...props
}: {
  boxSize?: string;
  props?: any;
}) => <PNGLogo boxSize={boxSize} logo="/static/icons/fuse.png" {...props} />;

export const FuseLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/fuseGreen.png" />
);

export const Pool2LogoPNGWhite = ({
  boxSize,
  width,
  height,
}: {
  boxSize?: string;
  width?: number;
  height?: number;
}) => (
  <PNGLogo
    boxSize={boxSize}
    logo="/static/icons/pool2.png"
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
  width?: number;
  height?: number;
}) => (
  <PNGLogo
    boxSize={boxSize}
    logo="/static/icons/pool2Green.png"
    width={width}
    height={height}
  />
);

export const TranchesLogoPNGWhite = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/tranches.png" />
);

export const TranchesLogoPNGGreen = ({ boxSize }: { boxSize?: string }) => (
  <PNGLogo boxSize={boxSize} logo="/static/icons/tranchesGreen.png" />
);

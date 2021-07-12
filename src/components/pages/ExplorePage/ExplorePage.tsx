import Image from "next/image";
import { Heading } from "@chakra-ui/react";
import List from "./List";
import DashboardBox from "components/shared/DashboardBox";
import { APYWithRefreshMovingStat } from "components/shared/MovingStat";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useTVLFetchers } from "hooks/useTVL";
import { useTranslation } from "next-i18next";
import { useState, useMemo } from "react";

// Utils
import { smallUsdFormatter } from "utils/bigUtils";
import { Column, Row } from "utils/chakraUtils";

import ExploreGrid from "./Grid/ExploreGrid";

export enum ExploreNavType {
  FUSE,
  EARN,
  ALL,
}

const getAssetLogo = (nav: ExploreNavType, active: boolean) => {
  switch (nav) {
    case ExploreNavType.FUSE:
      return active ? "/static/icons/fuseGreen.png" : "/static/icons/fuse.png";
    case ExploreNavType.EARN:
      return active ? "/static/icons/earnGreen.png" : "/static/icons/earn.png";
    default:
      return active ? "/static/icons/earnGreen.png" : "/static/icons/earn.png";
  }
};

const ExplorePage = () => {
  const isMobile = useIsSmallScreen();
  const { getNumberTVL } = useTVLFetchers();
  const { t } = useTranslation();

  const [exploreNav, setExploreNav] = useState(ExploreNavType.FUSE);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      color="#FFFFFF"
      mx="auto"
      mt={5}
      width="100%"
      px={isMobile ? 3 : 10}
    >
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        mb={5}
      >
        <APYWithRefreshMovingStat
          formatStat={smallUsdFormatter}
          fetchInterval={40000}
          loadingPlaceholder="$?"
          apyInterval={100}
          fetch={getNumberTVL}
          queryKey={"totalValueLocked"}
          apy={0.15}
          statSize="2xl"
          captionSize="md"
          caption={t("The Rari Protocol currently secures") + ":"}
          crossAxisAlignment="flex-start"
          captionFirst={true}
        />
      </Row>

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        mb={5}
      >
        <ExploreGrid />
      </Row>

      {/* NAV */}
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        mb={5}
      >
        <ExploreNav
          heading="Fuse"
          mr={5}
          active={exploreNav === ExploreNavType.FUSE}
          nav={ExploreNavType.FUSE}
          setNav={setExploreNav}
        />
        <ExploreNav
          heading="Earn"
          mr={5}
          active={exploreNav === ExploreNavType.EARN}
          nav={ExploreNavType.EARN}
          setNav={setExploreNav}
        />
        <ExploreNav
          heading="All"
          mr={5}
          active={exploreNav === ExploreNavType.ALL}
          nav={ExploreNavType.ALL}
          setNav={setExploreNav}
        />
      </Row>

      {/* LIST */}
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        mb={5}
      >
        <DashboardBox
          w="100%"
          h={isMobile ? "300px" : "400px"}
          overflowY="scroll"
        >
          <List nav={exploreNav} />
        </DashboardBox>
      </Row>
    </Column>
  );
};

export default ExplorePage;

const ExploreNav = ({
  heading,
  active,
  nav,
  setNav,
  ...boxProps
}: {
  heading: string;
  active: boolean;
  nav: ExploreNavType;
  setNav: (nav: ExploreNavType) => void;
  [x: string]: any;
}) => {
  const src = useMemo(() => getAssetLogo(nav, active), [nav, active]);

  return (
    <DashboardBox
      w="80px"
      h="80px"
      position="relative"
      p={2}
      className="hover-row"
      _hover={{ cursor: "pointer" }}
      color={active ? "#44C33D" : "white"}
      onClick={() => setNav(nav)}
      {...boxProps}
    >
      <Column
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        h="100%"
        w="100%"
      >
        <Image width="30px" height="30px" src={src} />
        <Heading fontSize="sm">{heading}</Heading>
      </Column>
    </DashboardBox>
  );
};

import Image from "next/image";
import { Heading, Menu, MenuList } from "@chakra-ui/react";
import ExploreList from "./ExploreList";
import ExploreGrid from "./ExploreGrid";
import DashboardBox from "components/shared/DashboardBox";
import { APYWithRefreshMovingStat } from "components/shared/MovingStat";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useTVLFetchers } from "hooks/useTVL";
import { useTranslation } from "next-i18next";
import { useState, useMemo } from "react";

// Utils
import { smallUsdFormatter } from "utils/bigUtils";
import { Column, Row } from "lib/chakraUtils";

import { useRouter } from "next/router";
import { useEffect } from "react";

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
      return active
        ? "/static/icons/assetsGreen.png"
        : "/static/icons/assets.png";
  }
};

const ExplorePage = () => {
  const router = useRouter();
  const { filter } = router.query;

  const isMobile = useIsSmallScreen();
  const { getNumberTVL } = useTVLFetchers();
  const { t } = useTranslation();

  const [exploreNav, setExploreNav] = useState(ExploreNavType.FUSE);

  useEffect(() => {
    let nav: ExploreNavType = exploreNav;
    switch (filter) {
      case "fuse":
        nav = ExploreNavType.FUSE;
        break;
      case "earn":
        nav = ExploreNavType.EARN;
        break;
      case "all":
        nav = ExploreNavType.ALL;
        break;
    }
    setExploreNav(nav);
  }, [filter]);


  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      color="#FFFFFF"
      mx={5}
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
          statSize={isMobile ? "2xl" : "3xl"}
          captionSize={isMobile ? "md" : "xl"}
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
        mt={5}
      >
        <ExploreNav
          heading="Fuse"
          mr={5}
          active={exploreNav === ExploreNavType.FUSE}
          nav={ExploreNavType.FUSE}
          setNav={setExploreNav}
        />
        <ExploreNav
          heading="Vaults"
          mr={5}
          active={exploreNav === ExploreNavType.EARN}
          nav={ExploreNavType.EARN}
          setNav={setExploreNav}
        />
        <ExploreNav
          heading="Tokens"
          mr={5}
          active={exploreNav === ExploreNavType.ALL}
          nav={ExploreNavType.ALL}
          setNav={setExploreNav}
        />
      </Row>
      {/* Sort */}
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        mb={5}
      >
        <Menu>
          <MenuList></MenuList>
        </Menu>
      </Row>

      {/* LIST */}
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        mb={5}
      >
        <DashboardBox w="100%" h="100%">
          <ExploreList nav={exploreNav} />
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

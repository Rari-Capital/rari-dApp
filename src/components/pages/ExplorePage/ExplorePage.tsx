import { Heading } from "@chakra-ui/react";
import { Box, Divider, SimpleGrid } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import AppLink from "components/shared/AppLink";
import List from "./List";

import Image from "next/image";

import DashboardBox from "components/shared/DashboardBox";
import { APYWithRefreshMovingStat } from "components/shared/MovingStat";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useTVLFetchers } from "hooks/useTVL";
import { useTranslation } from 'next-i18next';
import { smallUsdFormatter } from "utils/bigUtils";
import { Column, Row } from "utils/chakraUtils";
import { useState } from "react";
import { useMemo } from "react";

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
          caption={t("The Rari Protocol currently secures:")}
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
        <DashboardBox w="100%" h={isMobile ? "300px" : "250px"}>
          <SimpleGrid columns={isMobile ? 2 : 3} spacing={0} h="100%" w="100%">
            <GridBox bg="" />
            <GridBox bg="" heading="Newest Yield Aggregator" />
            <GridBox bg="" heading="Most Popular Asset" />
            <GridBox bg="" heading="Top Earning Asset" />
            {!isMobile && (
              <>
                <GridBox bg="" heading="Most Borrowed Asset" />
                <GridBox bg="" />
              </>
            )}
          </SimpleGrid>
        </DashboardBox>
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
      _hover={{ bg: "grey", cursor: "pointer" }}
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

// top earning stablecoin, newest yield agg, most popular asset, top earning asset, and most borrowed asset?
const GridBox = ({
  bg,
  heading = "Top earning Stablecoin",
}: {
  bg: string;
  heading?: string;
}) => {
  return (
    <AppLink
      href="/token/usdc"
      as={Column}
      w="100%"
      h="100%"
      bg={bg}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      p={4}
      border="1px solid #272727"
      _hover={{ border: "1px solid grey", bg: "grey" }}
    >
      <Row
        h="100%"
        w="100%"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
      >
        <Column
          w="100%"
          h="100%"
          bg={bg}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          flexBasis="75%"
          flexGrow={1}
        >
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <Heading fontSize="lg" color="grey">
              {heading}
            </Heading>
          </Row>
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            mt="auto"
          >
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
            >
              <Heading fontSize="2xl">USDC</Heading>
              <Heading fontSize="sm" color="grey">
                3% weekly, 12% monthly
              </Heading>
            </Column>
          </Row>
        </Column>

        <Column
          w="100%"
          h="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          flexBasis="25%"
        >
          <Avatar
            src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
            boxSize={"75%"}
          />
        </Column>
      </Row>
    </AppLink>
  );
};

// Next
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import React, { useState } from "react";

import { Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { Column, Row } from "lib/chakraUtils";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import Marquee from "react-fast-marquee";
import HomeFuseCard from "./HomeFuseCard";

import { motion } from "framer-motion";

import { smallStringUsdFormatter } from "utils/bigUtils";

const APYWithRefreshMovingStat = dynamic<APYWithRefreshMovingProps>(
  () =>
    import("components/shared/MovingStat").then(
      (mod) => mod.APYWithRefreshMovingStat
    ),
  { ssr: false }
);

import { useTVLFetchers } from "hooks/useTVL";
import HomeVaultCard from "./HomeVaultCard";
import OpportunityCard from "./OpportunityCard";
import HomeCarousel from "./HomeCarousel";

// constants
import {
  HOMEPAGE_FUSE_POOLS,
  HOMEPAGE_OPPORTUNIES,
  HOMEPAGE_EARN_VAULTS,
} from "constants/homepage";
import { useFusePoolsData } from "hooks/useFusePoolData";
import { SaffronProvider } from "../Tranches/SaffronContext";
// import { SearchIcon } from "@chakra-ui/icons";
import DashboardBox from "components/shared/DashboardBox";
import AppLink from "components/shared/AppLink";
import { APYWithRefreshMovingProps } from "components/shared/MovingStat";
import Searchbar from "components/shared/Searchbar";

const Home = React.memo(() => {
  // const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();

  const router = useRouter();

  const [val, setVal] = useState("");

  const { getNumberTVL } = useTVLFetchers();

  const pools = useFusePoolsData(
    HOMEPAGE_FUSE_POOLS.map(({ id }: { id: number }) => id)
  );

  const handleSubmit = () => {
    router.push(`/token/${val}`);
  };

  return (
    <SaffronProvider>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width="100%"
      >
        {/* Hero */}
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          height="400px"
          px={{ sm: "0", md: "15%" }}
          // bg="pink"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            my="auto"
            mt="auto"
            width="100%"
            height="100%"
            padding="10%"
            // bg="aqua"
          >
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
            >
              <Heading size="2xl" textAlign="center" mb={10}>
                Easily{" "}
                <Text as="span" color="#00C628">
                  earn
                </Text>
                , lend <br /> and borrow
              </Heading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
            >
              <Searchbar
                width={{ base: "sm", sm: "sm", md: "md", lg: "2xl" }}
              />
            </motion.div>
          </Column>
        </Row>

        {/* Fuse Pools */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          width="100%"
          height="100%"
          // px="20%"
        >
          <Marquee gradient={false} style={{ padding: "10px" }}>
            {HOMEPAGE_FUSE_POOLS.map((constantPool, i) => (
              <HomeFuseCard
                pool={pools?.find((p) => p.id === constantPool.id)}
                key={i}
              />
            ))}
          </Marquee>
        </Row>

        {/* Opportunities */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mx="auto"
          my={10}
          px={["5%", "15%", "15%", "15%"]}
          width="100%"
          // background="purple"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            // bg="pink"
          >
            <Row
              width="100%"
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
            >
              <Heading size="md">Explore Opportunities</Heading>
              <AppLink href="/explore">
                <Text size="md" color="grey">
                  View All
                </Text>
              </AppLink>
            </Row>

            <SimpleGrid
              columns={{ sm: 2, md: 2, lg: 4 }}
              spacing="32px"
              w="100%"
              mt={5}
            >
              {HOMEPAGE_OPPORTUNIES.slice(
                0,
                isMobile ? 4 : HOMEPAGE_OPPORTUNIES.length
              ).map((opportunity, i) => (
                <OpportunityCard opportunity={opportunity} key={i} />
              ))}
            </SimpleGrid>
          </Column>
        </Row>

        {/* Factoid Carousel */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mx="auto"
          my={5}
          px={{ base: "5%", sm: "5%", md: "15%" }}
          width="100%"
          // background="purple"
        >
          <DashboardBox width="100%" height="200px">
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              height="100%"
              width="100%"
            >
              <Column
                mainAxisAlignment="space-around"
                crossAxisAlignment="flex-start"
                height="100%"
                flex="0 1"
                flexBasis={{
                  base: "25%",
                  sm: "25%",
                  md: "40%",
                  lg: "40%",
                }}
                p={5}
              >
                <APYWithRefreshMovingStat
                  formatStat={smallStringUsdFormatter}
                  fetchInterval={40000}
                  loadingPlaceholder="$?"
                  apyInterval={100}
                  fetch={getNumberTVL}
                  queryKey={"totalValueLocked"}
                  apy={0.15}
                  statSize="3xl"
                  captionSize="md"
                  caption={"in TVL across all products"}
                  crossAxisAlignment="flex-start"
                  captionFirst={false}
                />
                <Text fontSize={isMobile ? "sm" : "lg"} fontWeight="bold">
                  Discover infinite possibilities across the Rari Capital
                  Ecosystem
                </Text>
              </Column>
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                height="100%"
                flex="1 1"
                flexBasis={{
                  base: "75%",
                  sm: "75%",
                  md: "60%",
                  lg: "60%",
                }}
                width="1px" // weird hack to make the carousel fit. idk why it works
                p={{ base: 0, sm: 0, md: 0, lg: 5 }}
              >
                <HomeCarousel />
              </Column>
            </Row>
          </DashboardBox>
        </Row>

        {/* Easily Earn (Vaults) */}
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          height="100%"
          my={10}
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            // background="tomato"
          >
            <Row
              width="100%"
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              px={{ base: "5%", sm: "5%", md: "15%" }}
              mb={5}
            >
              <Heading size="md">Easily Earn </Heading>
              <AppLink href="/explore?filter=earn">
                <Text size="md" color="grey">
                  View All
                </Text>
              </AppLink>
            </Row>
            <Marquee
              direction="right"
              gradient={false}
              style={{ padding: "10px" }}
            >
              {HOMEPAGE_EARN_VAULTS.map((opportunity, i) => (
                <HomeVaultCard opportunity={opportunity} key={i} />
              ))}
            </Marquee>
          </Column>
        </Row>

        {/* Explore Today */}
      </Column>
    </SaffronProvider>
  );
});

export default Home;

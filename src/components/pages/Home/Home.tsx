import React from "react";
import { Input } from "@chakra-ui/input";
import { Heading, Text, Link, SimpleGrid, Box } from "@chakra-ui/react";
import { Column, Row } from "buttered-chakra";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import NewHeader from "components/shared/Header2/NewHeader";
import Marquee from "react-fast-marquee";
import HomeFuseCard from "./HomeFuseCard";
import { Link as RouterLink } from "react-router-dom";

import { motion } from "framer-motion";

import { smallStringUsdFormatter } from "utils/bigUtils";

import { APYWithRefreshMovingStat } from "components/shared/MovingStat";
import { useTVLFetchers } from "hooks/useTVL";
import HomeVaultCard from "./HomeVaultCard";
import Footer from "components/shared/Footer";
import OpportunityCard from "./OpportunityCard";
import HomeCarousel from "./HomeCarousel";

// constants
import { HOMEPAGE_FUSE_POOLS, HOMEPAGE_OPPORTUNIES } from "constants/homepage";
import { useFusePoolsData } from "hooks/useFusePoolData";

const Home = React.memo(() => {
  // const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();

  const { getNumberTVL } = useTVLFetchers();

  const pools = useFusePoolsData(
    HOMEPAGE_FUSE_POOLS.map(({ id }: { id: number }) => id)
  );

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width="100%"
      >
        {/* Header */}
        <NewHeader />

        {/* Hero */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          width="100%"
          height="400px"
          px={{ sm: "0", md: "15%" }}
        >
          <Column
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            mx="auto"
            width="100%"
            padding="20%"
            // background="aqua"
          >
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
            >
              <Heading size="2xl" textAlign="center" mb={10}>
                Easily earn, lend <br /> and borrow
              </Heading>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
            >
              <Input placeholder="Search" outline="1px solid grey" />
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
            {pools?.map((pool, i) => (
              <HomeFuseCard pool={pool} key={i} />
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
              <Link to={`/`} as={RouterLink} style={{ textDecoration: "none" }}>
                <Text size="md" color="grey">
                  View All
                </Text>
              </Link>
            </Row>

            <SimpleGrid
              columns={{ sm: 2, md: 2, lg: 4 }}
              spacing="32px"
              w="100%"
              mt={5}
            >
              {HOMEPAGE_OPPORTUNIES.map((opportunity, i) => (
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
          <Box
            width="100%"
            border="1px solid grey"
            borderRadius="lg"
            height="200px"
            // background="purple"
          >
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              height="100%"
              width="100%"
            >
              <Column
                mainAxisAlignment="space-around"
                crossAxisAlignment="flex-start"
                // bg="pink"
                height="100%"
                flex="0 1 30%"
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
                  statSize="2xl"
                  captionSize="xs"
                  caption={"in TVL across all products"}
                  crossAxisAlignment="flex-start"
                  captionFirst={false}
                />
                <Text fontSize="sm" fontWeight="bold">
                  Discover infinite possibilities across the Rari Capital
                  Ecosystem
                </Text>
              </Column>
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                // bg="blue"
                height="100%"
                flex="1 1 70%"
                width="1px" // weird hack to make the carousel fit. idk why it works
                // p={20}
              >
                <HomeCarousel />
              </Column>
            </Row>
          </Box>
        </Row>

        {/* Easily Earn (Vaults) */}
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          height="100%"
          my={10}
          // background="tomato"
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
              px={{ sm: "5%", md: "15%" }}
              mb={5}
            >
              <Heading size="md">Easily Earn </Heading>
              <RouterLink to="/">
                <Link>
                  <Text size="md" color="grey">
                    View All
                  </Text>
                </Link>
              </RouterLink>
            </Row>
            <Marquee
              direction="right"
              gradient={false}
              style={{ padding: "10px" }}
            >
              <HomeVaultCard bg="blue" />
              <HomeVaultCard bg="yellow" />
              <HomeVaultCard bg="green" />
              <HomeVaultCard bg="red" />
              <HomeVaultCard bg="brown" />
              <HomeVaultCard bg="purple" />
              <HomeVaultCard bg="orange" />
              <HomeVaultCard bg="violet" />
            </Marquee>
          </Column>
        </Row>

        {/* Explore Today */}

        <Footer />
      </Column>
    </>
  );
});

export default Home;

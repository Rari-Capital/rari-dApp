import React, { useState } from "react";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Heading, Text, Link, SimpleGrid } from "@chakra-ui/react";
import { Column, Row } from "buttered-chakra";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import NewHeader from "components/shared/Header2/NewHeader";
import Marquee from "react-fast-marquee";
import HomeFuseCard from "./HomeFuseCard";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import { smallStringUsdFormatter } from "utils/bigUtils";

import { APYWithRefreshMovingStat } from "components/shared/MovingStat";
import { useTVLFetchers } from "hooks/useTVL";
import HomeVaultCard from "./HomeVaultCard";
import Footer from "components/shared/Footer";
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
import { SearchIcon } from "@chakra-ui/icons";
import DashboardBox from "components/shared/DashboardBox";

const Home = React.memo(() => {
  // const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
  const navigate = useNavigate();

  const [val, setVal] = useState("");

  const { getNumberTVL } = useTVLFetchers();

  const pools = useFusePoolsData(
    HOMEPAGE_FUSE_POOLS.map(({ id }: { id: number }) => id)
  );

  const handleSubmit = () => {
    navigate(`/token/${val}`);
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
              <form onSubmit={handleSubmit}>
                <InputGroup
                  width={{ base: "sm", sm: "sm", md: "md", lg: "2xl" }}
                  h="55px"
                  // pl={2}
                >
                  <InputLeftElement
                    pointerEvents="none"
                    height="100%"
                    color="grey"
                    children={<SearchIcon color="gray.300" boxSize={5} />}
                    ml={1}
                  />

                  <Input
                    border="3px solid"
                    borderColor="grey"
                    height="100%"
                    placeholder="Search by token, pool or product..."
                    _placeholder={{ color: "grey", fontWeight: "bold" }}
                    onChange={({ target: { value } }) => setVal(value)}
                    value={val}
                    color="grey"
                  />
                </InputGroup>
              </form>
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
              <Link to={`/`} as={RouterLink}>
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
                  md: "30%",
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
                  statSize="2xl"
                  captionSize="xs"
                  caption={"in TVL across all products"}
                  crossAxisAlignment="flex-start"
                  captionFirst={false}
                />
                <Text fontSize={isMobile ? "sm" : "md"} fontWeight="bold">
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
                  md: "70%",
                  lg: "60%",
                }}
                width="1px" // weird hack to make the carousel fit. idk why it works
                py={{ base: 0, sm: 0, md: 0, lg: 5 }}
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
              {HOMEPAGE_EARN_VAULTS.map((opportunity) => (
                <HomeVaultCard opportunity={opportunity} />
              ))}
            </Marquee>
          </Column>
        </Row>

        {/* Explore Today */}

        <Footer />
      </Column>
    </SaffronProvider>
  );
});

export default Home;

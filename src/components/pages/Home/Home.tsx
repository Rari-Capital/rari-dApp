import React from "react";
import { Input } from "@chakra-ui/input";
import { Heading, Text, Link, SimpleGrid, Box, Image, LinkBox } from "@chakra-ui/react";
import { Center, Column, Row, useIsMobile } from "buttered-chakra";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import NewHeader from "components/shared/Header2/NewHeader";
import Marquee from "react-fast-marquee";
import HomeFuseCard from "./HomeFuseCard";
import { Link as RouterLink } from "react-router-dom";
import { FuseLogoPNGWhite } from "components/shared/Logos";
import { motion } from "framer-motion";

import FusePNGWhite from "static/icons/fuse.png";

const Home = React.memo(() => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
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
          // background="aqua"
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
            <motion.div>
              <Heading size="2xl" textAlign="center" mb={10}>
                Easily earn, lend <br /> and borrow
              </Heading>
            </motion.div>
            <Input placeholder="Search" width="50%" outline="1px solid grey" />
          </Column>
        </Row>

        {/* Fuse Pools */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          width="100%"
          height="100%"
          // background="tomato"
          // px="20%"
        >
          <Marquee
            pauseOnHover
            gradient={false}
            style={
              {
                // background: "red",
              }
            }
          >
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
            <HomeFuseCard></HomeFuseCard>
          </Marquee>
        </Row>

        {/* Opportunities */}
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mx="auto"
          px={{ sm: "0", md: "15%" }}
          width="100%"
          // background="purple"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            // bg="pink"
            p={10}
          >
            <Row
              width="100%"
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
            >
              <Heading size="md">Explore Opportunities</Heading>
              <RouterLink to="/">
                <Link>
                  <Text size="md" color="grey">View All</Text>
                </Link>
              </RouterLink>
            </Row>

            <SimpleGrid
              columns={{ sm: 2, md: 4 }}
              spacing="32px"
              w="100%"
              mt={5}
            >
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
              <OpportunityCard />
            </SimpleGrid>
          </Column>
        </Row>
      </Column>
    </>
  );
});

export default Home;

const colors = [
  "coral",
  "blue",
  "purple",
  "green",
  "indianred",
  "brown",
  "blueviolet",
  "crimson",
  "rosybrown",
];

const OpportunityCard = () => {
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <Link to="/">
      <LinkBox
        bg={color}
        height="100%"
        width="100%"
        borderRadius="lg"
        transition= "transform 0.2s ease 0s"
        p={["5%", "10%", "10%"]}
        _hover={{
          transform: "translateY(-5px)"
        }}
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height={"100%"}
          >
            <Heading size="xs">Heading</Heading>
            <Text fontSize="xs">Subtitle</Text>
            <Text fontSize="xs" mt={2}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </Text>
          </Column>
          <Image src={FusePNGWhite} boxSize="50px" float="left"  my="auto"/>
        </Row>
      </LinkBox>
    </Link>
  );
};

import React from "react";
import {
  Image,
  Flex,
  Box,
  Text,
  Heading,
  IconButton,
  Stack,
} from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";
import SmallLogo from "../../static/small-logo.png";
import DashboardBox from "../shared/DashboardBox";

const UserPortal = () => {
  const { address, logout } = useAuthedWeb3();

  return (
    <Flex flexDirection="column" alignItems="flex-start" color="#FFFFFF">
      <Flex
        py={3}
        px={6}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        overflowX="scroll"
        width="100%"
      >
        <Box w="47px" h="47px" flexShrink={0}>
          <Image src={SmallLogo} />
        </Box>
        <Heading
          color="#FFFFFF"
          pl={4}
          size="md"
          display={{ md: "block", xs: "none" }}
        >
          {address}
        </Heading>
        <IconButton
          variant="link"
          variantColor="#FFFFFFF"
          aria-label="Logout"
          fontSize="20px"
          onClick={logout}
          icon="arrow-right"
        />
      </Flex>

      <Box height="1px" width="100%" bg="white" />

      <Flex
        width="100%"
        height={{ md: "630px", xs: "auto" }}
        flexDirection={{ md: "row", xs: "column" }}
        p={6}
      >
        <Flex
          flexDirection="column"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "75%", xs: "100%" }}
        >
          <DashboardBox
            height={{ md: "15%", xs: "80px" }}
            overflow="scroll"
            whiteSpace="nowrap"
          >
            <Flex
              flexDirection="column"
              alignItems="start"
              justifyContent="center"
              height="100%"
              p={4}
            >
              <Heading color="#FFFFFF" size="md" pr={4}>
                Hello, {address}!
              </Heading>
              <Text color="#FFFFFF" fontSize="xs" pr={4}>
                It's nice to see you!
              </Text>
            </Flex>
          </DashboardBox>

          <DashboardBox height={{ md: "55%", xs: "400px" }} mt={4}>
            chart here
          </DashboardBox>

          <Flex
            flexDirection={{ md: "row", xs: "column" }}
            height={{ md: "30%", xs: "600px" }}
            pt={4}
          >
            <DashboardBox
              mr={{ md: 4, xs: 0 }}
              mb={{ md: 0, xs: 4 }}
              height="100%"
              width={{ md: "50%", xs: "100%" }}
            >
              chart here
            </DashboardBox>
            <DashboardBox height="100%" width={{ md: "50%", xs: "100%" }}>
              chart here
            </DashboardBox>
          </Flex>
        </Flex>

        <Stack
          spacing={4}
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "25%", xs: "100%" }}
          pt={{ md: 0, xs: 4 }}
          pl={{ md: 4, xs: 0 }}
        >
          <DashboardBox height={{ md: "15%", xs: "300px" }}>
            Today's APY
          </DashboardBox>
          <DashboardBox height={{ md: "25%", xs: "300px" }}>
            APY Stats
          </DashboardBox>
          <DashboardBox height={{ md: "30%", xs: "300px" }}>
            Current Allocation
          </DashboardBox>
          <DashboardBox height={{ md: "30%", xs: "300px" }}>
            Current Allocation
          </DashboardBox>
        </Stack>
      </Flex>

      <Text textAlign="center" width="100%" py={5}>
        © {new Date().getFullYear()} Rari Capital. All rights reserved.
      </Text>
    </Flex>
  );
};

export default UserPortal;

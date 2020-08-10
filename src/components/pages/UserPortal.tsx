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
          width={{ md: "60%", xs: "100%" }}
        >
          <DashboardBox
            width="100%"
            height={{ md: "15%", xs: "80px" }}
            overflow="scroll"
            whiteSpace="nowrap"
            mb={4}
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

          <DashboardBox height={{ md: "85%", xs: "200px" }}>
            hello wtf
          </DashboardBox>
        </Flex>

        <Flex
          mt={{ md: 0, xs: 4 }}
          ml={{ md: 4, xs: 0 }}
          flexDirection="column"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "40%", xs: "100%" }}
        >
          <Stack spacing={4} height="100%">
            <DashboardBox height={{ md: "15%", xs: "300px" }}>
              test1
            </DashboardBox>
            <DashboardBox height={{ md: "85%", xs: "300px" }}>
              test2
            </DashboardBox>
          </Stack>
        </Flex>
      </Flex>

      <Text textAlign="center" width="100%" my={5}>
        © {new Date().getFullYear()} Rari Capital. All rights reserved.
      </Text>
    </Flex>
  );
};

export default UserPortal;

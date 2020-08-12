import React from "react";
import { Flex, Box, Text, Heading, IconButton, Stack } from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

import DashboardBox from "../shared/DashboardBox";
import { useContracts } from "../../context/ContractsContext";
import { useContractMethod } from "../../hooks/useContractMethod";
import { divBy1e18 } from "../../utils/1e18";
import { shortAddress } from "../../utils/shortAddress";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { useMinLockedViewHeight } from "../../hooks/useWindowSize";
import { SmallLogo } from "../shared/Logos";

const UserPortal = () => {
  const { address, logout } = useAuthedWeb3();

  const { RariFundManager } = useContracts();

  const dashboardHeight = useMinLockedViewHeight(670, 0.9);

  const { isLoading: isBalanceLoading, data: myBalance } = useContractMethod(
    RariFundManager,
    "balanceOf",
    (result: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(divBy1e18(result)),
    address
  );

  return (
    <Flex flexDirection="column" alignItems="flex-start" color="#FFFFFF">
      <Flex
        py={3}
        px={6}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        overflowX="auto"
        width="100%"
      >
        <SmallLogo />

        <IconButton
          variant="solid"
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
        height={{ md: dashboardHeight, xs: "auto" }}
        flexDirection={{ md: "row", xs: "column" }}
        p={4}
      >
        <Flex
          flexDirection="column"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "75%", xs: "100%" }}
        >
          <DashboardBox
            height={{ md: "15%", xs: "80px" }}
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <Flex
              flexDirection="row"
              height="100%"
              justifyContent="space-between"
            >
              <Flex
                flexDirection="column"
                justifyContent="center"
                height="100%"
                pl={4}
              >
                <Heading fontSize={{ md: "2xl", xs: "sm" }}>
                  Hello, {shortAddress(address)}!
                </Heading>
                <Text fontSize="xs">It's nice to see you!</Text>
              </Flex>

              <Flex
                flexDirection="column"
                alignItems="flex-end"
                justifyContent="center"
                height="100%"
                pr={4}
              >
                <Text
                  textTransform="uppercase"
                  letterSpacing="wide"
                  fontSize="xs"
                >
                  Account Balance
                </Text>
                <Heading size="md">
                  {isBalanceLoading ? "$?" : myBalance}
                </Heading>
              </Flex>
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

      <CopyrightSpacer />
    </Flex>
  );
};

export default UserPortal;

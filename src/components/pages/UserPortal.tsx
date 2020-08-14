import React from "react";
import {
  Box,
  Text,
  Heading,
  IconButton,
  Spinner,
  Divider,
} from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

import DashboardBox from "../shared/DashboardBox";
import { useContracts } from "../../context/ContractsContext";
import { useContractMethod } from "../../hooks/useContractMethod";
import { format1e18AsDollars } from "../../utils/1e18";
import { shortAddress } from "../../utils/shortAddress";
import CopyrightSpacer from "../shared/CopyrightSpacer";

import { SmallLogo } from "../shared/Logos";

import { useTransactionHistoryEvents } from "../../hooks/useContractEvent";
import FullPageSpinner from "../shared/FullPageSpinner";
import {
  Column,
  Row,
  Center,
  useMinLockedViewHeight,
  useSpacedLayout,
  RowOnDesktopColumnOnMobile,
} from "buttered-chakra";

const UserPortal = () => {
  const { address, logout } = useAuthedWeb3();

  const { RariFundManager } = useContracts();

  const dashboardHeight = useMinLockedViewHeight(670, 0.9);

  const {
    spacing: statsSidebarSpacing,
    childSizes: statsSidebarChildSizes,
  } = useSpacedLayout({
    parentHeight: dashboardHeight,
    spacing: 15,
    childSizePercentages: [0.2, 0.25, 0.25, 0.3],
  });

  const {
    spacing: mainSectionSpacing,
    childSizes: mainSectionChildSizes,
  } = useSpacedLayout({
    parentHeight: dashboardHeight,
    spacing: 15,
    childSizePercentages: [0.2, 0.5, 0.3],
  });

  const { isLoading: isBalanceLoading, data } = useContractMethod(
    RariFundManager,
    "balanceOf",
    (result: number) => format1e18AsDollars(result),
    address
  );

  if (isBalanceLoading) {
    return <FullPageSpinner />;
  }

  const myBalance = data!;
  const isFirstTime = myBalance === "$0.00";

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      color="#FFFFFF"
    >
      <Row
        py={3}
        px={6}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        overflowX="auto"
        width="100%"
      >
        <SmallLogo />

        <IconButton
          variant="ghost"
          variantColor="thisIsInvalidButItNeedsToBe"
          aria-label="Logout"
          fontSize="20px"
          onClick={logout}
          icon="arrow-right"
        />
      </Row>

      <Box height="1px" width="100%" bg="white" />

      <RowOnDesktopColumnOnMobile
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        height={{ md: dashboardHeight + "px", xs: "auto" }}
        p={4}
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "75%", xs: "100%" }}
        >
          <DashboardBox
            width="100%"
            mb={mainSectionSpacing}
            height={{ md: mainSectionChildSizes[0], xs: "80px" }}
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <Row
              expand
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
            >
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="flex-start"
                height="100%"
                pl={4}
              >
                <Heading fontSize={{ md: "2xl", xs: "sm" }}>
                  Hello, {shortAddress(address)}!
                </Heading>
                <Text fontSize="xs">It's nice to see you!</Text>
              </Column>

              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="flex-end"
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
                <Heading size="md">{myBalance}</Heading>
              </Column>
            </Row>
          </DashboardBox>

          <DashboardBox
            width="100%"
            mb={mainSectionSpacing}
            height={{ md: mainSectionChildSizes[1], xs: "400px" }}
          >
            chart here
          </DashboardBox>

          <RowOnDesktopColumnOnMobile
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height={{ md: mainSectionChildSizes[2], xs: "auto" }}
            width="100%"
          >
            <DashboardBox
              mr={{ md: 4, xs: 0 }}
              mb={{ md: 0, xs: 4 }}
              height={{ md: "100%", xs: "auto" }}
              width={{ md: "50%", xs: "100%" }}
              p={4}
            >
              <TransactionHistoryOrTokenAllocation isFirstTime={isFirstTime} />
            </DashboardBox>
            <DashboardBox
              height={{ md: "100%", xs: "300px" }}
              width={{ md: "50%", xs: "100%" }}
            >
              chart here
            </DashboardBox>
          </RowOnDesktopColumnOnMobile>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "25%", xs: "100%" }}
          pt={{ md: 0, xs: 4 }}
          pl={{ md: 4, xs: 0 }}
        >
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing}
            height={{ md: statsSidebarChildSizes[0], xs: "80px" }}
          >
            Today's APY
          </DashboardBox>
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing}
            height={{ md: statsSidebarChildSizes[1], xs: "300px" }}
          >
            APY Stats
          </DashboardBox>
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing}
            height={{ md: statsSidebarChildSizes[2], xs: "300px" }}
          >
            Current Allocation
          </DashboardBox>
          <DashboardBox
            width="100%"
            height={{ md: statsSidebarChildSizes[3], xs: "300px" }}
          >
            Monthly Returns
          </DashboardBox>
        </Column>
      </RowOnDesktopColumnOnMobile>

      <CopyrightSpacer />
    </Column>
  );
};

export default UserPortal;

const TransactionHistoryOrTokenAllocation = ({
  isFirstTime,
}: {
  isFirstTime: boolean;
}) => {
  return isFirstTime ? <Text>You have no RFT.</Text> : <TransactionHistory />;
};

const TransactionHistory = () => {
  const {
    isLoading: isEventsLoading,
    data: events,
  } = useTransactionHistoryEvents();

  return isEventsLoading ? (
    <Center expand>
      <Spinner mx="auto" my="auto" />
    </Center>
  ) : (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="auto"
    >
      <Heading size="md" mb={2}>
        Your Transaction History
      </Heading>

      {events!.map((event) => (
        <Box key={event.transactionHash}>
          <Text color="#6e6a6a" key={event.transactionHash}>
            {event.event}: {format1e18AsDollars(event.returnValues.amount)}
            <b> ({event.timeSent})</b>
          </Text>
          <Divider borderColor="#616161" my={1} />
        </Box>
      ))}
    </Column>
  );
};

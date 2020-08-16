import React from "react";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Divider,
  Button,
  Select,
  CloseButton,
} from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

import DashboardBox from "../shared/DashboardBox";
import { useContracts } from "../../context/ContractsContext";
import { useContractMethod } from "../../hooks/useContractMethod";
import { format1e18AsDollars } from "../../utils/1e18";
import { shortAddress } from "../../utils/shortAddress";
import CopyrightSpacer from "../shared/CopyrightSpacer";

import { SmallLogo } from "../shared/Logos";
import Chart from "react-apexcharts";
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
import { FundReturnChartOptions } from "../../utils/chartOptions";
import CaptionedStat from "../shared/CaptionedStat";

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
    childSizePercentages: [0.2, 0.6, 0.2],
  });

  const { isLoading: isBalanceLoading, data: balanceData } = useContractMethod(
    "balanceOf" + address,
    () =>
      RariFundManager.methods
        .balanceOf(address)
        .call()
        .then((result) => format1e18AsDollars(parseFloat(result)))
  );

  const {
    isLoading: isInterestLoading,
    data: interestData,
  } = useContractMethod("interestAccruedBy" + address, () =>
    RariFundManager.methods
      .interestAccruedBy(address)
      .call()
      .then((result) => format1e18AsDollars(parseFloat(result)))
  );

  if (isBalanceLoading || isInterestLoading) {
    return <FullPageSpinner />;
  }

  const myBalance = balanceData!;
  const myInterest = interestData!;
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

        <CloseButton onClick={logout} />
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
            height={{ md: mainSectionChildSizes[0], xs: "auto" }}
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <RowOnDesktopColumnOnMobile
              expand
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              p={4}
            >
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment={{ md: "flex-start", xs: "center" }}
                height="100%"
                mb={{ md: 0, xs: 4 }}
              >
                <Heading fontSize={{ md: "3xl", xs: "xl" }}>
                  Hello, {shortAddress(address)}!
                </Heading>
                <Text fontSize="xs">
                  {isFirstTime
                    ? "It's nice to see you!"
                    : "It's good to see you again."}
                </Text>
              </Column>

              <Button
                bg="#FFFFFF"
                color="#000000"
                height="51px"
                width="200px"
                fontSize="xl"
                borderRadius="7px"
              >
                Deposit
              </Button>
            </RowOnDesktopColumnOnMobile>
          </DashboardBox>

          <DashboardBox
            width="100%"
            mb={mainSectionSpacing}
            height={{ md: mainSectionChildSizes[1], xs: "400px" }}
            p={2}
          >
            <RowOnDesktopColumnOnMobile
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              px={4}
              height="17%"
              width="100%"
            >
              <CaptionedStat
                crossAxisAlignment="flex-start"
                caption="Account Balance"
                captionSize="xs"
                stat={myBalance}
                statSize="lg"
              />

              <CaptionedStat
                crossAxisAlignment="flex-start"
                caption="Interest Earned"
                captionSize="xs"
                stat={myInterest}
                statSize="lg"
              />

              <Select color="#000000" fontWeight="bold" ml={3} width="130px">
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Montly</option>
              </Select>
            </RowOnDesktopColumnOnMobile>

            <Box height="83%" color="#000000">
              <Chart
                options={FundReturnChartOptions}
                type="line"
                width="100%"
                height="100%"
                series={[
                  {
                    name: "Rari",
                    data: [
                      { x: "August 1, 2019", y: 54 },
                      { x: "August 3, 2019", y: 47 },
                      { x: "August 4, 2019", y: 64 },
                      { x: "August 5, 2019", y: 95 },
                    ],
                  },
                ]}
              />
            </Box>
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
              pt={4}
              px={4}
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

      {events!.map((event, index) => (
        <Box key={event.transactionHash} width="100%">
          <Text color="#6e6a6a" key={event.transactionHash}>
            {event.event}: {format1e18AsDollars(event.returnValues.amount)}
            <b> ({event.timeSent})</b>
          </Text>
          {index !== events!.length - 1 ? (
            <Divider borderColor="#616161" my={1} />
          ) : (
            <Box height={4} />
          )}
        </Box>
      ))}
    </Column>
  );
};

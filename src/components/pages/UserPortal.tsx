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

import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import { useContracts } from "../../context/ContractsContext";
import { useContractMethod } from "../../hooks/useContractMethod";

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
  useMinLockedWindowHeight,
  useSpacedLayout,
  RowOnDesktopColumnOnMobile,
  PercentageSize,
  PixelSize,
} from "buttered-chakra";
import { FundReturnChartOptions } from "../../utils/chartOptions";
import CaptionedStat from "../shared/CaptionedStat";
import { format1e18BigSourceAsUSD } from "../../utils/1e18";

const UserPortal = () => {
  const { address, logout } = useAuthedWeb3();

  const { RariFundManager } = useContracts();

  const { windowHeight, isLocked } = useMinLockedWindowHeight(700);

  const {
    spacing: headerAndBodySpacing,
    childSizes: [headerSize, bodySize],
  } = useSpacedLayout({
    parentHeight: windowHeight.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PixelSize(60),
      new PercentageSize(1),
      // We have a 0 sized child here because it will now lower the size of the "100%" child
      // by accouting for padding below it, which is 15.
      new PixelSize(0),
    ],
  });

  const {
    spacing: statsSidebarSpacing,
    childSizes: statsSidebarChildSizes,
  } = useSpacedLayout({
    parentHeight: bodySize.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PixelSize(130),
      new PercentageSize(0.25),
      new PercentageSize(0.25),
      new PercentageSize(0.5),
    ],
  });

  const {
    spacing: mainSectionSpacing,
    childSizes: mainSectionChildSizes,
  } = useSpacedLayout({
    parentHeight: bodySize.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PixelSize(130),
      new PercentageSize(0.6),
      new PercentageSize(0.4),
    ],
  });

  const {
    isLoading: isBalanceLoading,
    data: balanceData,
  } = useContractMethod("balanceOf" + address, () =>
    RariFundManager.methods
      .balanceOf(address)
      .call()
      .then(format1e18BigSourceAsUSD)
  );

  const {
    isLoading: isInterestLoading,
    data: interestData,
  } = useContractMethod("interestAccruedBy" + address, () =>
    RariFundManager.methods
      .interestAccruedBy(address)
      .call()
      .then(format1e18BigSourceAsUSD)
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
      <Column
        height={headerSize.asPxString()}
        width="100%"
        mb={headerAndBodySpacing.asPxString()}
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
      >
        <Row
          mt={3}
          px={6}
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          overflowX="hidden"
          overflowY="visible"
          width="100%"
        >
          <SmallLogo />

          <CloseButton onClick={logout} />
        </Row>

        <Box height="1px" width="100%" bg="white" />
      </Column>

      <RowOnDesktopColumnOnMobile
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        px={DASHBOARD_BOX_SPACING.asPxString()}
        height={{ md: bodySize.asPxString(), xs: "auto" }}
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "75%", xs: "100%" }}
        >
          <DashboardBox
            width="100%"
            mb={mainSectionSpacing.asPxString()}
            height={{ md: mainSectionChildSizes[0].asPxString(), xs: "auto" }}
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <RowOnDesktopColumnOnMobile
              expand
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              p={DASHBOARD_BOX_SPACING.asPxString()}
            >
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment={{ md: "flex-start", xs: "center" }}
                height="100%"
                mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
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
                fontWeight="bold"
              >
                Deposit
              </Button>
            </RowOnDesktopColumnOnMobile>
          </DashboardBox>

          <DashboardBox
            width="100%"
            mb={mainSectionSpacing.asPxString()}
            height={{ md: mainSectionChildSizes[1].asPxString(), xs: "600px" }}
          >
            <UserStatsAndChart
              size={mainSectionChildSizes[1].asNumber()}
              balance={myBalance}
              interestEarned={myInterest}
            />
          </DashboardBox>

          <RowOnDesktopColumnOnMobile
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height={{ md: mainSectionChildSizes[2].asPxString(), xs: "auto" }}
            width="100%"
          >
            <DashboardBox
              mr={{
                md: DASHBOARD_BOX_SPACING.asPxString(),
                xs: 0,
              }}
              mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
              height={{ md: "100%", xs: "auto" }}
              width={{ md: "50%", xs: "100%" }}
              pt={DASHBOARD_BOX_SPACING.asPxString()}
              px={DASHBOARD_BOX_SPACING.asPxString()}
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
          pt={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
          pl={{ md: DASHBOARD_BOX_SPACING.asPxString(), xs: 0 }}
        >
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={{ md: statsSidebarChildSizes[0].asPxString(), xs: "80px" }}
          >
            Today's APY
          </DashboardBox>
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={{ md: statsSidebarChildSizes[1].asPxString(), xs: "300px" }}
          >
            APY Stats
          </DashboardBox>
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={{ md: statsSidebarChildSizes[2].asPxString(), xs: "300px" }}
          >
            Current Allocation
          </DashboardBox>
          <DashboardBox
            width="100%"
            height={{ md: statsSidebarChildSizes[3].asPxString(), xs: "300px" }}
          >
            Monthly Returns
          </DashboardBox>
        </Column>
      </RowOnDesktopColumnOnMobile>

      <CopyrightSpacer forceShow={isLocked} />
    </Column>
  );
};

export default UserPortal;

const UserStatsAndChart = ({
  size,
  balance,
  interestEarned,
}: {
  size: number;
  balance: string;
  interestEarned: string;
}) => {
  const {
    childSizes: [statsSize, chartSize],
  } = useSpacedLayout({
    parentHeight: size,
    spacing: 0,
    childSizes: [new PixelSize(75), new PercentageSize(1), new PixelSize(10)],
  });

  return (
    <>
      <RowOnDesktopColumnOnMobile
        mainAxisAlignment={{ md: "space-between", xs: "space-around" }}
        crossAxisAlignment="center"
        px={DASHBOARD_BOX_SPACING.asPxString()}
        height={{ md: statsSize.asPxString(), xs: "30%" }}
        width="100%"
      >
        <CaptionedStat
          crossAxisAlignment={{ md: "flex-start", xs: "center" }}
          caption="Account Balance"
          captionSize="xs"
          stat={balance}
          statSize="lg"
          columnProps={{
            mt: { md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() },
            mb: { md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() },
          }}
        />

        <CaptionedStat
          crossAxisAlignment={{ md: "flex-start", xs: "center" }}
          caption="Interest Earned"
          captionSize="xs"
          stat={interestEarned}
          statSize="lg"
          columnProps={{
            mb: { md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() },
          }}
        />

        <Select
          color="#000000"
          fontWeight="bold"
          width={{ md: "130px", xs: "100%" }}
          mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="ytd">Year-To-Date</option>
        </Select>
      </RowOnDesktopColumnOnMobile>

      <Box
        px={1}
        height={{ md: chartSize.asPxString(), xs: "69%" }}
        color="#000000"
      >
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
    </>
  );
};

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
            {event.event}: {format1e18BigSourceAsUSD(event.returnValues.amount)}
            <b> ({event.timeSent})</b>
          </Text>
          {index !== events!.length - 1 ? (
            <Divider borderColor="#616161" my={1} />
          ) : (
            <Box height={DASHBOARD_BOX_SPACING.asPxString()} />
          )}
        </Box>
      ))}
    </Column>
  );
};

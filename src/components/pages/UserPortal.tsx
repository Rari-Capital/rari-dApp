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
  Icon,
  Image,
} from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

import BookBrain from "../../static/book-brain.png";

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
  useLockedViewHeight,
  useSpacedLayout,
  RowOnDesktopColumnOnMobile,
  PercentageSize,
  PixelSize,
  PercentOnDesktopPixelOnMobileSize,
} from "buttered-chakra";
import {
  FundReturnChartOptions,
  StrategyAllocationChartOptions,
} from "../../utils/chartOptions";
import CaptionedStat from "../shared/CaptionedStat";

import ProgressBar from "../shared/ProgressBar";
import { getCurrencyCodeFromKeccak256 } from "../../utils/cryptoUtils";
import { format1e18BigAsUSD, format1e18Big, toBig } from "../../utils/1e18";

const UserPortal = () => {
  const { address, logout } = useAuthedWeb3();

  const { RariFundManager } = useContracts();

  const { windowHeight, isLocked } = useLockedViewHeight({
    min: 750,
    max: 1300,
  });

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
      new PixelSize(90),
      new PixelSize(100),
      new PixelSize(152),
      new PixelSize(180),
      new PercentOnDesktopPixelOnMobileSize({
        percentageSize: 1,
        pixelSize: 100,
      }),
    ],
  });

  const {
    spacing: mainSectionSpacing,
    childSizes: mainSectionChildSizes,
  } = useSpacedLayout({
    parentHeight: bodySize.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PixelSize(90),
      new PercentOnDesktopPixelOnMobileSize({
        percentageSize: 1,
        pixelSize: 600,
      }),
      new PixelSize(180),
    ],
  });

  const { isLoading: isBalanceLoading, data: balanceData } = useContractMethod(
    "balanceOf" + address,
    () =>
      RariFundManager.methods
        .balanceOf(address)
        .call()
        .then((balance) => format1e18BigAsUSD(toBig(balance)))
  );

  const {
    isLoading: isInterestLoading,
    data: interestData,
  } = useContractMethod("interestAccruedBy" + address, () =>
    RariFundManager.methods
      .interestAccruedBy(address)
      .call()
      .then((balance) => format1e18BigAsUSD(toBig(balance)))
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
          overflowX="visible"
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
          width={{ md: "100%", xs: "100%" }}
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
                <Heading fontSize={{ md: 26, xs: "xl" }}>
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
                height="45px"
                width="170px"
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
            height={mainSectionChildSizes[1].asPxString()}
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
              height={mainSectionChildSizes[2].asPxString()}
              width={{ md: "50%", xs: "100%" }}
              pt={DASHBOARD_BOX_SPACING.asPxString()}
              px={DASHBOARD_BOX_SPACING.asPxString()}
            >
              <TransactionHistoryOrTokenAllocation isFirstTime={isFirstTime} />
            </DashboardBox>
            <DashboardBox
              height={mainSectionChildSizes[2].asPxString()}
              width={{ md: "50%", xs: "100%" }}
              pt={DASHBOARD_BOX_SPACING.asPxString()}
              px={DASHBOARD_BOX_SPACING.asPxString()}
            >
              <RecentTrades />
            </DashboardBox>
          </RowOnDesktopColumnOnMobile>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          flexShrink={0}
          height={{ md: "100%", xs: "auto" }}
          width={{ md: "260px", xs: "100%" }}
          pt={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
          pl={{ md: DASHBOARD_BOX_SPACING.asPxString(), xs: 0 }}
        >
          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={statsSidebarChildSizes[0].asPxString()}
            bg="#FFFFFF"
            color="#000000"
          >
            <CurrentAPY />
          </DashboardBox>

          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={statsSidebarChildSizes[1].asPxString()}
            p={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <APYStats />
          </DashboardBox>

          <DashboardBox
            width="100%"
            mb={statsSidebarSpacing.asPxString()}
            height={statsSidebarChildSizes[2].asPxString()}
            pt={DASHBOARD_BOX_SPACING.asPxString()}
            px={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <StrategyAllocation />
          </DashboardBox>

          <DashboardBox
            width="100%"
            height={statsSidebarChildSizes[3].asPxString()}
            mb={statsSidebarSpacing.asPxString()}
            pt={DASHBOARD_BOX_SPACING.asPxString()}
            px={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <MonthlyReturns />
          </DashboardBox>

          <DashboardBox
            width="100%"
            height={statsSidebarChildSizes[4].asPxString()}
            px={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <NeedHelp height={statsSidebarChildSizes[4].asNumber()} />
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
        overflow="hidden"
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

const CurrentAPY = () => {
  return (
    <Row expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading fontSize="54px" fontWeight="extrabold">
        12%
      </Heading>
      <Text ml={3} width="65px" fontSize="sm" textTransform="uppercase">
        Today's APY
      </Text>
    </Row>
  );
};

const APYStats = () => {
  return (
    <Column
      expand
      mainAxisAlignment="space-between"
      crossAxisAlignment="flex-start"
    >
      <Heading lineHeight={1} size="sm">
        APY Stats
      </Heading>

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="100%"
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontSize="sm">
            Month: <b>42%</b>
          </Text>

          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text fontSize="sm">+ 12%</Text>
            <Icon ml={1} name="arrow-up" />
          </Row>
        </Row>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontSize="sm">
            Week: <b>52%</b>
          </Text>

          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text fontSize="sm">+ 10%</Text>
            <Icon ml={1} name="arrow-up" />
          </Row>
        </Row>
      </Column>
    </Column>
  );
};

const StrategyAllocation = () => {
  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment={{
        md: "flex-start",
        xs: "center",
      }}
      expand
    >
      <Heading lineHeight={1} size="sm" mb={1}>
        Strategy Allocation
      </Heading>

      <Chart
        options={StrategyAllocationChartOptions}
        type="pie"
        width="100%"
        height="110px"
        series={[0.44, 0.64]}
      />
    </Column>
  );
};

const MonthlyReturns = () => {
  const returns = { Rari: 94, Compound: 5.4, dYdX: 4.3 };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="hidden"
    >
      <Heading size="sm" lineHeight={1} mb={4}>
        Monthly Returns
      </Heading>

      {Object.entries(returns).map(([key, value]) => {
        return (
          <Column
            key={key}
            width="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-end"
            mb={3}
          >
            <Row
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              width="100%"
              mb={1}
            >
              <Text color="#CACACA" fontSize={10}>
                {key}
              </Text>
              <Text color="#CACACA" fontSize={10}>
                {value}%
              </Text>
            </Row>

            <ProgressBar percentageFilled={value / 100} />
          </Column>
        );
      })}
    </Column>
  );
};

const TransactionHistoryOrTokenAllocation = ({
  isFirstTime,
}: {
  isFirstTime: boolean;
}) => {
  return isFirstTime ? <TokenAllocation /> : <TransactionHistory />;
};

const TokenAllocation = () => {
  const allocations = { DAI: 0.4, USDC: 0.3, USDT: 0.2, TUSD: 0.1 };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="hidden"
    >
      <Heading size="md" lineHeight={1}>
        Token Allocation
      </Heading>

      {Object.entries(allocations).map(([key, value]) => {
        return (
          <Column
            key={key}
            width="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-end"
            mb={2}
          >
            <Text color="#CACACA" fontSize={10}>
              {key}
            </Text>
            <ProgressBar percentageFilled={value} />
          </Column>
        );
      })}
    </Column>
  );
};

const TransactionHistory = () => {
  const {
    isLoading: isEventsLoading,
    data: events,
  } = useTransactionHistoryEvents();

  return isEventsLoading ? (
    <Center expand>
      <Spinner />
    </Center>
  ) : (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="auto"
    >
      <Heading size="sm" mb={2}>
        Your Transaction History
      </Heading>

      {events!.map((event, index) => (
        <Box key={event.transactionHash} width="100%">
          <Text color="#aba6a6" key={event.transactionHash}>
            {`${event.event}: ${format1e18Big(
              toBig(event.returnValues.amount)
            )} ${getCurrencyCodeFromKeccak256(
              event.returnValues.currencyCode
            ) ?? "UNKNOWN_CURRENCY"}
            `}
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

const RecentTrades = () => {
  const recentTrades = [
    {
      transactionHash: "XXXXX",
      timeSent: "January 1st, 2020",
      returnValues: { percent: 0.4, from: "dYdX DAI", to: "Compound DAI" },
    },
    {
      transactionHash: "YYYYYY",
      timeSent: "January 2nd, 2020",
      returnValues: { percent: 0.6, from: "Compound BAT", to: "dYdX DAI" },
    },
    {
      transactionHash: "ZZZZZZ",
      timeSent: "January 2nd, 2020",
      returnValues: { percent: 0.3, from: "Compound USDT", to: "dYdX ZRX" },
    },
    {
      transactionHash: "AAAAAAA",
      timeSent: "January 3rd, 2020",
      returnValues: { percent: 0.1, from: "dYdX REP", to: "Compound USDC" },
    },
    {
      transactionHash: "BBBBBB",
      timeSent: "January 4th, 2020",
      returnValues: {
        percent: 0.25,
        from: "Compound ETH",
        to: "Compound USDC",
      },
    },
  ];

  const tradesLoading = false;
  return tradesLoading ? (
    <Center expand>
      <Spinner />
    </Center>
  ) : (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="auto"
    >
      <Heading size="sm" mb={2}>
        Recent Trades
      </Heading>

      {recentTrades!.map((event, index) => (
        <Box key={event.transactionHash} width="100%">
          <Text color="#aba6a6" key={event.transactionHash}>
            {`Move ${event.returnValues.percent * 100}% from ${
              event.returnValues.from
            } to ${event.returnValues.to}`}
            <b> ({event.timeSent})</b>
          </Text>
          {index !== recentTrades!.length - 1 ? (
            <Divider borderColor="#616161" my={1} />
          ) : (
            <Box height={DASHBOARD_BOX_SPACING.asPxString()} />
          )}
        </Box>
      ))}
    </Column>
  );
};

const NeedHelp = ({ height }: { height: number }) => {
  const isTall = height > 200;

  return (
    <Row
      flexDirection={isTall ? "column" : "row"}
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      expand
    >
      <Image
        flexShrink={0}
        h={isTall ? "100px" : "55px"}
        w={isTall ? "100px" : "55px"}
        src={BookBrain}
      />
      <Button
        bg="#FFFFFF"
        color="#000000"
        height="45px"
        width="100%"
        ml={isTall ? 0 : 4}
        mt={isTall ? 4 : 0}
        fontSize="xl"
        borderRadius="7px"
        fontWeight="bold"
      >
        FAQ
      </Button>
    </Row>
  );
};

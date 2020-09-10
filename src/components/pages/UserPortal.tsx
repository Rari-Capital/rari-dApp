import React from "react";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Divider,
  Button,
  Select,
  Icon,
  ButtonProps,
  useDisclosure,
} from "@chakra-ui/core";
import { useAuthedWeb3 } from "../../context/Web3Context";

import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import { useContracts } from "../../context/ContractsContext";

import CopyrightSpacer from "../shared/CopyrightSpacer";

import { SmallLogo, BookBrain } from "../shared/Logos";
import Chart from "react-apexcharts";

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
  useIsMobile,
} from "buttered-chakra";
import {
  FundReturnChartOptions,
  StrategyAllocationChartOptions,
  DisableChartInteractions,
} from "../../utils/chartOptions";
import CaptionedStat from "../shared/CaptionedStat";

import ProgressBar from "../shared/ProgressBar";
import { getCurrencyCodeFromKeccak256 } from "../../utils/cryptoUtils";
import { format1e18BigAsUSD, format1e18Big, toBig } from "../../utils/bigUtils";
import DepositModal from "./DepositModal";
import { useQuery } from "react-query";
import { WalletButon } from "../shared/WalletButton";
import { useTransactionHistoryEvents } from "../../hooks/useContractEvent";

const UserPortal = () => {
  const { address } = useAuthedWeb3();

  const { RariFundManager } = useContracts();

  const { windowHeight, isLocked } = useLockedViewHeight({
    min: 750,
    max: 1900,
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

  const { isLoading: isBalanceLoading, data: balanceData } = useQuery(
    address + " balanceOf RFT",
    () =>
      RariFundManager.methods
        .balanceOf(address)
        .call()
        .then((balance) => format1e18BigAsUSD(toBig(balance)))
  );

  const { isLoading: isInterestLoading, data: interestData } = useQuery(
    address + " interestAccruedBy",
    () =>
      RariFundManager.methods
        .interestAccruedBy(address)
        .call()
        .then((balance) => format1e18BigAsUSD(toBig(balance)))
  );

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  if (isBalanceLoading || isInterestLoading) {
    return <FullPageSpinner />;
  }

  const myBalance = balanceData!;
  const myInterest = interestData!;
  const isFirstTime = myBalance === "$0.00";

  return (
    <>
      <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
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
            mt={"9px"}
            px={DASHBOARD_BOX_SPACING.asPxString()}
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            overflowX="visible"
            overflowY="visible"
            width="100%"
          >
            <SmallLogo />

            <WalletButon />
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
                  <Heading
                    fontFamily="'Baloo Bhai 2'"
                    fontSize={{ md: 27, xs: "xl" }}
                  >
                    {"Stable Fund"}
                  </Heading>
                  <Text fontSize="xs">
                    {"Safe and stable returns on stablecoins."}
                  </Text>
                </Column>

                <DepositButton onClick={openDepositModal} />
              </RowOnDesktopColumnOnMobile>
            </DashboardBox>

            <DashboardBox
              width="100%"
              mb={mainSectionSpacing.asPxString()}
              height={mainSectionChildSizes[1].asPxString()}
              position="relative"
            >
              {isFirstTime ? (
                <DepositButton
                  zIndex={1}
                  transform="translate(-50%, -50%); "
                  position="absolute"
                  top="50%"
                  left="50%"
                  onClick={openDepositModal}
                />
              ) : null}

              <Box opacity={isFirstTime ? 0.2 : 1} height="100%">
                <UserStatsAndChart
                  isFirstTime={isFirstTime}
                  size={mainSectionChildSizes[1].asNumber()}
                  balance={myBalance}
                  interestEarned={myInterest}
                />
              </Box>
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
                <TransactionHistoryOrTokenAllocation
                  isFirstTime={isFirstTime}
                />
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
    </>
  );
};

export default UserPortal;

const UserStatsAndChart = React.memo(
  ({
    size,
    balance,
    interestEarned,
    isFirstTime,
  }: {
    size: number;
    balance: string;
    interestEarned: string;
    isFirstTime: boolean;
  }) => {
    const {
      childSizes: [statsSize, chartSize, bottomSpacing],
    } = useSpacedLayout({
      parentHeight: size,
      spacing: 0,
      childSizes: [new PixelSize(75), new PercentageSize(1), new PixelSize(10)],
    });

    const isMobile = useIsMobile();

    return (
      <>
        <RowOnDesktopColumnOnMobile
          mainAxisAlignment={{ md: "space-between", xs: "space-around" }}
          crossAxisAlignment="center"
          px={DASHBOARD_BOX_SPACING.asPxString()}
          height={{ md: statsSize.asPxString(), xs: "30%" }}
          width="100%"
        >
          {isFirstTime ? (
            <CaptionedStat
              crossAxisAlignment={{ md: "flex-start", xs: "center" }}
              caption="Fund Performance"
              captionSize="xs"
              stat={"+10%"}
              statSize={isMobile ? "2xl" : "lg"}
              columnProps={{
                mt: { md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() },
              }}
            />
          ) : (
            <>
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
            </>
          )}

          <Select
            color="#000000"
            fontWeight="bold"
            width={{ md: "130px", xs: "100%" }}
            mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
            isDisabled={isFirstTime}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="ytd">YTD</option>
          </Select>
        </RowOnDesktopColumnOnMobile>

        <Box
          px={1}
          height={{ md: chartSize.asPxString(), xs: "69%" }}
          color="#000000"
          overflow="hidden"
          mb={bottomSpacing.asPxString()}
        >
          <Chart
            options={
              isFirstTime
                ? { ...FundReturnChartOptions, ...DisableChartInteractions }
                : FundReturnChartOptions
            }
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
  }
);

const CurrentAPY = React.memo(() => {
  return (
    <Row expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading
        mt={2}
        fontFamily="'Baloo Bhai 2'"
        fontSize="54px"
        fontWeight="extrabold"
      >
        12%
      </Heading>
      <Text ml={3} width="65px" fontSize="sm" textTransform="uppercase">
        Today's APY
      </Text>
    </Row>
  );
});

const APYStats = React.memo(() => {
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
});

const StrategyAllocation = React.memo(() => {
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
});

const MonthlyReturns = React.memo(() => {
  const returns = { Rari: 94, Compound: 5.4, dYdX: 4.3 };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="hidden"
    >
      <Heading size="sm" lineHeight={1} mb={3}>
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
              <Text color="#CACACA" fontSize={12}>
                {key}
              </Text>
              <Text color="#CACACA" fontSize={12}>
                {value}%
              </Text>
            </Row>

            <ProgressBar percentageFilled={value / 100} />
          </Column>
        );
      })}
    </Column>
  );
});

const TransactionHistoryOrTokenAllocation = React.memo(
  ({ isFirstTime }: { isFirstTime: boolean }) => {
    return isFirstTime ? <TokenAllocation /> : <TransactionHistory />;
  }
);

const TokenAllocation = React.memo(() => {
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
});

const TransactionHistory = React.memo(() => {
  const { data: events, isLoading } = useTransactionHistoryEvents();

  return isLoading ? (
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
          <Text fontSize="sm" color="#aba6a6">
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
});

const RecentTrades = React.memo(() => {
  const recentTrades = [
    {
      transactionHash: "XXXXX",
      timeSent: "1/6/20",
      returnValues: { percent: 0.4, from: "dYdX DAI", to: "Compound DAI" },
    },
    {
      transactionHash: "YYYYYY",
      timeSent: "1/6/20",
      returnValues: { percent: 0.6, from: "Compound BAT", to: "dYdX DAI" },
    },
    {
      transactionHash: "ZZZZZZ",
      timeSent: "1/5/20",
      returnValues: { percent: 0.3, from: "Compound USDT", to: "dYdX ZRX" },
    },
    {
      transactionHash: "AAAAAAA",
      timeSent: "1/5/20",
      returnValues: { percent: 0.1, from: "dYdX REP", to: "Compound USDC" },
    },
    {
      transactionHash: "BBBBBB",
      timeSent: "1/4/20",
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
          <Text fontSize="sm" color="#aba6a6">
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
});

const NeedHelp = React.memo(({ height }: { height: number }) => {
  const isTall = height > 200;

  return (
    <Row
      flexDirection={isTall ? "column" : "row"}
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      expand
    >
      <BookBrain isTall={isTall} />

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
        onClick={() => window.open("https://rari.capital/current.html")}
      >
        FAQ
      </Button>
    </Row>
  );
});

interface DepositButtonProps extends Omit<ButtonProps, "children"> {}

const DepositButton = React.memo((buttonProps: DepositButtonProps) => {
  return (
    <Button
      bg="#FFFFFF"
      color="#000000"
      height="45px"
      width="170px"
      fontSize="xl"
      borderRadius="7px"
      fontWeight="bold"
      onClick={buttonProps.onClick}
      {...buttonProps}
    >
      Deposit
    </Button>
  );
});

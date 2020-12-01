import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Divider,
  Select,
  useDisclosure,
  theme,
  BoxProps,
  Image,
  Link,
} from "@chakra-ui/react";
import { useRari } from "../../context/RariContext";

import SmallRGTLogo from "../../static/small-logo.png";

import DashboardBox, {
  DASHBOARD_BOX_SPACING,
  DASHBOARD_BOX_PROPS,
} from "../shared/DashboardBox";

import CopyrightSpacer from "../shared/CopyrightSpacer";

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
  ResponsivePixelSize,
  PixelSize,
  PercentOnDesktopPixelOnMobileSize,
} from "buttered-chakra";

import {
  USDSelfReturnChartOptions,
  ETHSelfReturnChartOptions,
  USDStrategyAllocationChartOptions,
  ETHStrategyAllocationChartOptions,
  DisableChartInteractions,
} from "../../utils/chartOptions";
import CaptionedStat from "../shared/CaptionedStat";

import ProgressBar from "../shared/ProgressBar";

import DepositModal from "./DepositModal";
import { useQuery } from "react-query";

import { useTranslation } from "react-i18next";

import { Pool, PoolTypeProvider, usePoolType } from "../../context/PoolContext";
import { usePoolInfo, usePoolInfoFromContext } from "../../hooks/usePoolInfo";
import { Header, HeaderHeightWithTopPadding } from "../shared/Header";
import ForceAuthModal from "../shared/ForceAuthModal";

import { GlowingButton } from "../shared/GlowingButton";

import { usePoolBalance } from "../../hooks/usePoolBalance";
import {
  BN,
  smallStringUsdFormatter,
  stringUsdFormatter,
} from "../../utils/bigUtils";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import { getSDKPool } from "../../utils/poolUtils";
import { fetchRGTAPR, usePoolAPY } from "../../hooks/usePoolAPY";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { tokens } from "../../utils/tokenUtils";

const millisecondsPerDay = 86400000;
const blocksPerDay = 6500;

const currencyCodesByHashes: { [key: string]: string } = {
  "0xa5e92f3efb6826155f1f728e162af9d7cda33a574a1153b58f03ea01cc37e568": "DAI",
  "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa": "USDC",
  "0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0": "USDT",
  "0xa1b8d8f7e538bb573797c963eeeed40d0bcb9f28c56104417d0da1b372ae3051": "TUSD",
  "0x54c512ac779647672b8d02e2fe2dc10f79bbf19f719d887221696215fd24e9f1": "BUSD",
  "0x87ef9bf44f9ed3d4aeadafb38d9bc9470e7aac44fdcb9f7ffb957b862954cf2c": "sUSD",
  "0x33d80a03b5585b94e68b56bdea4f57fd2e459401902cb2f61772e1b630afb4b2": "mUSD",
};

const PoolPortal = React.memo(({ pool }: { pool: Pool }) => {
  return (
    <PoolTypeProvider pool={pool}>
      <PoolPortalContent />
    </PoolTypeProvider>
  );
});

export default PoolPortal;

const PoolPortalContent = React.memo(() => {
  const { isAuthed } = useRari();

  const { windowHeight, isLocked } = useLockedViewHeight({
    min: 750,
    max: 1900,
  });

  const {
    childSizes: [, bodySize],
  } = useSpacedLayout({
    parentHeight: windowHeight.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      HeaderHeightWithTopPadding,
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

  const { poolName, poolType } = usePoolInfoFromContext();

  const { balanceData, isPoolBalanceLoading } = usePoolBalance(poolType);

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  const { t } = useTranslation();

  if (isPoolBalanceLoading) {
    return <FullPageSpinner />;
  }

  const { formattedBalance: myBalance, bigBalance } = balanceData!;
  const hasNotDeposited = bigBalance.isZero();

  return (
    <>
      <ForceAuthModal />

      <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        color="#FFFFFF"
      >
        <Header isPool padding isAuthed={isAuthed} />
        <RowOnDesktopColumnOnMobile
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          px={DASHBOARD_BOX_SPACING.asPxString()}
          height={{ md: bodySize.asPxString(), base: "auto" }}
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height={{ md: "100%", base: "auto" }}
            width={{ md: "100%", base: "100%" }}
          >
            <DashboardBox
              width="100%"
              mb={mainSectionSpacing.asPxString()}
              height={{
                md: mainSectionChildSizes[0].asPxString(),
                base: "auto",
              }}
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
                  crossAxisAlignment={{ md: "flex-start", base: "center" }}
                  height="100%"
                  mb={{ md: 0, base: DASHBOARD_BOX_SPACING.asPxString() }}
                >
                  <Heading
                    fontFamily={`'Baloo 2', ${theme.fonts.heading}`}
                    fontSize={{ md: 27, base: "xl" }}
                  >
                    {poolName}
                  </Heading>
                  <Text fontSize="xs">
                    {poolType === Pool.STABLE
                      ? t("Safe returns on stablecoins")
                      : poolType === Pool.ETH
                      ? t("Safe returns on ETH")
                      : t("High risk, high reward")}
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
              {hasNotDeposited ? (
                <DepositButton
                  zIndex={1}
                  transform="translate(-50%, -50%)"
                  position="absolute"
                  top="50%"
                  left="50%"
                  onClick={openDepositModal}
                />
              ) : null}

              <Box opacity={hasNotDeposited ? 0.2 : 1} height="100%">
                <UserStatsAndChart
                  hasNotDeposited={hasNotDeposited}
                  size={mainSectionChildSizes[1].asNumber()}
                  balance={myBalance}
                />
              </Box>
            </DashboardBox>

            <RowOnDesktopColumnOnMobile
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              height={{
                md: mainSectionChildSizes[2].asPxString(),
                base: "auto",
              }}
              width="100%"
            >
              <DashboardBox
                height={mainSectionChildSizes[2].asPxString()}
                width={
                  poolType === Pool.ETH ? "100%" : { md: "50%", base: "100%" }
                }
                mb={{ md: 0, base: DASHBOARD_BOX_SPACING.asPxString() }}
                pt={DASHBOARD_BOX_SPACING.asPxString()}
                px={DASHBOARD_BOX_SPACING.asPxString()}
              >
                <RecentTrades />
              </DashboardBox>

              {poolType !== Pool.ETH ? (
                <DashboardBox
                  height={mainSectionChildSizes[2].asPxString()}
                  width={{ md: "50%", base: "100%" }}
                  ml={{
                    md: DASHBOARD_BOX_SPACING.asPxString(),
                    base: 0,
                  }}
                  pt={DASHBOARD_BOX_SPACING.asPxString()}
                  px={DASHBOARD_BOX_SPACING.asPxString()}
                >
                  <TokenAllocation />
                </DashboardBox>
              ) : null}
            </RowOnDesktopColumnOnMobile>
          </Column>

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            flexShrink={0}
            height={{ md: "100%", base: "auto" }}
            width={{ md: "260px", base: "100%" }}
            pt={{ md: 0, base: DASHBOARD_BOX_SPACING.asPxString() }}
            pl={{ md: DASHBOARD_BOX_SPACING.asPxString(), base: 0 }}
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
            >
              <TransactionHistory />
            </DashboardBox>
          </Column>
        </RowOnDesktopColumnOnMobile>

        <CopyrightSpacer forceShow={isLocked} />
      </Column>
    </>
  );
});

const UserStatsAndChart = React.memo(
  ({
    size,
    balance,

    hasNotDeposited,
  }: {
    size: number;
    balance: string;
    hasNotDeposited: boolean;
  }) => {
    const { address, rari } = useRari();

    const { poolType, poolName } = usePoolInfoFromContext();

    const [timeRange, setTimeRange] = useState("max");

    const onTimeRangeChange = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeRange(event.target.value);
      },
      [setTimeRange]
    );

    const {
      childSizes: [topPadding, statsSize, chartSize],
    } = useSpacedLayout({
      parentHeight: size,
      spacing: 0,
      childSizes: [
        // Add this to account for 5px top padding
        new PixelSize(5),
        new ResponsivePixelSize({ desktop: 75, mobile: 230 }),
        new PercentageSize(1),
        // Add this to account for 5px bottom padding
        new PixelSize(5),
      ],
    });

    const {
      data: interestEarned,
      isLoading: isInterestEarnedLoading,
    } = useQuery(
      address + " " + poolType + " interestAccrued " + timeRange,
      async () => {
        if (hasNotDeposited) {
          return "0";
        }

        const startingBlock =
          timeRange === "month"
            ? Date.now() - millisecondsPerDay * 30
            : timeRange === "year"
            ? Date.now() - millisecondsPerDay * 365
            : timeRange === "week"
            ? Date.now() - millisecondsPerDay * 7
            : 0;

        const interestRaw = await getSDKPool({
          rari,
          pool: poolType,
        }).balances.interestAccruedBy(
          address,
          Math.floor(startingBlock / 1000)
        );

        const formattedInterest = stringUsdFormatter(
          rari.web3.utils.fromWei(interestRaw)
        );

        return poolType === Pool.ETH
          ? formattedInterest.replace("$", "") + " ETH"
          : formattedInterest;
      }
    );

    const { data: chartData, isLoading: isChartDataLoading } = useQuery(
      address + " " + poolType + " " + timeRange + " balanceHistory",
      async () => {
        if (hasNotDeposited) {
          return [];
        }

        const latestBlock = await rari.web3.eth.getBlockNumber();

        const blockStart =
          timeRange === "month"
            ? latestBlock - blocksPerDay * 30
            : timeRange === "year"
            ? latestBlock - blocksPerDay * 365
            : timeRange === "week"
            ? latestBlock - blocksPerDay * 7
            : 0;

        const rawData = await getSDKPool({
          rari,
          pool: poolType,
        }).history.getBalanceHistoryOf(address, blockStart);

        return rawData;
      }
    );

    const poolAPY = usePoolAPY(poolType);

    const { t } = useTranslation();

    const chartOptions =
      poolType === Pool.ETH
        ? ETHSelfReturnChartOptions
        : USDSelfReturnChartOptions;

    return (
      <>
        <RowOnDesktopColumnOnMobile
          mainAxisAlignment={{ md: "space-between", base: "space-around" }}
          crossAxisAlignment="center"
          px={DASHBOARD_BOX_SPACING.asPxString()}
          mt={{ md: topPadding.asPxString(), base: 0 }}
          height={statsSize.asPxString()}
          width="100%"
        >
          {hasNotDeposited ? (
            <CaptionedStat
              crossAxisAlignment={{ md: "flex-start", base: "center" }}
              caption={t("Currently earning")}
              captionSize="xs"
              stat={(poolAPY ?? "?") + "% APY"}
              statSize="4xl"
            />
          ) : (
            <>
              <CaptionedStat
                crossAxisAlignment={{ md: "flex-start", base: "center" }}
                caption={t("Account Balance")}
                captionSize="xs"
                stat={balance}
                statSize="3xl"
              />

              <CaptionedStat
                crossAxisAlignment={{ md: "flex-start", base: "center" }}
                caption={t("Interest Earned")}
                captionSize="xs"
                stat={isInterestEarnedLoading ? "$?" : interestEarned!}
                statSize="3xl"
              />
            </>
          )}

          <Select
            {...DASHBOARD_BOX_PROPS}
            borderRadius="7px"
            fontWeight="bold"
            width={{ md: "130px", base: "100%" }}
            isDisabled={hasNotDeposited}
            value={timeRange}
            onChange={onTimeRangeChange}
          >
            <option className="black-bg-option" value="week">
              {t("Week")}
            </option>
            <option className="black-bg-option" value="month">
              {t("Month")}
            </option>
            <option className="black-bg-option" value="year">
              {t("Year")}
            </option>
            <option className="black-bg-option" value="max">
              {t("Max")}
            </option>
          </Select>
        </RowOnDesktopColumnOnMobile>

        <Box height={chartSize.asPxString()} color="#000000" overflow="hidden">
          {isChartDataLoading && !hasNotDeposited ? (
            <Center expand>
              <Spinner color="#FFF" />
            </Center>
          ) : (
            <Chart
              options={
                hasNotDeposited
                  ? { ...chartOptions, ...DisableChartInteractions }
                  : chartOptions
              }
              type="line"
              width="100%"
              height="100%"
              series={[
                {
                  name: poolName,
                  data: hasNotDeposited
                    ? [
                        { x: "October 1, 2020", y: 1000 },
                        { x: "October 3, 2020", y: 1001 },
                        { x: "October 4, 2020", y: 1003 },
                        { x: "October 5, 2020", y: 1005 },
                        { x: "October 6, 2020", y: 1006 },
                        { x: "October 7, 2020", y: 1007 },
                        { x: "October 8, 2020", y: 1010 },
                        { x: "October 9, 2020", y: 1012 },
                        { x: "October 10, 2020", y: 1014 },
                        { x: "October 11, 2020", y: 1016 },
                        { x: "October 12, 2020", y: 1018 },
                      ]
                    : (chartData ?? []).map((point: any) => {
                        return {
                          x: new Date(
                            point.timestamp * 1000
                          ).toLocaleDateString("en-US"),
                          y: parseFloat(point.balance) / 1e18,
                        };
                      }),
                },
              ]}
            />
          )}
        </Box>
      </>
    );
  }
);

const CurrentAPY = React.memo(() => {
  const { t } = useTranslation();

  const poolType = usePoolType();

  const poolAPY = usePoolAPY(poolType);

  return (
    <Row expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading
        mt="5px"
        fontFamily={`'Baloo 2', ${theme.fonts.heading}`}
        fontSize="54px"
        fontWeight="extrabold"
      >
        {poolAPY ? poolAPY.slice(0, -1) + "%" : <Spinner size="lg" mr={4} />}
      </Heading>
      <Text ml={3} width="65px" fontSize="sm" textTransform="uppercase">
        {t("Current APY")}
      </Text>
    </Row>
  );
});

const APYStats = React.memo(() => {
  const { t } = useTranslation();

  const pool = usePoolType();

  const { rari } = useRari();

  const { data: apys, isLoading: areAPYsLoading } = useQuery(
    pool + " monthly and weekly apys",
    async () => {
      const [monthRaw, weekRaw, rgtAPR]: [BN, BN, string] = await Promise.all([
        getSDKPool({
          rari,
          pool,
        }).apy.getApyOverTime(
          Math.floor((Date.now() - millisecondsPerDay * 30) / 1000)
        ),
        getSDKPool({
          rari,
          pool,
        }).apy.getApyOverTime(
          Math.floor((Date.now() - millisecondsPerDay * 7) / 1000)
        ),
        fetchRGTAPR(rari),
      ]);

      const month = parseFloat(
        rari.web3.utils.fromWei(monthRaw.mul(rari.web3.utils.toBN(100)))
      ).toFixed(1);

      const week = parseFloat(
        rari.web3.utils.fromWei(weekRaw.mul(rari.web3.utils.toBN(100)))
      ).toFixed(1);

      return { month, week, rgtAPR };
    }
  );

  return (
    <Column
      expand
      mainAxisAlignment="space-between"
      crossAxisAlignment="flex-start"
    >
      <Heading lineHeight={1} size="xs">
        {t("APY Based On Returns From")}:
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
            {t("This Month")}: <b>{areAPYsLoading ? "?" : apys!.month}%</b>
          </Text>

          <Text fontWeight="bold" textAlign="center">
            <SimpleTooltip label={t("Extra yield from $RGT")}>
              <span>
                + ({areAPYsLoading ? "?" : apys!.rgtAPR}%{" "}
                <Image display="inline" src={SmallRGTLogo} boxSize="20px" />)
              </span>
            </SimpleTooltip>
          </Text>
        </Row>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontSize="sm">
            {t("This Week")}: <b>{areAPYsLoading ? "?" : apys!.week}%</b>
          </Text>

          <Text fontWeight="bold" textAlign="center">
            <SimpleTooltip label={t("Extra yield from $RGT")}>
              <span>
                + ({areAPYsLoading ? "?" : apys!.rgtAPR}%{" "}
                <Image display="inline" src={SmallRGTLogo} boxSize="20px" />)
              </span>
            </SimpleTooltip>
          </Text>
        </Row>
      </Column>
    </Column>
  );
});

const StrategyAllocation = React.memo(() => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const poolType = usePoolType();

  const { data: allocations, isLoading: isAllocationsLoading } = useQuery(
    poolType + "allocations",
    async () => {
      const rawAllocations: { [key: string]: BN } = await getSDKPool({
        rari,
        pool: poolType,
      }).allocations.getRawPoolAllocations();

      let allocations: { [key: string]: number } = {};

      for (const [token, amount] of Object.entries(rawAllocations)) {
        const parsedAmount = parseFloat(rari.web3.utils.fromWei(amount));

        if (parsedAmount < 5) {
          continue;
        }

        if (token === "_cash") {
          allocations["Not Deposited"] = parsedAmount;
        } else {
          allocations[token] = parsedAmount;
        }
      }

      const keys = Object.keys(allocations);

      const values = Object.values(allocations);

      return [keys, values];
    }
  );

  const chartOptions =
    poolType === Pool.ETH
      ? ETHStrategyAllocationChartOptions
      : USDStrategyAllocationChartOptions;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment={{
        md: "flex-start",
        base: "center",
      }}
      expand
    >
      <Heading lineHeight={1} size="sm" mb={1}>
        {t("Strategy Allocation")}
      </Heading>

      {isAllocationsLoading ? (
        <Center expand>
          <Spinner />
        </Center>
      ) : (
        <Chart
          options={{
            ...chartOptions,
            labels: allocations![0],
          }}
          type="pie"
          width="100%"
          height="110px"
          series={allocations![1]}
        />
      )}
    </Column>
  );
});

const MonthlyReturns = React.memo(() => {
  const ethPoolAPY = usePoolAPY(Pool.ETH);
  const stablePoolAPY = usePoolAPY(Pool.STABLE);
  const yieldPoolAPY = usePoolAPY(Pool.YIELD);

  const { poolName: ethPoolName } = usePoolInfo(Pool.ETH);
  const { poolName: stablePoolName } = usePoolInfo(Pool.STABLE);
  const { poolName: yieldPoolName } = usePoolInfo(Pool.YIELD);

  const returns =
    ethPoolAPY && stablePoolAPY && yieldPoolAPY
      ? {
          [ethPoolName]: parseFloat(ethPoolAPY!),
          [stablePoolName]: parseFloat(stablePoolAPY!),
          [yieldPoolName]: parseFloat(yieldPoolAPY!),
        }
      : null;

  const sortedEntries = returns
    ? Object.entries(returns)
        // Sort descendingly by highest APY
        .sort((a, b) => b[1] - a[1])
    : null;

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="hidden"
    >
      <Heading size="sm" lineHeight={1} mb={3}>
        {t("Compare Returns")}
      </Heading>

      {sortedEntries ? (
        sortedEntries.map(([key, value]) => {
          const highestAPY = sortedEntries[0][1];
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
                  {value ?? "?"}%
                </Text>
              </Row>

              <ProgressBar
                percentageFilled={
                  // Fill it relative to the highest APY
                  value / highestAPY
                }
              />
            </Column>
          );
        })
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
});

const TokenAllocation = React.memo(() => {
  const { rari } = useRari();
  const poolType = usePoolType();

  const { data: allocations } = useQuery(
    poolType + " currencyAllocations",
    async () => {
      const currencyAllocations: {
        [key: string]: BN;
      } = await getSDKPool({
        rari,
        pool: poolType,
      }).allocations.getRawCurrencyAllocations();

      let dollarAmountAllocations: { [key: string]: number } = {};

      Object.keys(currencyAllocations).forEach((symbol) => {
        dollarAmountAllocations[symbol] =
          parseFloat(currencyAllocations[symbol].toString()) /
          10 ** tokens[symbol].decimals;
      });

      return dollarAmountAllocations;
    }
  );

  const sortedEntries = allocations
    ? Object.entries(allocations)
        // Sort descendingly by the largest
        .sort((a, b) => b[1] - a[1])
    : null;

  const maxAmount = useMemo(() => {
    if (sortedEntries) {
      return sortedEntries.reduce((a, b) => {
        return a + b[1];
      }, 0);
    } else {
      return null;
    }
  }, [sortedEntries]);

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="scroll"
    >
      <Heading size="md" lineHeight={1}>
        {t("Token Allocation")}
      </Heading>

      {sortedEntries && maxAmount ? (
        sortedEntries.slice(0, 4).map(([symbol, amount]) => {
          const percentageOfMax = amount / maxAmount;

          return (
            <Column
              key={symbol}
              width="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
              mb="10px"
            >
              <Text color="#CACACA" fontSize={10}>
                {symbol}
              </Text>
              <ProgressBar percentageFilled={percentageOfMax} />
            </Column>
          );
        })
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
});

const RecentTrades = React.memo(() => {
  const { rari } = useRari();

  const poolType = usePoolType();

  const { data: allocationHistory } = useQuery(
    poolType + " allocationHistory",
    async () => {
      const currentBlock = await rari.web3.eth.getBlockNumber();

      const history: any[] = await getSDKPool({
        rari,
        pool: poolType,
      }).history.getPoolAllocationHistory(0, currentBlock);

      return history
        .filter((event) => {
          return event.returnValues.action === "0";
        })
        .slice(-40)
        .reverse()
        .map((event) => {
          const token =
            poolType === Pool.ETH
              ? "ETH"
              : currencyCodesByHashes[
                  event.returnValues.currencyCode as string
                ];

          const pool = getSDKPool({ rari, pool: poolType }).allocations.POOLS[
            event.returnValues.pool
          ];

          const amount = smallStringUsdFormatter(
            (
              parseFloat(event.returnValues.amount) /
              10 ** tokens[token].decimals
            ).toString()
          );

          return {
            token,
            amount: poolType === Pool.ETH ? amount.replace("$", "") : amount,
            pool,
            blockNumber: event.blockNumber,
            hash: event.transactionHash,
            logIndex: event.logIndex,
          };
        });
    }
  );

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="auto"
    >
      <Heading size="md" lineHeight={1} mb={2}>
        {t("Recent Trades")}
      </Heading>

      {allocationHistory ? (
        allocationHistory!.map((event, index) => (
          <Box key={event!.hash + event!.logIndex} width="100%">
            <Text fontSize="sm" color="#aba6a6">
              <Link
                isExternal
                href={`https://www.etherscan.io/tx/${event!.hash}`}
              >
                Block #{event!.blockNumber}:
              </Link>
              <b> {t("Moved")} </b>
              {event!.amount} <b>{event!.token}</b> to
              <b> {event!.pool}</b>
            </Text>
            {index !== allocationHistory!.length - 1 ? (
              <Divider borderColor="#616161" my={1} />
            ) : (
              <Box height="10px" />
            )}
          </Box>
        ))
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
});

const TransactionHistory = React.memo(() => {
  const { t } = useTranslation();

  const poolType = usePoolType();

  const { rari, address } = useRari();

  const poolAddress: string = getSDKPool({ rari, pool: poolType }).contracts //@ts-ignore
    .RariFundToken.options.address;

  return (
    <Link
      href={`https://etherscan.io/token/${poolAddress}?a=${address}`}
      isExternal
    >
      <Column
        expand
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        textAlign="center"
        fontWeight="bold"
        fontSize="md"
      >
        <ExternalLinkIcon boxSize="18px" mb="6px" />
        {t("View Transaction History")}
      </Column>
    </Link>
  );
});

const DepositButton = React.memo(
  (
    props: BoxProps & {
      onClick: () => any;
    }
  ) => {
    const { t } = useTranslation();

    return (
      <GlowingButton
        label={t("Deposit")}
        width="170px"
        height="50px"
        {...props}
      />
    );
  }
);

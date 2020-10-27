import { Box, Spinner, Text } from "@chakra-ui/core";
import {
  useSpacedLayout,
  PixelSize,
  ResponsivePixelSize,
  PercentageSize,
  Row,
  Center,
} from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { PoolReturnChartOptions } from "../../utils/chartOptions";

import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import Chart from "react-apexcharts";
import { useRari } from "../../context/RariContext";
import { useQuery } from "react-query";

const millisecondsPerYear = 3.154e10;

const PoolsPerformanceChart = React.memo(({ size }: { size: number }) => {
  const {
    childSizes: [topPadding, statsSize, chartSize],
  } = useSpacedLayout({
    parentHeight: size,
    spacing: 0,
    childSizes: [
      new PixelSize(15),
      new ResponsivePixelSize({
        desktop: 20,
        mobile: 30,
      }),
      new PercentageSize(1),
      // This accounts for 10px of bottom padding
      new PixelSize(10),
    ],
  });

  const { t } = useTranslation();

  const { rari } = useRari();

  const { data: chartData, isLoading: isChartDataLoading } = useQuery(
    "fundPerformance",
    async () => {
      const startingPoint = Date.now() - millisecondsPerYear;

      const rawStablePoints = await rari.pools.stable.history.getPoolTokenExchangeRateHistory(
        startingPoint
      );

      const firstRawStablePointRate =
        parseFloat(rawStablePoints[0].rate) / 1e18;

      const stablePoints = rawStablePoints.map((point: any) => {
        return {
          x: new Date(point.timestamp).toLocaleDateString("en-US"),
          y: (
            (10000 * (parseFloat(point.balance) / 1e18)) /
            firstRawStablePointRate
          ).toFixed(2),
        };
      });

      const rawYieldPoints = await rari.pools.yield.history.getPoolTokenExchangeRateHistory(
        startingPoint
      );

      const firstRawYieldPointRate = parseFloat(rawYieldPoints[0].rate) / 1e18;

      const yieldPoints = rawYieldPoints.map((point: any) => {
        return {
          x: new Date(point.timestamp).toLocaleDateString("en-US"),
          y: (
            (10000 * (parseFloat(point.balance) / 1e18)) /
            firstRawYieldPointRate
          ).toFixed(2),
        };
      });

      const rawETHPoints = await rari.pools.ethereum.history.getPoolTokenExchangeRateHistory(
        startingPoint
      );

      const firstRawETHPointRate = parseFloat(rawETHPoints[0].rate) / 1e18;

      const ethPoints = rawETHPoints.map((point: any) => {
        return {
          x: new Date(point.timestamp).toLocaleDateString("en-US"),
          y: (
            (10000 * (parseFloat(point.balance) / 1e18)) /
            firstRawETHPointRate
          ).toFixed(2),
        };
      });

      return { ethPoints, yieldPoints, stablePoints };
    }
  );

  return (
    <>
      <Row
        color="#FFFFFF"
        mainAxisAlignment={{ md: "flex-start", xs: "center" }}
        crossAxisAlignment="center"
        px={DASHBOARD_BOX_SPACING.asPxString()}
        mt={topPadding.asPxString()}
        height={statsSize.asPxString()}
        width="100%"
      >
        <Text
          fontSize="xs"
          textAlign="center"
          textTransform="uppercase"
          letterSpacing="wide"
          color="#858585"
        >
          {t("Performance beginning with $10,000 deposited 1 year ago")}
        </Text>
      </Row>

      <Box height={chartSize.asPxString()} overflow="hidden">
        {isChartDataLoading ? (
          <Center expand>
            <Spinner color="#FFF" />
          </Center>
        ) : (
          <Chart
            options={PoolReturnChartOptions}
            type="line"
            width="100%"
            height="100%"
            series={[
              {
                name: "Yield Pool",
                data: chartData!.yieldPoints,
              },
              {
                name: "Stable Pool",
                data: chartData!.stablePoints,
              },
              {
                name: "ETH Pool",
                data: chartData!.ethPoints,
              },
            ]}
          />
        )}
      </Box>
    </>
  );
});

export default PoolsPerformanceChart;

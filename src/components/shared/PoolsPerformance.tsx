import { Box, Icon, Text } from "@chakra-ui/core";
import {
  useSpacedLayout,
  PixelSize,
  ResponsivePixelSize,
  PercentageSize,
  Row,
  Center,
} from "buttered-chakra";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PoolReturnChartOptions } from "../../utils/chartOptions";

import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import Chart from "react-apexcharts";

import { usePoolAPY } from "../../hooks/usePoolAPY";
import { Pool } from "../../context/PoolContext";
import { SimpleTooltip } from "./SimpleTooltip";
import { PropagateLoader } from "react-spinners";

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

  const { apy: ethAPY } = usePoolAPY(Pool.ETH);
  const { apy: stableAPY } = usePoolAPY(Pool.STABLE);
  const { apy: yieldAPY } = usePoolAPY(Pool.YIELD);

  const points = useMemo(() => {
    if (ethAPY && stableAPY && yieldAPY) {
      const ethAPYPercentPerDay = parseFloat(ethAPY.poolAPY) / 100 / 360;
      const stableAPYPercentPerDay = parseFloat(stableAPY.poolAPY) / 100 / 360;
      const yieldAPYPercentPerDay = parseFloat(yieldAPY.poolAPY) / 100 / 360;

      let now = new Date();

      let ethBalance = 10000;
      let stableBalance = 10000;
      let yieldBalance = 10000;

      let stablePoints = [];
      let yieldPoints = [];
      let ethPoints = [];

      for (let i = 1; i < 365; i++) {
        ethBalance =
          ethBalance + ethBalance * ethAPYPercentPerDay * (Math.random() * 2);
        stableBalance =
          stableBalance +
          stableBalance * stableAPYPercentPerDay * (Math.random() * 2);
        yieldBalance =
          yieldBalance +
          yieldBalance * yieldAPYPercentPerDay * (Math.random() * 2);

        now.setDate(now.getDate() + 1);

        const formattedDate =
          now.getMonth() + 1 + "/" + now.getDate() + "/" + now.getFullYear();

        stablePoints.push({
          x: formattedDate,

          y: stableBalance,
        });

        yieldPoints.push({
          x: formattedDate,

          y: yieldBalance,
        });

        ethPoints.push({
          x: formattedDate,

          y: ethBalance,
        });
      }

      return { ethPoints, stablePoints, yieldPoints };
    } else {
      return null;
    }
  }, [yieldAPY, stableAPY, ethAPY]);

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
        <SimpleTooltip
          label={t(
            "This chart is generated using the APYs of each pool (shown at the bottom of this page). It introduces a random variance in the APY each day, with a max of 2x the current pool APY, and a minimum of 0% APY. It does not account for movements in APY, divergence loss in the Yield Pool, or take into account ETH price. The ETH Pool simulation is not denominated in ETH, instead it simulates returns on USD using the current APY of the ETH Pool. In the ETH pool you are exposed to the price movements of ETH (which is not shown or accounted for in this simulation)."
          )}
        >
          <Text
            fontSize="xs"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing="wide"
            color="#858585"
          >
            {t("1 Year of Returns Simulated Using Current Yields")}
            <Icon name="info" ml="5px" size="10px" mb="3px" />
          </Text>
        </SimpleTooltip>
      </Row>

      <Box height={chartSize.asPxString()} overflow="hidden">
        {!points ? (
          <Center expand>
            <PropagateLoader size={20} color="#FFFFFF" loading />
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
                data: points!.yieldPoints,
              },
              {
                name: "Stable Pool",
                data: points!.stablePoints,
              },
              {
                name: "ETH Pool",
                data: points!.ethPoints,
              },
            ]}
          />
        )}
      </Box>
    </>
  );
});

export default PoolsPerformanceChart;

import { Box, Text } from "@chakra-ui/react";
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

import Chart from "react-apexcharts";

import { usePoolAPY } from "../../hooks/usePoolAPY";

import { SimpleTooltip } from "./SimpleTooltip";
import { PropagateLoader } from "react-spinners";
import { InfoIcon } from "@chakra-ui/icons";
import { Pool } from "../../utils/poolUtils";

const PoolsPerformanceChart = ({ size }: { size: number }) => {
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

  const ethAPY = usePoolAPY(Pool.ETH);
  const stableAPY = usePoolAPY(Pool.STABLE);
  const yieldAPY = usePoolAPY(Pool.YIELD);

  const points = useMemo(() => {
    if (ethAPY && stableAPY && yieldAPY) {
      const ethAPYPercentPerDay = parseFloat(ethAPY) / 100 / 365;
      const stableAPYPercentPerDay = parseFloat(stableAPY) / 100 / 365;
      const yieldAPYPercentPerDay = parseFloat(yieldAPY) / 100 / 365;

      let now = new Date();

      let ethBalance = 10000;
      let stableBalance = 10000;
      let yieldBalance = 10000;

      let stablePoints = [];
      let yieldPoints = [];
      let ethPoints = [];

      let i = 1;

      const dayInterval = 5;

      while (i < 365) {
        ethBalance =
          ethBalance +
          ethBalance *
            (ethAPYPercentPerDay * dayInterval) *
            (Math.random() * 2);
        stableBalance =
          stableBalance +
          stableBalance *
            (stableAPYPercentPerDay * dayInterval) *
            (Math.random() * 2);
        yieldBalance =
          yieldBalance +
          yieldBalance *
            (yieldAPYPercentPerDay * dayInterval) *
            (Math.random() * 2);

        now.setDate(now.getDate() + dayInterval);

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

        i += dayInterval;
      }

      return [
        {
          name: "Yield Pool",
          data: yieldPoints,
        },
        {
          name: "Stable Pool",
          data: stablePoints,
        },
        {
          name: "ETH Pool",
          data: ethPoints,
        },
      ];
    } else {
      return null;
    }
  }, [yieldAPY, stableAPY, ethAPY]);

  return (
    <>
      <Row
        color="#FFFFFF"
        mainAxisAlignment={{ md: "flex-start", base: "center" }}
        crossAxisAlignment="center"
        px={4}
        mt={topPadding.asPxString()}
        height={statsSize.asPxString()}
        width="100%"
      >
        <SimpleTooltip
          label={t(
            "This chart is generated using the APYs of each pool (shown at the bottom of this page). It introduces a random variance in the APY each day, with a max of 2x the current pool APY, and a minimum of 0% APY. It does not account for large changes in APY (greater than 2x), divergence loss in the Yield Pool, or take into account ETH price. The ETH Pool simulation is not denominated in ETH, instead it simulates returns on USD using the current APY of the ETH Pool. In the ETH pool you are exposed to the price movements of ETH (which is not shown or accounted for in this simulation)."
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
            <InfoIcon name="info" ml="5px" boxSize="9px" mb="3px" />
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
            series={points}
          />
        )}
      </Box>
    </>
  );
};

export default PoolsPerformanceChart;

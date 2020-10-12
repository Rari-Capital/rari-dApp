import { Box, Text } from "@chakra-ui/core";
import {
  useSpacedLayout,
  PixelSize,
  ResponsivePixelSize,
  PercentageSize,
  Row,
} from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { PoolReturnChartOptions } from "../../utils/chartOptions";

import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import Chart from "react-apexcharts";
import CaptionedStat from "./CaptionedStat";

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
          {t("Performance beginning with $10,000 on 8/1/2020")}
        </Text>
      </Row>

      <Box height={chartSize.asPxString()} overflow="hidden">
        <Chart
          options={PoolReturnChartOptions}
          type="line"
          width="100%"
          height="100%"
          series={[
            {
              name: "Yield Pool",
              data: [
                { x: "August 1, 2020", y: 10000 },
                { x: "August 3, 2020", y: 12120 },
                { x: "August 4, 2020", y: 15451 },
                { x: "August 5, 2020", y: 18562 },
              ],
            },
            {
              name: "Stable Pool",
              data: [
                { x: "August 1, 2020", y: 10000 },
                { x: "August 3, 2020", y: 10012 },
                { x: "August 4, 2020", y: 10124 },
                { x: "August 5, 2020", y: 12721 },
              ],
            },
            {
              name: "ETH Pool",
              data: [
                { x: "August 1, 2020", y: 10000 },
                { x: "August 3, 2020", y: 10230 },
                { x: "August 4, 2020", y: 11240 },
                { x: "August 5, 2020", y: 13112 },
              ],
            },
          ]}
        />
      </Box>
    </>
  );
});

export default PoolsPerformanceChart;

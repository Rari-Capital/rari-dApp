/*  This is a dynamically imported component on client-side only */

import { Box, Center } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { Spinner } from "@chakra-ui/spinner";
import CaptionedStat from "components/shared/CaptionedStat";
import { DASHBOARD_BOX_PROPS } from "components/shared/DashboardBox";
import { useRari } from "context/RariContext";
import { usePoolAPY } from "hooks/usePoolAPY";
import { usePoolInfoFromContext } from "hooks/usePoolInfo";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useQuery } from "react-query";
import { stringUsdFormatter } from "utils/bigUtils";
import {
  PercentageSize,
  PixelSize,
  ResponsivePixelSize,
  RowOnDesktopColumnOnMobile,
  useSpacedLayout,
} from "utils/chakraUtils";
import {
  DisableChartInteractions,
  ETHSelfReturnChartOptions,
  USDSelfReturnChartOptions,
} from "utils/chartOptions";
import { getSDKPool, Pool } from "utils/poolUtils";

import Chart from "react-apexcharts";

const millisecondsPerDay = 86400000;
const blocksPerDay = 6500;

const UserStatsAndChart = ({
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

  console.log({ topPadding, statsSize, chartSize });

  const { data: interestEarned, isLoading: isInterestEarnedLoading } = useQuery(
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
      }).balances.interestAccruedBy(address, Math.floor(startingBlock / 1000));

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
        px={4}
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
          _focus={{ outline: "none" }}
          isDisabled={hasNotDeposited}
          value={timeRange}
          onChange={(event) => {
            setTimeRange(event.target.value);
          }}
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
                      { x: "10/1/20", y: 1000 },
                      { x: "10/2/20", y: 1001 },
                      { x: "10/3/20", y: 1003 },
                      { x: "10/4/20", y: 1005 },
                      { x: "10/5/20", y: 1006 },
                      { x: "10/6/20", y: 1007 },
                      { x: "10/7/20", y: 1010 },
                      { x: "10/8/20", y: 1012 },
                      { x: "10/9/20", y: 1014 },
                      { x: "10/10/20", y: 1016 },
                      { x: "10/11/20", y: 1018 },
                    ]
                  : (chartData ?? []).map((point: any) => {
                      return {
                        x: new Date(point.timestamp * 1000).toLocaleDateString(
                          "en-US"
                        ),
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
};

export default UserStatsAndChart;

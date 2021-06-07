import dynamic from "next/dynamic";

// Components
import { Box, Heading, Text } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";
import LineChart from "components/charts/LineChart/alt";

// Hooks
import { useEffect, useMemo, useState } from "react";

// Utils
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { Column, Row } from "utils/chakraUtils";

// Types
import { TokenData } from "hooks/useTokenData";
import useTokenMarketInfo, {
  MarketInterval,
} from "hooks/tokens/useTokenMarketInfo";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";

const MarketChart = ({ token, ...boxProps }: { token: TokenData }) => {
  const isMobile = useIsSmallScreen();

  const [priceHover, setPriceHover] = useState<number | undefined>(undefined);
  const [marketInterval, setMarketInterval] = useState<MarketInterval>(
    MarketInterval.DAY
  );

  const { granularTokenMarketInfo, aggregateTokenMarketInfo } =
    useTokenMarketInfo(token.address, marketInterval) ?? {};

  const formattedChartData = useMemo(() => {
    return granularTokenMarketInfo
      ? granularTokenMarketInfo.prices.map(
          ([unixTime, priceUSD]: Number[]) => ({
            time: unixTime,
            value: priceUSD,
          })
        )
      : undefined;
  }, [granularTokenMarketInfo]);

  useEffect(() => {
    if (!priceHover && aggregateTokenMarketInfo) {
      setPriceHover(aggregateTokenMarketInfo.market_data.current_price.usd);
    }
  }, [priceHover, aggregateTokenMarketInfo]);

  return (
    <DashboardBox
      w="100%"
      h="450px"
      {...boxProps}
    >
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
      >
        {/* Price and % change */}
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          w="100%"
          h="20%"
          p={4}
        >
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <Box>
              <Heading>
                {priceHover ? smallUsdFormatter(priceHover) : "-"}
              </Heading>
            </Box>
            <Box ml={3} alignSelf="flex-start">
              <Heading
                size="xs"
                color={
                  aggregateTokenMarketInfo
                    ? aggregateTokenMarketInfo.market_data
                        .price_change_percentage_24h! > 0
                      ? "green"
                      : "red"
                    : ""
                }
              >
                {aggregateTokenMarketInfo &&
                priceHover ===
                  aggregateTokenMarketInfo?.market_data?.current_price?.usd
                  ? `${aggregateTokenMarketInfo?.market_data?.price_change_percentage_24h?.toFixed(
                      2
                    )}%` ?? null
                  : null}
              </Heading>
            </Box>
          </Row>

          <Row
            mainAxisAlignment="flex-end"
            crossAxisAlignment="flex-start"
            bg=""
          >
            <Heading
              size="xs"
              ml={2}
              color={marketInterval === MarketInterval.DAY ? "green" : ""}
              _hover={{
                cursor: "pointer",
                color: "green",
              }}
              onClick={() => setMarketInterval(MarketInterval.DAY)}
            >
              1D
            </Heading>
            <Heading
              size="xs"
              ml={2}
              color={marketInterval === MarketInterval.WEEK ? "green" : ""}
              _hover={{
                cursor: "pointer",
                color: "green",
              }}
              onClick={() => setMarketInterval(MarketInterval.WEEK)}
            >
              1W
            </Heading>
            <Heading
              size="xs"
              ml={2}
              color={marketInterval === MarketInterval.MONTH ? "green" : ""}
              _hover={{
                cursor: "pointer",
                color: "green",
              }}
              onClick={() => setMarketInterval(MarketInterval.MONTH)}
            >
              1M
            </Heading>
            <Heading
              size="xs"
              ml={2}
              color={marketInterval === MarketInterval.YEAR ? "green" : ""}
              _hover={{
                cursor: "pointer",
                color: "green",
              }}
              onClick={() => setMarketInterval(MarketInterval.YEAR)}
            >
              1Y
            </Heading>
          </Row>
        </Row>

        {/* Chart */}
        <Box
          // bg="aqua"
          h="100%"
          w="100%"
        >
          <LineChart
            data={formattedChartData}
            marketInterval={marketInterval}
            color={token?.color ?? "white"}
            setValue={setPriceHover}
            value={priceHover}
          />
        </Box>

        {/* Numeric data */}
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          w="100%"
          h="20%"
          p={4}
          overflowX="scroll"
          borderTop="1px solid grey"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            mr={10}
          >
            <Heading size="sm">Market Cap</Heading>
            <Text>
              {shortUsdFormatter(
                aggregateTokenMarketInfo?.market_data?.market_cap?.usd ?? 0
              )}
            </Text>
          </Column>
          {!isMobile && (
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              mr={10}
            >
              <Heading size="sm">Volume(24h)</Heading>
              <Text>
                {shortUsdFormatter(
                  aggregateTokenMarketInfo?.market_data?.total_volume?.usd ?? 0
                )}
              </Text>
            </Column>
          )}

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            mr={10}
          >
            <Heading size="sm">24hr high</Heading>
            <Text>
              {smallUsdFormatter(
                aggregateTokenMarketInfo?.market_data?.high_24h?.usd ?? 0
              )}
            </Text>
          </Column>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
          >
            <Heading size="sm">24hr low</Heading>
            <Text>
              {smallUsdFormatter(
                aggregateTokenMarketInfo?.market_data?.low_24h?.usd ?? 0
              )}
            </Text>
          </Column>

          {!isMobile && (
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
            >
              <Heading size="sm">Circulating Supply</Heading>
              <Text>
                {shortUsdFormatter(
                  aggregateTokenMarketInfo?.market_data?.circulating_supply ?? 0
                )}
              </Text>
            </Column>
          )}
        </Row>
      </Column>
    </DashboardBox>
  );
};

export default MarketChart;

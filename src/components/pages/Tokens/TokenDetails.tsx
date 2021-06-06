import dynamic from "next/dynamic";

import { Box, Heading, Link, Image, Spinner, Text } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "utils/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { useAllTokenData } from "hooks/tokens/useTokenDataBySymbol";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { filterPoolName, USDPricedFuseAsset } from "utils/fetchFusePoolData";

import { PoolRow } from "components/pages/Fuse/FusePoolsPage";
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { TokenData } from "hooks/useTokenData";
import { useEffect, useMemo, useState } from "react";
import { unixToDate } from "utils/date";


// import LineChart from "components/charts/LineChart/alt"

const LineChart = dynamic(() => import("components/charts/LineChart/alt"), {
  ssr: false,
  loading: () => <Spinner />,
});

const TokenDetails = ({ token }: { token: TokenData }) => {
  const isMobile = useIsSmallScreen();

  const [priceHover, setPriceHover] = useState<number | undefined>(undefined);

  const {
    tokenData,
    granularTokenMarketInfo,
    aggregateTokenMarketInfo,
    fuseDataForAsset,
  } = useAllTokenData(token);

  const { poolsWithThisAsset } = fuseDataForAsset;

  const formattedChartData = useMemo(() => {
    return granularTokenMarketInfo
      ? granularTokenMarketInfo.prices.map(([unixTime, priceUSD]) => ({
          time: unixTime,
          value: priceUSD,
        }))
      : [];
  }, [granularTokenMarketInfo]);

  useEffect(() => {
    if (!priceHover && aggregateTokenMarketInfo) {
      setPriceHover(aggregateTokenMarketInfo.market_data.current_price.usd);
    }
  }, [priceHover, aggregateTokenMarketInfo]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      mt={10}
      width="100%"
      px={isMobile ? 3 : 10}
    >
      {/* Header */}
      <Header isMobile={isMobile} tokenData={token} />

      <RowOrColumn
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        isRow={!isMobile}
        width="100%"
        // bg="red"
      >
        {/* Column 1 */}
        <Column
          width="100%"
          height="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          p={2}
          flexBasis={"65%"}
        >
          {/* Chart */}
          <DashboardBox
            w="100%"
            h="450px"
            // bg="blue"
            my={3}
          >
            <Column
              mainAxisAlignment="space-between"
              crossAxisAlignment="flex-start"
              w="100%"
              h="100%"
              // bg="pink"
            >
              {/* Price and % change */}
              <Row
                mainAxisAlignment="space-between"
                crossAxisAlignment="flex-start"
                w="100%"
                h="20%"
                p={4}
                //  bg="lime"
              >
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
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
                        aggregateTokenMarketInfo?.market_data?.current_price
                          ?.usd
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
                  <Heading size="xs" ml={2}>
                    1D
                  </Heading>
                  <Heading size="xs" ml={2}>
                    1W
                  </Heading>
                  <Heading size="xs" ml={2}>
                    1M
                  </Heading>
                  <Heading size="xs" ml={2}>
                    1Y
                  </Heading>
                </Row>
              </Row>

              {/* Chart */}
              <Box
                flex="1 0"
                // bg="aqua"
                h="100%"
                w="100%"
              >
                <LineChart
                  data={formattedChartData}
                  // height={220}
                  // minHeight={332}
                  color={"pink"}
                  // label={leftLabel}
                  setValue={setPriceHover}
                  value={priceHover}
                  // setLabel={setLeftLabel}
                />
              </Box>

              {/* Numeric data */}
              <Row
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                w="100%"
                h="20%"
                p={4}
              >
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                  mr={10}
                >
                  <Heading size="sm">Market Cap</Heading>
                  <Text>
                    {shortUsdFormatter(
                      aggregateTokenMarketInfo?.market_data?.market_cap?.usd ??
                        0
                    )}
                  </Text>
                </Column>
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                  mr={10}
                >
                  <Heading size="sm">Volume(24h)</Heading>
                  <Text>
                    {shortUsdFormatter(
                      aggregateTokenMarketInfo?.market_data?.total_volume
                        ?.usd ?? 0
                    )}
                  </Text>
                </Column>
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
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="flex-start"
                >
                  <Heading size="sm">Circulating Supply</Heading>
                  <Text>
                    {shortUsdFormatter(
                      aggregateTokenMarketInfo?.market_data
                        ?.circulating_supply ?? 0
                    )}
                  </Text>
                </Column>
              </Row>
            </Column>
          </DashboardBox>

          {/* Fuse Pools */}
          <DashboardBox
            height="400px"
            w="100%"
            mr={5}
            mt={0}
            overflowY="scroll"
            //   bg="purple"
          >
            <Heading>Fuse Pools</Heading>
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              width="100%"
            >
              {poolsWithThisAsset?.map((pool, index) => {
                return (
                  <PoolRow
                    key={pool.id}
                    poolNumber={pool.id!}
                    name={filterPoolName(pool.name)}
                    tvl={pool.totalSuppliedUSD}
                    borrowed={pool.totalBorrowedUSD}
                    tokens={pool.assets.map((asset: USDPricedFuseAsset) => ({
                      symbol: asset.underlyingSymbol,
                      address: asset.underlyingToken,
                    }))}
                    noBottomDivider={index === poolsWithThisAsset.length - 1}
                  />
                );
              }) ?? <Spinner />}
            </Column>
          </DashboardBox>

          {/* Tx Hist */}
          <DashboardBox
            w="100%"
            // h="400px"
            h="100%"
            mt={5}
          >
            <Heading>Tx History</Heading>
          </DashboardBox>
        </Column>

        {/*  Col 2 - 4sq, Trending, Ad, history */}
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          w={"100%"}
          h={"100%"}
          // bg={"aquamarine"}
          flexBasis={"35%"}
          mt={isMobile ? 5 : 0}
          p={2}
        >
          {/* Foursq */}
          <DashboardBox height="100%" w="100%">
            <Heading>Foursquare</Heading>
          </DashboardBox>

          <DashboardBox height="100%" w="100%" h="100%" mt={0}>
            <Heading>Earn stuff</Heading>
          </DashboardBox>

          <DashboardBox height="100%" w="100%" h="100%" mt={5}>
            <Heading>Fuse stuff</Heading>
          </DashboardBox>
        </Column>
      </RowOrColumn>
    </Column>
  );
};

export default TokenDetails;

const Header = ({
  isMobile,
  tokenData,
}: {
  isMobile: boolean;
  tokenData?: TokenData;
}) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      // bg="aqua"
      w="100%"
      h="100%"
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        w="100%"
        h="100%"
        p={3}
      >
        {/* Token Name + Logo */}
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          flexBasis={"75%"}
          //   bg="purple"
        >
          <Image
            src={
              tokenData?.logoURL ??
              "https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png"
            }
            boxSize="50"
          />
          <Heading ml={4} size={isMobile ? "md" : "lg"}>
            {tokenData?.name} ({tokenData?.symbol}){" "}
          </Heading>
        </Row>

        {/* Links */}
        <Row
          mainAxisAlignment="flex-end"
          crossAxisAlignment="center"
          //   bg="blue"
          w="100%"
          h="100%"
          flexBasis={"25%"}
        >
          <Box size="sm" mr={3}>
            <Link href="/home" isExternal>
              <Image
                src={
                  "https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png"
                }
                boxSize="20px"
              />
            </Link>
          </Box>
          <Box size="sm" mr={3}>
            <Link
              href={`https://etherscan.io/address/${tokenData?.address}`}
              isExternal
            >
              <Image
                src={
                  "https://etherscan.io/images/brandassets/etherscan-logo-circle.jpg"
                }
                boxSize="20px"
              />
            </Link>
          </Box>
          <Box size="sm" mr={3}>
            <Link
              href={`https://info.uniswap.org/#/tokens/${tokenData?.address}`}
              isExternal
            >
              <Image
                src={"https://cryptologos.cc/logos/uniswap-uni-logo.png"}
                boxSize="20px"
              />
            </Link>
          </Box>
        </Row>
      </Row>
    </Row>
  );
};

import { Box, Heading, Link, Image, Spinner, Text } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "utils/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { useAllTokenData } from "hooks/tokens/useTokenDataBySymbol";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useMemo } from "react";
import { useParams } from "react-router";
import { filterPoolName, USDPricedFuseAsset } from "utils/fetchFusePoolData";

import { PoolRow } from "components/pages/Fuse/FusePoolsPage";
import { getMinMaxOf2DIndex } from "utils/tokenUtils";
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { TokenData } from "hooks/useTokenData";

const TokenDetails = ({ token }: { token: TokenData }) => {
  const isMobile = useIsSmallScreen();

  const {
    tokenData,
    granularTokenMarketInfo,
    aggregateTokenMarketInfo,
    fuseDataForAsset,
  } = useAllTokenData(token);

  const { poolsWithThisAsset } = fuseDataForAsset;

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
        bg="red"
      >
        {/* Column 1 */}
        <Column
          width="100%"
          height="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          p={2}
          flexBasis={"65%"}
          bg="pink"
        >
          {/* Chart */}
          <DashboardBox
            position="relative"
            w="100%"
            h="400px"
            // bg="blue"
            my={3}
          >
            <Row
              mainAxisAlignment="space-between"
              crossAxisAlignment="flex-start"
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="20%"
              p={4}
              //  bg="lime"
            >
              {/* Price and % change */}
              <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                <Box>
                  <Heading>
                    {smallUsdFormatter(
                      aggregateTokenMarketInfo?.market_data?.current_price
                        ?.usd ?? 0
                    )}
                  </Heading>
                </Box>
                <Box ml={3} alignSelf="flex-start">
                <Heading 
                size="xs"
                color={ 
                  aggregateTokenMarketInfo
                    ? aggregateTokenMarketInfo.market_data.price_change_percentage_24h! > 0
                      ? 'green'
                      : 'red'
                    : ''
                }
                > 
                    {
                      aggregateTokenMarketInfo?.market_data?.price_change_percentage_24h?.toFixed(2)
                      ?? 0
                    }%
                  </Heading>
                </Box>
              </Row>

              <Row mainAxisAlignment="flex-end" crossAxisAlignment="flex-start" bg="">
                    <Heading size="xs"  ml={2}>1D</Heading>
                    <Heading size="xs"  ml={2}>1W</Heading>
                    <Heading size="xs"  ml={2}>1M</Heading>
                    <Heading size="xs"  ml={2}>1Y</Heading>
              </Row>
            </Row>
            <Row
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              position="absolute"
              bottom={0}
              left={0}
              w="100%"
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
                    aggregateTokenMarketInfo?.market_data?.market_cap?.usd ?? 0
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
                    aggregateTokenMarketInfo?.market_data?.total_volume?.usd ??
                      0
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
                    aggregateTokenMarketInfo?.market_data?.circulating_supply ??
                      0
                  )}
                </Text>
              </Column>
            </Row>
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
      bg="aqua"
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

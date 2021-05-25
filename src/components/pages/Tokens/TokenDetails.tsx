import { Box, Heading, Link, Image, Spinner, Text } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "buttered-chakra";
import DashboardBox from "components/shared/DashboardBox";
import useTokenDataBySymbol from "hooks/tokens/useTokenDataBySymbol";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useMemo } from "react";
import { useParams } from "react-router";
import { filterPoolName, USDPricedFuseAsset } from "utils/fetchFusePoolData";

import { PoolRow } from "components/pages/Fuse/FusePoolsPage";
import { getMinMaxOf2DIndex } from "utils/tokenUtils";
import { smallUsdFormatter } from "utils/bigUtils";

const TokenDetails = () => {
  const { symbol } = useParams();
  const isMobile = useIsSmallScreen();

  const tokenSymbol = useMemo(() => symbol.toUpperCase(), [symbol]);

  const { tokenData, tokenMarketData, fuseDataForAsset } =
    useTokenDataBySymbol(tokenSymbol);

  const minMax = useMemo(() => {
    if (tokenMarketData) {
      const { prices } = tokenMarketData;
      const stuff = getMinMaxOf2DIndex(prices, 1);
      return stuff;
    }
  }, [tokenMarketData]);

  const { poolsWithThisAsset } = fuseDataForAsset;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      width="100%"
    >
      {/* Header */}
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        w="100%"
        h="100%"
        px={isMobile ? 3 : 10}
        mt={10}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          //   bg="aqua"
          w="100%"
          h="100%"
        >
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            w="100%"
            h="100%"
            mr={!isMobile ? 5 : 0}
            p={3}
            flexBasis={!isMobile ? "65%" : "100%"}
            // bg="lime"
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
          {!isMobile && <Box w="100%" flexBasis={"35%"} />}
        </Row>

        {/* Chart + Foursquare */}
        <RowOrColumn
          width="100%"
          height={"400px"}
          isRow={!isMobile}
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          p={2}
        //   bg="pink"
        >
          {/* Chart */}
          <DashboardBox
            height="100%"
            position="relative"
            w="100%"
            h="100%"
            // bg="blue"
            mr={10}
            mt={0}
            flexBasis={"65%"}
          >
            <Heading>Chart</Heading>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              position="absolute"
              bottom={0}
              left={0}
            //   bg={"pink"}
              zIndex={1000}
              w="100%"
              p={4}
            >
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                mr={10}
              >
                <Heading size="sm">24hr high</Heading>
                <Text>{smallUsdFormatter(minMax?.max ?? 0)}</Text>
              </Column>
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
              >
                <Heading size="sm">24hr low</Heading>
                <Text>{smallUsdFormatter(minMax?.min ?? 0)}</Text>
              </Column>
            </Row>
          </DashboardBox>

          {/* Foursq */}
          <DashboardBox
            height="100%"
            w="300px"
            flexBasis={"35%"}
            mt={isMobile ? 2 : 0}
          >
            <Heading>Foursquare</Heading>
          </DashboardBox>
        </RowOrColumn>

        {/* Fuse etc */}
        <RowOrColumn
          width="100%"
          height={"800px"}
          isRow={!isMobile}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          p={2}
        //   bg="lime"
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w={"100%"}
            h={"100%"}
            flexBasis={"65%"}
            mr={10}
            // bg="bisque"
          >
            {/* Fuse Pools */}
            <DashboardBox
              //   height="400px"
              h="100%"
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

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            w={"100%"}
            h={"100%"}
            // bg={"aquamarine"}
            flexBasis={"35%"}
            mt={isMobile ? 5 : 0}
          >
            <DashboardBox height="100%" w="100%" h="100%" mt={0}>
              <Heading>Earn stuff</Heading>
            </DashboardBox>

            <DashboardBox height="100%" w="100%" h="100%" mt={5}>
              <Heading>Fuse stuff</Heading>
            </DashboardBox>
          </Column>
        </RowOrColumn>
      </Column>
    </Column>
  );
};

export default TokenDetails;

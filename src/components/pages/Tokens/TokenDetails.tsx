import dynamic from "next/dynamic";

import { Box, Heading, Link, Image } from "@chakra-ui/react";
import { Column, Row, RowOrColumn } from "lib/chakraUtils";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";

import { TokenData } from "hooks/useTokenData";
import MarketChart from "components/modules/MarketChart";
import AssetOpportunities from "components/modules/AssetOpportunities";
// import Foursquare from "components/modules/Foursquare";
import TrendingOpportunities from "components/modules/TrendingOpportunities";
import AssetBalance from "components/modules/AssetBalance";
import InternalAd from "components/modules/InternalAd";
// import AssetHistory from "components/modules/AssetHistory";

const AssetBorrowLend = dynamic(
  () => import("components/modules/AssetBorrowLend"),
  { ssr: false }
);

const TokenDetails = ({ token }: { token: TokenData }) => {
  const isMobile = useIsSmallScreen();

  console.log({ token });

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      mt={5}
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
          flexBasis={"70%"}
          flexGrow={0}
        >
          {/* Chart */}
          <MarketChart token={token} mb={5} />

          <AssetBalance token={token} mb={5} />

          {/* Fuse Pools */}
          <AssetOpportunities token={token} />

          {/* Tx Hist
          <DashboardBox
            w="100%"
            // h="400px"
            h="100%"
            mt={5}
          >
            <Heading>Tx History</Heading>
          </DashboardBox> */}
        </Column>

        {/*  Col 2 - 4sq, Trending, Ad, history */}
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          w={"100%"}
          h={"100%"}
          flexBasis={"30%"}
          mt={isMobile ? 5 : 0}
          p={2}
        >
          {/* Foursq */}
          {/* <Foursquare token={token}  mb={5}/> */}
          <AssetBorrowLend token={token} mb={5} />

          <TrendingOpportunities token={token} mb={5} />

          <InternalAd mb={5} />

          {/* <AssetHistory token={token} /> */}

          {/* <DashboardBox height="100%" w="100%" h="100%" mt={5}>
            <Heading>Fuse stuff</Heading>
          </DashboardBox> */}
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
                src={"/static/icons/etherscan-logo-light-circle.svg"}
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
                src={"/static/icons/uniswap-uni-logo.svg"}
                boxSize="20px"
              />
            </Link>
          </Box>
        </Row>
      </Row>
    </Row>
  );
};

import { Avatar } from "@chakra-ui/avatar";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import AppLink from "components/shared/AppLink";
import DashboardBox from "components/shared/DashboardBox";

import { TrendingOpportunity } from "constants/trending";
import { useTrendingOpportunities } from "hooks/opportunities/useTrendingOpportunities";

import { TokenData } from "hooks/useTokenData";
import React, { useMemo } from "react";
import { Column, Row } from "lib/chakraUtils";
import { SubgraphCToken } from "pages/api/explore";
import { RariApiTokenData, TokensDataMap } from "types/tokens";

const TrendingOpportunities = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  const { assets, tokensData } = useTrendingOpportunities() ?? {};

  return (
    <DashboardBox height="350px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        py={3}
        px={5}
        pt={1}
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          flexBasis="25%"
          w="100%"
        >
          <Heading fontSize="xl">Trending Opportunities</Heading>
          <AppLink fontSize="sm" color="grey" fontWeight="bold" href="/">
            View All
          </AppLink>
        </Row>
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          flexBasis="75%"
          w="100%"
        >
          <SimpleGrid columns={2} spacing={4} h="100%" w="100%">
            {assets?.map((a, i) => (
              <TrendingBox
                key={i}
                asset={a}
                tokenData={tokensData?.[a.underlying.address]}
              />
            ))}
          </SimpleGrid>
        </Row>
      </Column>
    </DashboardBox>
  );
};

export default TrendingOpportunities;

const TrendingBox = ({
  asset,
  tokenData,
}: {
  asset: SubgraphCToken;
  tokenData?: RariApiTokenData;
}) => {
  // const { monthlyAPY, weeklyAPY } = useMemo(() => {
  //   const APY = asset.opportunityData?.poolAPY;
  //   return {
  //     monthlyAPY: APY ? APY / 12 : null,
  //     weeklyAPY: APY ? APY / 52 : null,
  //   };
  // }, [trendingOpportunity]);

  return (
    <AppLink
      w="100%"
      h="100%"
      href={"/fuse/pool/" + asset.pool?.index}
      style={{ textDecoration: "none" }}
    >
      <DashboardBox w="100%" h="100%">
        <Column
          mainAxisAlignment="space-around"
          crossAxisAlignment="flex-start"
          py={2}
          px={3}
          w="100%"
          h="100%"
          borderRadius="md"
          _hover={{ bg: "#272727", cursor: "pointer" }}
        >
          <Row
            mainAxisAlignment="space-around"
            crossAxisAlignment="center"
            w="100%"
          >
            <Avatar
              bg="#FFF"
              boxSize="35px"
              name={asset.underlying?.symbol ?? "Symbol"}
              src={
                tokenData?.logoURL ??
                "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
              }
            />
            <Heading fontSize="md">{`${asset.underlying.symbol}`}</Heading>
          </Row>

          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            w="100%"
          >
            {asset && (
              <>
                <Heading fontSize="md">
                  {`${parseFloat(asset.supplyAPY).toFixed(2)}% APY`}
                </Heading>
              </>
            )}
          </Row>

          {/* <Text fontSize="sm" fontWeight="bold">
          {monthlyAPY &&
            `${monthlyAPY.toFixed(
              1
            )}% monthly,`}
        </Text> 
            <Text fontSize="sm" fontWeight="bold" color="grey">
              {weeklyAPY && `${weeklyAPY.toFixed(1)}% weekly`}
            </Text>
          </>
        )}
        {/* {
        trendingOpportunity &&
        trendingOpportunity.opportunityData &&
        trendingOpportunity.token &&
        weeklyAPY ? (
          <>
            <Heading fontSize="md">
              {trendingOpportunity.token.symbol}{" "}
              {` - ${trendingOpportunity.opportunityData.poolAPY}% APY`}
            </Heading>
            {/* <Text fontSize="sm" fontWeight="bold">
          {monthlyAPY &&
            `${monthlyAPY.toFixed(
              1
            )}% monthly,`}
        </Text> 
            <Text fontSize="sm" fontWeight="bold" color="grey">
              {weeklyAPY && `${weeklyAPY.toFixed(1)}% weekly`}
            </Text>
          </>
        ) : (
          <Spinner />
        )} */}
        </Column>
      </DashboardBox>
    </AppLink>
  );
};

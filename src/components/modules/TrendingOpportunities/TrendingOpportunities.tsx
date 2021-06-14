import { Avatar } from "@chakra-ui/avatar";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/layout";
import AppLink from "components/shared/AppLink";
import DashboardBox from "components/shared/DashboardBox";
import { TrendingOpportunity } from "constants/trending";
import { useTrendingOpportunities } from "hooks/opportunities/useTrendingOpportunities";
import { TokenData } from "hooks/useTokenData";
import React, { useMemo } from "react";
import { Column, Row } from "utils/chakraUtils";

const TrendingOpportunities = ({
  token,
  ...boxProps
}: {
  token: TokenData;
  [x: string]: any;
}) => {
  const trendingOpportunities = useTrendingOpportunities();

  return (
    <DashboardBox height="350px" w="100%" {...boxProps}>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        p={3}
        py={5}
        px={5}
        pb={3}
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
            {trendingOpportunities.map((t) => (
              <TrendingBox trendingOpportunity={t} />
            ))}
          </SimpleGrid>
        </Row>
      </Column>
    </DashboardBox>
  );
};

export default TrendingOpportunities;

const TrendingBox = ({
  trendingOpportunity,
}: {
  trendingOpportunity: TrendingOpportunity;
}) => {
  const { monthlyAPY, weeklyAPY } = useMemo(() => {
    const APY = trendingOpportunity.opportunityData?.poolAPY;
    return {
      monthlyAPY: APY ? APY / 12 : null,
      weeklyAPY: APY ? APY / 52 : null,
    };
  }, [trendingOpportunity]);

  return (
    <AppLink w="100%" h="100%" href="/pools/stable">
      <Column
        mainAxisAlignment="space-around"
        crossAxisAlignment="flex-start"
        py={2}
        px={3}
        w="100%"
        h="100%"
        borderRadius="md"
        _hover={{ bg: "grey", cursor: "pointer" }}
      >
        <Avatar
          bg="#FFF"
          boxSize="35px"
          name={trendingOpportunity.token?.symbol ?? "Symbol"}
          src={
            trendingOpportunity?.token?.logoURL ??
            "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
          }
        />
        <Heading fontSize="md">
          {trendingOpportunity.token?.symbol}{" "}
          {trendingOpportunity.opportunityData?.poolAPY &&
            ` - ${trendingOpportunity.opportunityData.poolAPY}% APY`}
        </Heading>
        {/* <Text fontSize="sm" fontWeight="bold">
          {monthlyAPY &&
            `${monthlyAPY.toFixed(
              1
            )}% monthly,`}
        </Text> */}
        <Text fontSize="sm" fontWeight="bold" color="grey">
          {weeklyAPY && `${weeklyAPY.toFixed(1)}% weekly`}
        </Text>
      </Column>
    </AppLink>
  );
};

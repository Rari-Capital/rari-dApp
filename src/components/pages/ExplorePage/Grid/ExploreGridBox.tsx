import { Heading, Skeleton } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import AppLink from "components/shared/AppLink";
import { Column, Row } from "utils/chakraUtils";
import { SubgraphMarket } from "pages/api/explore";
import { convertMantissaToAPY, convertMantissaToAPR } from "utils/apyUtils";
import { useMemo } from "react";
import { shortUsdFormatter } from "utils/bigUtils";

export enum ExploreGridBoxMetric {
  TOTAL_BORROWS,
  TOTAL_SUPPLY,
  SUPPLY_RATE,
  BORROW_RATE,
}

// top earning stablecoin, newest yield agg, most popular asset, top earning asset, and most borrowed asset?
export const FuseAssetGridBox = ({
  bg,
  heading = "Top earning Stablecoin",
  data,
  metric = ExploreGridBoxMetric.SUPPLY_RATE,
}: {
  bg: string;
  heading?: string;
  data?: SubgraphMarket;
  metric: ExploreGridBoxMetric;
}) => {
  const loading = !data;

  const supplyRate = convertMantissaToAPY(data?.supplyRate, 365);
  const monthlySupplyRate = supplyRate / 12;
  const weeklySupplyRate = monthlySupplyRate / 4;

  const borrowRate = convertMantissaToAPR(data?.borrowRate);

  const subtitle: string = useMemo(() => {
    switch (metric) {
      case ExploreGridBoxMetric.SUPPLY_RATE:
        return `${weeklySupplyRate.toFixed(1)}% weekly, 
        ${monthlySupplyRate.toFixed(1)}% monthly`;
      case ExploreGridBoxMetric.BORROW_RATE:
        return `${borrowRate}% Borrow APR`;
      case ExploreGridBoxMetric.TOTAL_BORROWS:
        return `${shortUsdFormatter(data?.totalBorrows ?? 0)} Borrowed`;
      case ExploreGridBoxMetric.TOTAL_SUPPLY:
        return `${shortUsdFormatter(data?.totalSupply ?? 0)} Supplied`;
      default:
        return null;
    }
  }, [metric, monthlySupplyRate, weeklySupplyRate, data]);

  return (
    <AppLink
      href={
        data?.pool?.id
          ? `/fuse/pool/${data.pool.index}`
          : data?.underlyingAddress
          ? `/token/${data.underlyingAddress}`
          : `#`
      }
      className="no-underline"
      passHref
    >
      <Column
        w="100%"
        h="100%"
        bg={bg}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        p={4}
        border="1px solid #272727"
        _hover={{ border: "1px solid grey", bg: "grey" }}
      >
        <Row
          h="100%"
          w="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
        >
          <Column
            w="100%"
            h="100%"
            bg={bg}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            flexBasis="75%"
            flexGrow={1}
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Heading fontSize="lg" color="grey">
                {heading}
              </Heading>
            </Row>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              mt="auto"
            >
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
              >
                <Skeleton
                  isLoaded={!loading}
                  height={loading ? "20px" : "100%"}
                  my={1}
                >
                  <Heading fontSize="2xl">{data?.tokenData?.symbol}</Heading>
                </Skeleton>

                <Skeleton
                  isLoaded={!loading}
                  height={loading ? "20px" : "100%"}
                >
                  <Heading fontSize="sm" color="grey">
                    {subtitle}
                  </Heading>
                </Skeleton>
              </Column>
            </Row>
          </Column>

          <Column
            w="100%"
            h="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            flexBasis="25%"
          >
            {/* <SkeletonCircle size="10" bg="pink"/> */}
            {data?.tokenData?.logoURL && (
              <Avatar src={data?.tokenData?.logoURL} boxSize={"75%"} />
            )}
          </Column>
        </Row>
      </Column>
    </AppLink>
  );
};

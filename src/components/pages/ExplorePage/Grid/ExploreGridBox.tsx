import { Heading, Skeleton } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import AppLink from "components/shared/AppLink";
import { Column, Row } from "lib/chakraUtils";
import { SubgraphMarket } from "pages/api/explore";
import { convertMantissaToAPY, convertMantissaToAPR } from "utils/apyUtils";
import { useMemo } from "react";
import { shortUsdFormatter } from "utils/bigUtils";
// import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

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
  const { fuse } = useRari();

  const loading = !data;

  const supplyRate = convertMantissaToAPY(data?.supplyRate, 365);
  const monthlySupplyRate = supplyRate / 12;
  const weeklySupplyRate = monthlySupplyRate / 4;

  const borrowRate = convertMantissaToAPR(data?.borrowRate);

  // const { data: ethPrice } = useQuery("ethPrice", async () => {
  //   return fuse.web3.utils.fromWei(await fuse.getEthUsdPriceBN()) as any;
  // });

  // const totalSupplyUSD = useMemo(() => {
  //   const { totalSupply, underlyingPrice } = data ?? {};
  //   return totalSupply && underlyingPrice && ethPrice
  //     ? ((totalSupply * underlyingPrice) / 1e36) * ethPrice
  //     : 0;
  // }, [ethPrice, data]);

  // const totalBorrowsUSD = useMemo(() => {
  //   const { totalBorrows, underlyingPrice } = data ?? {};
  //   return totalBorrows && underlyingPrice && ethPrice
  //     ? ((totalBorrows * underlyingPrice) / 1e36) * ethPrice
  //     : 0;
  // }, [ethPrice, data]);

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
        return "";
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
    >
      <Column
        w="100%"
        h="100%"
        bg={bg}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        p={4}
        className="hover-row"
        border="1px solid #272727"
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
                  <Heading fontSize="2xl">
                    {data?.tokenData?.symbol} - Pool {data?.pool?.index}
                  </Heading>
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

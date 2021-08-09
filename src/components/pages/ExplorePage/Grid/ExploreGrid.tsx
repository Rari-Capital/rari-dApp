import { SimpleGrid } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";
import { ExploreGridBoxMetric, FuseAssetGridBox } from "./ExploreGridBox";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import useSWR from "swr";

// Utils
import axios from "axios";

// Types
import { APIExploreReturn } from "pages/api/explore/data";

// Fetchers
const exploreFetcher = async (route: string): Promise<APIExploreReturn> => {
  const { data } = await axios.get(route);
  return data;
};

const ExploreGrid = () => {
  const isMobile = useIsSmallScreen();
  const { data, error } = useSWR("/api/explore/data", exploreFetcher);

  const { results, tokensData } = data ?? {};

  const {
    topEarningFuseStable,
    topEarningFuseAsset,
    mostPopularAsset,
    mostBorrowedFuseAsset,
    cheapestStableBorrow,
  } = results ?? {};

  return (
    <DashboardBox w="100%" h="100%">
      <SimpleGrid columns={isMobile ? 2 : 3} spacing={0} h="100%" w="100%">
        <FuseAssetGridBox
          bg=""
          heading="Top Earning Stablecoin"
          data={topEarningFuseStable}
          tokenData={
            topEarningFuseStable &&
            tokensData &&
            tokensData[topEarningFuseStable.underlyingToken]
          }
          metric={ExploreGridBoxMetric.SUPPLY_RATE}
        />
        <FuseAssetGridBox
          bg=""
          heading="Most Popular Asset"
          data={mostPopularAsset}
          tokenData={
            mostPopularAsset &&
            tokensData &&
            tokensData[mostPopularAsset.underlyingToken]
          }
          metric={ExploreGridBoxMetric.TOTAL_SUPPLY}
        />
        <FuseAssetGridBox
          bg=""
          heading="Top Earning Asset"
          data={topEarningFuseAsset}
          tokenData={
            topEarningFuseAsset &&
            tokensData &&
            tokensData[topEarningFuseAsset.underlyingToken]
          }
          metric={ExploreGridBoxMetric.SUPPLY_RATE}
        />

        <FuseAssetGridBox
          bg=""
          heading="Cheapest Stablecoin Borrow"
          data={cheapestStableBorrow}
          tokenData={
            cheapestStableBorrow &&
            tokensData &&
            tokensData[cheapestStableBorrow.underlyingToken]
          }
          metric={ExploreGridBoxMetric.BORROW_RATE}
        />
        {!isMobile && (
          <>
            <FuseAssetGridBox
              bg=""
              heading="Most Borrowed Asset"
              data={mostBorrowedFuseAsset}
              tokenData={
                mostBorrowedFuseAsset &&
                tokensData &&
                tokensData[mostBorrowedFuseAsset.underlyingToken]
              }
              metric={ExploreGridBoxMetric.TOTAL_BORROWS}
            />

            <FuseAssetGridBox
              bg=""
              heading="Newest Yield Aggregator"
              data={topEarningFuseStable}
              metric={ExploreGridBoxMetric.SUPPLY_RATE}
            />
          </>
        )}
      </SimpleGrid>
    </DashboardBox>
  );
};

export default ExploreGrid;

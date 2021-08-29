import { SimpleGrid } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";
import {
  ExploreGridBox,
  ExploreGridBoxMetric,
  FuseAssetGridBox,
} from "./ExploreGridBox";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import useSWR from "swr";

// Utils
import axios from "axios";

// Types
import { APIExploreData } from "pages/api/explore";

// Fetchers
const exploreFetcher = async (route: string): Promise<APIExploreData> => {
  const { data } = await axios.get(route);
  return data;
};

const ExploreGrid = () => {
  const isMobile = useIsSmallScreen();

  const { data, error } = useSWR("/api/explore", exploreFetcher);

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
            tokensData[topEarningFuseStable.underlying.id]
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
            tokensData[mostPopularAsset.underlying.id]
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
            tokensData[topEarningFuseAsset.underlying.id]
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
            tokensData[cheapestStableBorrow.underlying.id]
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
                tokensData[mostBorrowedFuseAsset.underlying.id]
              }
              metric={ExploreGridBoxMetric.TOTAL_BORROWS}
            />

            <ExploreGridBox heading="Newest Yield Aggregator" />
          </>
        )}
      </SimpleGrid>
    </DashboardBox>
  );
};

export default ExploreGrid;

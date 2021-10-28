import { SimpleGrid } from "@chakra-ui/layout";
import { useBreakpointValue } from "@chakra-ui/react";
import DashboardBox from "components/shared/DashboardBox";
import {
  ExploreGridBox,
  ExploreGridBoxMetric,
  FuseAssetGridBox,
} from "./ExploreGridBox";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import useSWR from "swr";

// Types
import { APIExploreData } from "pages/api/explore";
import { getExploreData } from "services/explore";
import axios from "axios";

// Fetchers
const exploreFetcher = async (route: string): Promise<APIExploreData> => {
  // const data = await getExploreData();
  // console.log({ data });
  const { data }: { data: APIExploreData } = await axios.get(route);
  return data;
};

const ExploreGrid = () => {
  const isMobile = useIsSmallScreen();
  const numColumns = useBreakpointValue({ base: 1, sm: 1, md: 3 });

  const { data, error } = useSWR("/api/explore", exploreFetcher);

  const { results, tokensData } = data ?? {};

  const {
    topEarningFuseStable,
    topEarningFuseAsset,
    mostPopularFuseAsset,
    mostBorrowedFuseAsset,
    cheapestStableBorrow,
  } = results ?? {};

  return (
    <DashboardBox w="100%" h="100%">
      <SimpleGrid columns={numColumns} spacing={0} h="100%" w="100%">
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
          data={mostPopularFuseAsset}
          tokenData={
            mostPopularFuseAsset &&
            tokensData &&
            tokensData[mostPopularFuseAsset.underlying.id]
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

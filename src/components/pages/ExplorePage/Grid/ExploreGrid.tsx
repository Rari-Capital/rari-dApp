import { SimpleGrid } from "@chakra-ui/layout";
import DashboardBox from "components/shared/DashboardBox";
import { ExploreGridBoxMetric, FuseAssetGridBox } from "./ExploreGridBox";

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

  const {
    topEarningFuseStable,
    topEarningFuseAsset,
    mostPopularAsset,
    mostBorrowedFuseAsset,
  } = data ?? {};

  return (
    <DashboardBox w="100%" h={isMobile ? "300px" : "250px"}>
      <SimpleGrid columns={isMobile ? 2 : 3} spacing={0} h="100%" w="100%">
        <FuseAssetGridBox
          bg=""
          heading="Top Earning Stablecoin"
          data={topEarningFuseStable}
          metric={ExploreGridBoxMetric.SUPPLY_RATE}
        />
        <FuseAssetGridBox
          bg=""
          heading="Newest Yield Aggregator"
          data={topEarningFuseStable}
          metric={ExploreGridBoxMetric.SUPPLY_RATE}
        />
        <FuseAssetGridBox
          bg=""
          heading="Most Popular Asset"
          data={mostPopularAsset}
          metric={ExploreGridBoxMetric.TOTAL_SUPPLY}
        />
        <FuseAssetGridBox
          bg=""
          heading="Top Earning Asset"
          data={topEarningFuseAsset}
          metric={ExploreGridBoxMetric.SUPPLY_RATE}
        />
        {!isMobile && (
          <>
            <FuseAssetGridBox
              bg=""
              heading="Most Borrowed Asset"
              data={mostBorrowedFuseAsset}
              metric={ExploreGridBoxMetric.TOTAL_BORROWS}
            />
            <FuseAssetGridBox
              bg=""
              heading="Most Borrowed Asset"
              data={mostBorrowedFuseAsset}
              metric={ExploreGridBoxMetric.TOTAL_BORROWS}
            />
          </>
        )}
      </SimpleGrid>
    </DashboardBox>
  );
};

export default ExploreGrid;

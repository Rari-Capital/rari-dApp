import { SubgraphCToken } from "pages/api/explore";
import { queryFuseAssets } from "services/gql";
import { TokensDataMap } from "types/tokens";
import { fetchTokensAPIDataAsMap } from "utils/services";

import useSWR from "swr";

// fetcher
const opportunitiesFetcher = async (): Promise<{
  assets: SubgraphCToken[];
  tokensData: TokensDataMap;
}> => {
  const assets = await queryFuseAssets("supplyAPY", "desc", 4);
  const tokensData = await fetchTokensAPIDataAsMap(
    assets.map((a) => a.underlying.address)
  );
  return {
    assets,
    tokensData,
  };
};

export const useTrendingOpportunities = () => {
  const { data, error } = useSWR("trendingOpportunities", opportunitiesFetcher);
  return data;
};

export const useAdvertisementData = (significantTokens: string[]) => {};

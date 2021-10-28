import { SubgraphCToken } from "pages/api/explore";
import { queryTopFuseAsset } from "services/gql";
import useSWR from "swr";
import { TokensDataMap } from "types/tokens";
import { fetchTokensAPIDataAsMap } from "utils/services";

const adFetcher = async (
  ...addresses: string[]
): Promise<{ asset: SubgraphCToken; tokensData: TokensDataMap }> => {
  const asset = await queryTopFuseAsset("supplyAPY", "desc", addresses);
  const tokensData = await fetchTokensAPIDataAsMap([asset.underlying.address]);
  return {
    asset,
    tokensData,
  };
};

export const useAdvertisementData = (significantTokens: string[]) => {
  const { data, error } = useSWR([...significantTokens], adFetcher);
  return data;
};

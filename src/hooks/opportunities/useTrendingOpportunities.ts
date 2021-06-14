import {
  TrendingOpportunity,
  TRENDING_OPPORTUNITIES,
} from "constants/trending";
import { AggregatePoolsInfoReturn } from "hooks/usePoolInfo";
import { TokenData, useTokensData } from "hooks/useTokenData";
import { useVaultsDataForAsset } from "hooks/vaults/useVaultsDataForAsset";
import { createTokensDataMap } from "utils/tokenUtils";

export const useTrendingOpportunities = (): TrendingOpportunity[] => {
  const trending: TrendingOpportunity[] = TRENDING_OPPORTUNITIES;

  // Get assets in question
  // @ts-ignore
  const ids: string[] = [...new Set(trending.map(({ tokenId }) => tokenId))];
  const tokensData: TokenData[] | null = useTokensData(ids);

  const tokensDataMap = createTokensDataMap(tokensData);
  const vaultsData: AggregatePoolsInfoReturn = useVaultsDataForAsset();

  // Todo - fake USDC vault for each opportunity
  const trendingOpportunities = trending.map((t: TrendingOpportunity) => ({
    ...t,
    token: tokensDataMap[t.tokenId],
    opportunityData: vaultsData.aggregatePoolsInfo[0],
  }));

  return trendingOpportunities;
};

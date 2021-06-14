import { AggregatePoolInfo } from "hooks/usePoolInfo"
import { TokenData } from "hooks/useTokenData"
import { HomepageOpportunityType } from "./homepage"

export interface TrendingOpportunity {
    tokenId: string;
    opportunityType: HomepageOpportunityType,
    token? : TokenData
    opportunityData?: AggregatePoolInfo,
}

export const TRENDING_OPPORTUNITIES: TrendingOpportunity[] = [
    {
        tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        opportunityType: HomepageOpportunityType.EarnVault
    },
    {
        tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        opportunityType: HomepageOpportunityType.EarnVault
    },
    {
        tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        opportunityType: HomepageOpportunityType.EarnVault
    },
    {
        tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        opportunityType: HomepageOpportunityType.EarnVault
    }
]
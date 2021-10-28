import { AggregatePoolInfo } from "hooks/usePoolInfo"
import { TokenData } from "hooks/useTokenData"
import { HomepageOpportunityType } from "./homepage"

export interface TrendingOpportunity {
    tokenId: string;
    opportunityType: HomepageOpportunityType,
    token? : TokenData
    opportunityData?: AggregatePoolInfo,
}
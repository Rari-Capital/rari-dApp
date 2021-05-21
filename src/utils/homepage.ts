import {
  HomepageOpportunity,
  HomepageOpportunityType,
} from "constants/homepage";

export const getOpportunityLink = (
  opportunity: HomepageOpportunity
): string => {
  switch (opportunity.type) {
    case HomepageOpportunityType.EarnVault:
      return `/pools/${opportunity.vaultType}`;
    case HomepageOpportunityType.FusePool:
      return `/fuse/pool/${opportunity.fusePoolId}`;
  }
  return "/";
};
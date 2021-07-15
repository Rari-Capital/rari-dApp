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
    case HomepageOpportunityType.EarnPage:
      return `/pools/dai`;
    case HomepageOpportunityType.FusePage:
      return `/fuse`;
    case HomepageOpportunityType.Pool2Page:
      return `/pool2`;
    case HomepageOpportunityType.TranchesPage:
      return `/tranches`;
  }
  return "/";
};

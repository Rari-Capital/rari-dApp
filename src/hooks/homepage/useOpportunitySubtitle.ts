import { useMemo } from "react";
import {
  HomepageOpportunity,
  HomepageOpportunityType,
} from "constants/homepage";
import { usePoolAPY } from "hooks/usePoolAPY";
import { useFusePoolData } from "hooks/useFusePoolData";

export const useOpportunitySubtitle = (opportunity: HomepageOpportunity) => {
  const earnPoolAPY = usePoolAPY(opportunity.vaultType);
  const fusePoolData = useFusePoolData(opportunity.fusePoolId?.toString());

  const returnedSubtitle = useMemo(() => {
    switch (opportunity.type) {
      case HomepageOpportunityType.EarnVault:
        return `${earnPoolAPY}% APY`;
      case HomepageOpportunityType.FusePool:
        console.log({ fusePoolData });
        return 'Fuse Pool Data'
    }
  }, [opportunity, earnPoolAPY, fusePoolData]);

  return returnedSubtitle;
};

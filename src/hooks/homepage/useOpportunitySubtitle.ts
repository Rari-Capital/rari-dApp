import { useMemo } from "react";
import {
  HomepageOpportunity,
  HomepageOpportunityType,
} from "constants/homepage";
import { usePoolAPY } from "hooks/usePoolAPY";
import { useFusePoolData } from "hooks/useFusePoolData";
import { FusePoolMetric } from "utils/fetchFusePoolData";
import { shortUsdFormatter } from "utils/bigUtils";

export const useOpportunitySubtitle = (opportunity: HomepageOpportunity) => {
  const earnPoolAPY = usePoolAPY(opportunity.vaultType);
  const fusePoolData = useFusePoolData(opportunity.fusePoolId?.toString());

  const returnedSubtitle = useMemo(() => {
    switch (opportunity.type) {
      case HomepageOpportunityType.EarnVault:
        return `${earnPoolAPY}% APY`;

      case HomepageOpportunityType.FusePool:
        switch (opportunity.fuseMetric) {
          case FusePoolMetric.TotalBorrowedUSD:
            return `${shortUsdFormatter(
              fusePoolData?.totalBorrowedUSD
            )} borrowed`;
          case FusePoolMetric.TotalSuppliedUSD:
            return `${shortUsdFormatter(
              fusePoolData?.totalSuppliedUSD
            )} supplied`;
          case FusePoolMetric.TotalLiquidityUSD:
            return `${shortUsdFormatter(
              fusePoolData?.totalLiquidityUSD
            )} liquidity`;
          default:
            return `${shortUsdFormatter(
              fusePoolData?.totalSuppliedUSD
            )} supplied`;
        }

        default: 
          return null;
    }
  }, [opportunity, earnPoolAPY, fusePoolData]);

  return returnedSubtitle;
};

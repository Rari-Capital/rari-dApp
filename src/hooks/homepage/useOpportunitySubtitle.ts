import { useMemo } from "react";
import {
  HomepageOpportunity,
  HomepageOpportunityType,
} from "constants/homepage";
import { usePoolAPY } from "hooks/usePoolAPY";
import { useFusePoolData } from "hooks/useFusePoolData";
import { FusePoolMetric } from "utils/fetchFusePoolData";
import { shortUsdFormatter } from "utils/bigUtils";
import { useFuseTVL } from "hooks/fuse/useFuseTVL";
import { usePool2APR } from "hooks/pool2/usePool2APR";
import { usePoolsAPY } from "hooks/usePoolAPY";
import { usePoolInfos } from "hooks/usePoolInfo";
import {
  SaffronTranchePool,
  TrancheRating,
  useRariSupportedTranches,
} from "hooks/tranches/useSaffronData";

export const useOpportunitySubtitle = (
  opportunity: HomepageOpportunity
): string | null => {
  // Earn
  const earnPoolAPY = usePoolAPY(opportunity.vaultType);
  const poolInfos = usePoolInfos();
  const poolsAPY = usePoolsAPY(poolInfos);

  // Fuse
  const fusePoolData = useFusePoolData(opportunity.fusePoolId?.toString());
  const { data: fuseTVL } = useFuseTVL();

  // Pool2
  const pool2APR = usePool2APR();

  // Tranches
  const mySaffronData: SaffronTranchePool[] = useRariSupportedTranches();
  const trancheAPYs = useMemo(() => {
    const sTrancheAPY =
      mySaffronData?.[0]?.tranches?.[TrancheRating.S]?.["total-apy"];
    const aTrancheAPY =
      mySaffronData?.[0]?.tranches?.[TrancheRating.A]?.["total-apy"];

    const APYs = [sTrancheAPY, aTrancheAPY]
      .filter((obj) => obj) // remove null or zero values
      .sort((a, b) => (b && a ? a - b : 1));

    return APYs;
  }, [mySaffronData]);

  const returnedSubtitle = useMemo(() => {
    switch (opportunity.type) {
      case HomepageOpportunityType.EarnVault:
        return earnPoolAPY ? `${earnPoolAPY}% APY` : null;

      case HomepageOpportunityType.FusePool:
        switch (opportunity.fuseMetric) {
          case FusePoolMetric.TotalBorrowedUSD:
            return fusePoolData?.totalBorrowedUSD
              ? `${shortUsdFormatter(fusePoolData?.totalBorrowedUSD)} borrowed`
              : null;
          case FusePoolMetric.TotalSuppliedUSD:
            return fusePoolData?.totalSuppliedUSD
              ? `${shortUsdFormatter(fusePoolData?.totalSuppliedUSD)} supplied`
              : null;
          case FusePoolMetric.TotalLiquidityUSD:
            return fusePoolData?.totalLiquidityUSD
              ? `${shortUsdFormatter(
                  fusePoolData?.totalLiquidityUSD
                )} liquidity`
              : null;
          default:
            return fusePoolData?.totalSuppliedUSD
              ? `${shortUsdFormatter(fusePoolData?.totalSuppliedUSD)} supplied`
              : null;
        }

      case HomepageOpportunityType.EarnPage:
        // @ts-ignore
        const apys = poolsAPY.filter((obj) => obj).map(parseFloat);
        const maxAPY = !!apys.length ? Math.max.apply(null, apys) : null;
        return maxAPY ? `${maxAPY}% APY` : null;

      case HomepageOpportunityType.FusePage:
        return fuseTVL ? `${shortUsdFormatter(fuseTVL)} TVL` : null;

      case HomepageOpportunityType.Pool2Page:
        return pool2APR ? `${pool2APR}% APR` : null;

      case HomepageOpportunityType.TranchesPage:
        return `${trancheAPYs
          .map((apy) => `${apy?.toFixed(0)}%`)
          .join(" - ")} APY`;

      default:
        return null;
    }
  }, [
    opportunity,
    earnPoolAPY,
    poolsAPY,
    fusePoolData,
    fuseTVL,
    pool2APR,
    trancheAPYs,
  ]);

  return returnedSubtitle;
};

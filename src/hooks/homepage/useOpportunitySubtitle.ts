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
  useMySaffronData,
} from "hooks/tranches/useSaffronData";

export const useOpportunitySubtitle = (opportunity: HomepageOpportunity) => {
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
  const mySaffronData: SaffronTranchePool[] = useMySaffronData();
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

      case HomepageOpportunityType.EarnPage:
        // @ts-ignore
        const apys = poolsAPY.filter((obj) => obj).map(parseFloat);
        console.log({ apys });
        return `${Math.max.apply(null, apys)}% APY`;

      case HomepageOpportunityType.FusePage:
        console.log({ fuseTVL });
        return fuseTVL ? `${shortUsdFormatter(fuseTVL)} TVL` : "? TVL";

      case HomepageOpportunityType.Pool2Page:
        console.log({ pool2APR });
        return `${pool2APR ?? "?"}% APR`;

      case HomepageOpportunityType.TranchesPage:
        return `${trancheAPYs.map((apy) => `${apy}%`).join(" - ")} APY`;

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

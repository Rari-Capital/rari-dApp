import { useMemo } from "react";
import {
  TrancheRating,
  useRariSupportedTranches,
  useSaffronData,
} from "./useSaffronData";

export type TrancheData = {
  poolName: string;
  assetAPY: number | undefined;
  sfiAPY: number | undefined;
  totalAPY: number | undefined;
  trancheRating: TrancheRating;
};

export const useTranchesDataForAsset = (
  assetAddress: String
): TrancheData[] => {
  const tranchePools = useRariSupportedTranches();
  return useMemo(() => {
    if (tranchePools.length) {
      let finalTranches: TrancheData[] = [];

      tranchePools.forEach((tranchePool) => {
        const trancheRatings = Object.keys(
          tranchePool.tranches
        ) as TrancheRating[];

        const tranches: TrancheData[] = trancheRatings.map((trancheRating) => ({
          poolName: tranchePool.name,
          assetAPY: tranchePool.tranches[trancheRating]?.["dai-apy"],
          sfiAPY: tranchePool.tranches[trancheRating]?.["sfi-apy"],
          totalAPY: tranchePool.tranches[trancheRating]?.["total-apy"],
          trancheRating,
        }));

        finalTranches = [...finalTranches, ... tranches]
      });
      return finalTranches
    } else return [];
  }, [tranchePools]);
};

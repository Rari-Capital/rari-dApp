import { useAggregatePoolInfos, usePoolInfos } from "hooks/usePoolInfo";
import { useMemo } from "react";

export const useVaultsDataForAsset = (
  assetAddress: String
): any => {
  const vaultsInfo = useAggregatePoolInfos();
  return useMemo(() => {
      return vaultsInfo
  }, [vaultsInfo]);
};

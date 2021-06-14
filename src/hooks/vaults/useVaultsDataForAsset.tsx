import {
  AggregatePoolsInfoReturn,
  useAggregatePoolInfos,
} from "hooks/usePoolInfo";
import { useMemo } from "react";

export const useVaultsDataForAsset = (
  assetAddress?: String
): AggregatePoolsInfoReturn => {
  const vaultsInfo = useAggregatePoolInfos();
  return useMemo(() => {
    return vaultsInfo;
  }, [vaultsInfo]);
};

import { usePoolInfos } from "hooks/usePoolInfo";
import { useMemo } from "react";

export const useVaultsDataForAsset = (
  assetAddress: String
): any[] => {
  const vaultsInfo = usePoolInfos();
  console.log({vaultsInfo})
  return useMemo(() => {
      return vaultsInfo
  }, [vaultsInfo]);
};

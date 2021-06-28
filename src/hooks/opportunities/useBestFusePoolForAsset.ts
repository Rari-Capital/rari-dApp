import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import { useEffect, useMemo, useState } from "react";
import {
  FusePoolData,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";

interface BestPoolForAssetReturn {
  bestPool: FusePoolData | undefined;
  poolAssetIndex: number | undefined;
}

// For an Asset, returns the best Fuse Pool AND the index of that asset in that Fuse Pool.
export const useBestFusePoolForAsset = (
  tokenAddress?: string
): BestPoolForAssetReturn => {

  // Get all the Fuse pools with this Asset
  const fuseData = useFuseDataForAsset(tokenAddress);
  const [bestPool, setBestPool] = useState<FusePoolData | undefined>();
  const [poolAssetIndex, setPoolAssetIndex] = useState<number | undefined>();

  useEffect(() => {
    // If we have already found the "best pool" on this render, then don't do it again.
    if (bestPool) return; 

    // Else, Find and setthe Fuse pool with the best lending rate for this asset
    const { poolsWithThisAsset, poolAssetIndex } = fuseData;

    if (poolsWithThisAsset?.length) {
      let bestPoolIndex: number = 0;
      let highestSupplyRatePerBlock: number = 0;

      for (let i = 0; i < poolsWithThisAsset.length ?? 0; i++) {
        const pool = poolsWithThisAsset[i];

        const asset: USDPricedFuseAssetWithTokenData = pool.assets[
          poolAssetIndex[pool.id]
        ] as USDPricedFuseAssetWithTokenData;

        // Compare supply rates
        if (asset.supplyRatePerBlock > highestSupplyRatePerBlock) {
          highestSupplyRatePerBlock = asset.supplyRatePerBlock;
          bestPoolIndex = i;
        }
      }
      const _bestPool = poolsWithThisAsset[bestPoolIndex];
      setBestPool(_bestPool);
      setPoolAssetIndex(poolAssetIndex[_bestPool.id]);
    }
  }, [fuseData, bestPool]);

  return { bestPool, poolAssetIndex };
};

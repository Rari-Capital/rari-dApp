import { useMemo } from "react";
import { convertMantissaToAPY } from "utils/apyUtils";
import {
  FusePoolData,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";
import useAllFusePools from "./useAllFusePools";

interface AssetInFuse {
  totalBorrowedUSD: number;
  totalSuppliedUSD: number;
  highestSupplyAPY: number;
}

export const useFuseDataForAsset = (assetAddress?: String) => {
  const allPools = useAllFusePools();

  // A map of which index this asset is in its respective Fuse pool's assets array.
  // IE: Fuse pool 6 has this asset at index N
  const poolAssetIndex: { [poolId: number]: number } = {};

  // Find Fuse pools where this asset exists
  const poolsWithThisAsset: FusePoolData[] | undefined = useMemo(
    () =>
      allPools?.filter((pool) =>
        pool.assets.find((asset, index) => {
          if (
            asset.underlyingToken.toLowerCase() === assetAddress?.toLowerCase()
          ) {
            poolAssetIndex[pool.id] = index;
            return true;
          }
        })
      ),
    [assetAddress, allPools]
  );

  const totals = useMemo(() => {
    let totalBorrowedUSD = 0;
    let totalSuppliedUSD = 0;
    let highestSupplyAPY = 0;

    poolsWithThisAsset?.forEach((pool) => {
      // Get the specific asset from the pool
      const asset = pool?.assets?.find((_ass) => {
        const ass = _ass as USDPricedFuseAssetWithTokenData;
        return ass?.tokenData?.symbol === assetAddress;
      });

      totalBorrowedUSD += asset?.totalBorrowUSD ?? 0;
      totalSuppliedUSD += asset?.totalSupplyUSD ?? 0;

      const supplyAPY = convertMantissaToAPY(asset?.supplyRatePerBlock, 365);
      if (supplyAPY > highestSupplyAPY) highestSupplyAPY = supplyAPY;
    });

    return { totalBorrowedUSD, totalSuppliedUSD, highestSupplyAPY };
  }, [assetAddress, poolsWithThisAsset]);

  return { totals, poolsWithThisAsset, poolAssetIndex };
};

export const useFuseDataForAssets = (assetSymbols: String[]) => {
  const allPools = useAllFusePools();

  const poolsWithThisAsset = useMemo(
    () =>
      allPools?.filter((pool) =>
        pool.assets.find((_asset) => {
          const asset = _asset as USDPricedFuseAssetWithTokenData;
          return asset?.tokenData?.symbol
            ? assetSymbols.includes(asset.tokenData.symbol)
            : false;
        })
      ),
    [assetSymbols, allPools]
  );

  const totals: AssetInFuse[] = useMemo(
    () =>
      assetSymbols.map((assetSymbol) => {
        let totalBorrowedUSD = 0;
        let totalSuppliedUSD = 0;
        let highestSupplyAPY = 0;

        poolsWithThisAsset?.forEach((pool) => {
          // Find the specific asset from the pool
          const asset = pool?.assets?.find((_ass) => {
            const ass = _ass as USDPricedFuseAssetWithTokenData;
            return ass?.tokenData?.symbol === assetSymbol;
          });

          totalBorrowedUSD += asset?.totalBorrowUSD ?? 0;
          totalSuppliedUSD += asset?.totalSupplyUSD ?? 0;

          const supplyAPY = convertMantissaToAPY(
            asset?.supplyRatePerBlock,
            365
          );
          if (supplyAPY > highestSupplyAPY) highestSupplyAPY = supplyAPY;
        });

        return { totalBorrowedUSD, totalSuppliedUSD, highestSupplyAPY };
      }),
    [assetSymbols, poolsWithThisAsset]
  );

  return { totals, poolsWithThisAsset };
};

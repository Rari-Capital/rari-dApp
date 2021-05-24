import { useMemo } from "react";
import { convertMantissaToAPY } from "utils/apyUtils";
import { USDPricedFuseAssetWithTokenData } from "utils/fetchFusePoolData";
import useAllFusePools from "./useAllFusePools";

interface AssetInFuse {
  totalBorrowedUSD: number;
  totalSuppliedUSD: number;
  highestSupplyAPY: number;
}

export const useFuseDataForAsset = (assetSymbol: String) => {
  const allPools = useAllFusePools();

  const poolsWithThisAsset = useMemo(
    () =>
      allPools?.filter((pool) =>
        pool.assets.find((asset) => {
          const _asset = asset as USDPricedFuseAssetWithTokenData;
          return _asset?.tokenData?.symbol === assetSymbol;
        })
      ),
    [assetSymbol, allPools]
  );

  const totals = useMemo(() => {
    let totalBorrowedUSD = 0;
    let totalSuppliedUSD = 0;
    let highestSupplyAPY = 0;

    poolsWithThisAsset?.forEach((pool) => {
      // Get the specific asset from the pool
      const asset = pool?.assets?.find((_ass) => {
        const ass = _ass as USDPricedFuseAssetWithTokenData;
        return ass?.tokenData?.symbol === assetSymbol;
      });

      totalBorrowedUSD += asset?.totalBorrowUSD ?? 0;
      totalSuppliedUSD += asset?.totalSupplyUSD ?? 0;

      const supplyAPY = convertMantissaToAPY(asset?.supplyRatePerBlock, 365);
      if (supplyAPY > highestSupplyAPY) highestSupplyAPY = supplyAPY;
    });

    return { totalBorrowedUSD, totalSuppliedUSD, highestSupplyAPY };
  }, [assetSymbol, poolsWithThisAsset]);

  return { totals, poolsWithThisAsset };
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

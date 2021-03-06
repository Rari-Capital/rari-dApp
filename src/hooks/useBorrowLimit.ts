import { useMemo } from "react";
import { USDPricedFuseAsset } from "../utils/fetchFusePoolData";

export const useBorrowLimit = (assets: USDPricedFuseAsset[]) => {
  const maxBorrow = useMemo(() => {
    let maxBorrow = 0;
    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      if (asset.membership) {
        maxBorrow += asset.supplyBalanceUSD * (asset.collateralFactor / 1e18);
      }
    }
    return maxBorrow;
  }, [assets]);

  return maxBorrow;
};

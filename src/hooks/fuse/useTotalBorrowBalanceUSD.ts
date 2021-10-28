import { useMemo } from "react";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

export const useTotalBorrowAndSupplyBalanceUSD = (
  assets: USDPricedFuseAsset[]
) => {
  return useMemo(() => getTotalBorrowAndSupplyBalanceUSD(assets), [assets]);
};

export const getTotalBorrowAndSupplyBalanceUSD = (
  assets: USDPricedFuseAsset[]
) => {
  let totalSupplyBalanceUSD = 0;
  let totalBorrowBalanceUSD = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    totalSupplyBalanceUSD += asset.supplyBalanceUSD;
    totalBorrowBalanceUSD += asset.borrowBalanceUSD;
  }

  return {
    totalBorrowBalanceUSD,
    totalSupplyBalanceUSD,
  };
};

import { useMemo } from "react";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

export const useBorrowLimit = (
  assets: USDPricedFuseAsset[],
  options?: { ignoreIsEnabledCheckFor?: string }
): number => {
  const maxBorrow = useMemo(() => {
    let maxBorrow = 0;
    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      if (
        options?.ignoreIsEnabledCheckFor === asset.cToken ||
        asset.membership
      ) {
        maxBorrow += asset.supplyBalanceUSD * (asset.collateralFactor / 1e18);
      }
    }
    return maxBorrow;
  }, [assets, options?.ignoreIsEnabledCheckFor]);

  return maxBorrow;
};

export const useBorrowLimits = (
  assetsArray: USDPricedFuseAsset[][] | null,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const maxBorrows = useMemo(() => {
    return assetsArray?.map((assets) => {
      let maxBorrow = 0;
      for (let i = 0; i < assets.length; i++) {
        let asset = assets[i];

        if (
          options?.ignoreIsEnabledCheckFor === asset.cToken ||
          asset.membership
        ) {
          maxBorrow += asset.supplyBalanceUSD * (asset.collateralFactor / 1e18);
        }
      }
      return maxBorrow;
    });
  }, [assetsArray, options?.ignoreIsEnabledCheckFor]);

  return maxBorrows;
};

// Same as useBorrowLimit but we subtract debt from the borrow limit
export const useBorrowCredit = (
  assets: USDPricedFuseAsset[],
  options?: { ignoreIsEnabledCheckFor?: string }
): number => {
  const maxBorrow = useMemo(() => {
    let maxBorrow = 0;
    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      // Only factor in borrow limit if asset is listed as collateral
      // OR if that user is GOING to enable as collateral
      if (
        asset.membership || // is asset enabled as collateral 
        options?.ignoreIsEnabledCheckFor === asset.cToken // is asset GOING to be enabled as collateral
      ) {
        maxBorrow += asset.supplyBalanceUSD * (asset.collateralFactor / 1e18);
      }

      // No matter what, if something is being borrowed we subtract regardless of if its collateral
      maxBorrow -= asset.borrowBalanceUSD * (asset.collateralFactor / 1e18);
    }
    return maxBorrow
  }, [assets, options?.ignoreIsEnabledCheckFor]);

  return maxBorrow;
};

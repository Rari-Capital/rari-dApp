import { useMemo } from "react";

// Utils
import {
  createAssetsMap,
  AssetHash,
  createTokensDataMap,
  TokensDataHash,
} from "utils/tokenUtils";
import {
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";

// Hooks
import { useTokensData } from "hooks/useTokenData";

export const useAssetsMap = (
  assetsArray: USDPricedFuseAsset[][] | null
): AssetHash | null => {
  return useMemo(
    () => (assetsArray ? createAssetsMap(assetsArray) : null),
    [assetsArray]
  );
};

type AssetsMapWithTokenDataReturn = {
  assetsArrayWithTokenData: USDPricedFuseAssetWithTokenData[][] | null; // Fuse Asset with additional info about the token appended on
  tokensDataMap: TokensDataHash; // hashmap of unique assets and their token data
};

// This returns a Hashmap
export const useAssetsMapWithTokenData = (
  assetsArray: USDPricedFuseAsset[][] | null
): AssetsMapWithTokenDataReturn => {
  const assetsMap: AssetHash | null = useAssetsMap(assetsArray);
  const tokensAddresses: string[] = assetsMap ? Object.keys(assetsMap) : [];
  const tokensData = useTokensData(tokensAddresses);

  const tokensDataMap: TokensDataHash = useMemo(
    () => (tokensData ? createTokensDataMap(tokensData) : {}),
    [tokensData]
  );

  // Returns the original 2D assets Array but with tokenData filled in 
  const assetsArrayWithTokenData: USDPricedFuseAssetWithTokenData[][] | null =
    useMemo(
      () =>
        assetsArray?.map((assets: USDPricedFuseAsset[]) =>
          assets.map((asset: USDPricedFuseAsset) => ({
            ...asset,
            tokenData: tokensDataMap[asset.underlyingToken],
          }))
        ) ?? null,
      [tokensDataMap, assetsArray]
    );

  return { assetsArrayWithTokenData, tokensDataMap };
};

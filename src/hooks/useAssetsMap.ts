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
  return useMemo(() => (assetsArray ? createAssetsMap(assetsArray) : null), [
    assetsArray,
  ]);
};

type AssetsMapWithTokenDataReturn = {
  assetsMapWithTokenData: USDPricedFuseAssetWithTokenData[]; // Fuse Asset with additional info about the token appended on
  tokensDataMap: TokensDataHash; // hashmap of unique assets and their token data
};

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

  const assetsMapWithTokenData: USDPricedFuseAssetWithTokenData[] = useMemo(() => {
    return tokensData?.reduce((arr, tokenData, index) => {
      const asset: USDPricedFuseAsset | null =
        assetsMap?.[tokenData.address] ?? null;

      // If no asset return an empty array
      if (!asset) {
        return arr;
      }

      const newAsset = { ...asset, tokenData };
      arr.push(newAsset);
      return arr;
    }, []);
  }, [assetsMap, tokensData]);

  return { assetsMapWithTokenData, tokensDataMap };
};

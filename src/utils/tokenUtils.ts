import { AllTokens } from "rari-tokens-generator";
import {
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";
import { TokenData } from "hooks/useTokenData";

import Tokens from "../static/compiled/tokens.json";
export const tokens = Tokens as AllTokens;

export interface AssetHash {
  [address: string]: USDPricedFuseAsset;
}

export interface AssetHashWithTokenData {
  [address: string]: USDPricedFuseAssetWithTokenData;
}

export interface TokensDataHash {
  [address: string]: TokenData;
}

export const createAssetsMap = (assetsArray: USDPricedFuseAsset[][]) => {
  const assetsMap: AssetHash = {};

  for (const assets of assetsArray) {
    for (const asset of assets) {
      const address = asset.underlyingToken;
      if (!assetsMap[address]) {
        assetsMap[address] = asset;
      }
    }
  }

  return assetsMap;
};

export const createTokensDataMap = (
  tokensData: TokenData[]
): TokensDataHash => {
  const _tokensDataMap: TokensDataHash = {};

  for (const tokenData of tokensData) {
    if (!tokenData.address) continue;
    if (!_tokensDataMap[tokenData.address]) {
      _tokensDataMap[tokenData.address] = tokenData;
    }
  }

  return _tokensDataMap;
};

export function getMinMaxOf2DIndex(arr: any[][], idx: number) {
  return {
    min: Math.min.apply(
      null,
      arr.map(function (e) {
        return e[idx];
      })
    ),
    max: Math.max.apply(
      null,
      arr.map(function (e) {
        return e[idx];
      })
    ),
  };
}

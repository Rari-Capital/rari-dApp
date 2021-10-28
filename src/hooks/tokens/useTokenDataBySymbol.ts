import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import {
  ETH_TOKEN_DATA,
  TokenData,
  useTokenData,
  useTokenDataWithContract,
} from "hooks/useTokenData";
import { useMemo } from "react";
import tokens from "static/compiled/tokens.json";
import { AllTokenMarketInfo } from "utils/coingecko";
import useTokenMarketInfo, { MarketInterval } from "./useTokenMarketInfo";

export const useTokenDataBySymbol = (
  tokenSymbol: string,
  days?: MarketInterval
) => {
  // Find token in static file by its symbol
  // @ts-ignore
  let token: any = tokens[tokenSymbol] ?? null;
  if (tokenSymbol === "ETH") {
    token = ETH_TOKEN_DATA;
  }

  const { address } = token;

  const tokenData = useTokenData(address);
  const tokenDataWithContract = useTokenDataWithContract(address);
  const tokenMarketData = useTokenMarketInfo(address, days);
  const fuseDataForAsset = useFuseDataForAsset(address);

  return useMemo(() => {
    return {
      tokenData,
      tokenDataWithContract,
      tokenMarketData,
      fuseDataForAsset,
    };
  }, [tokenData, tokenDataWithContract, tokenMarketData, fuseDataForAsset]);
};

export const useTokenDataByAddress = (
  tokenAddress: string,
  days?: MarketInterval
) => {
  const tokenData = useTokenData(tokenAddress);
  const tokenDataWithContract = useTokenDataWithContract(tokenAddress);
  const tokenMarketData = useTokenMarketInfo(tokenAddress, days);

  return useMemo(() => {
    return { tokenData, tokenDataWithContract, tokenMarketData };
  }, [tokenData, tokenDataWithContract, tokenMarketData]);
};

export const useAllTokenData = (token: TokenData, days?: MarketInterval) => {
  const { address, symbol } = token;

  const tokenData = useTokenData(address);
  const tokenDataWithContract = useTokenDataWithContract(address);

  // @ts-ignore todo - fix
  const {
    granularTokenMarketInfo,
    aggregateTokenMarketInfo,
  }: AllTokenMarketInfo | undefined = useTokenMarketInfo(address, days) ?? {};
  const fuseDataForAsset = useFuseDataForAsset(address);

  return useMemo(
    () => ({
      tokenData,
      tokenDataWithContract,
      granularTokenMarketInfo,
      aggregateTokenMarketInfo,
      fuseDataForAsset,
    }),
    [
      tokenData,
      tokenDataWithContract,
      granularTokenMarketInfo,
      aggregateTokenMarketInfo,
      fuseDataForAsset,
    ]
  );
};

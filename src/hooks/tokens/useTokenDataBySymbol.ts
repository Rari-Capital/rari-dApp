import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import {
  ETH_TOKEN_DATA,
  TokenData,
  useTokenData,
  useTokenDataWithContract,
} from "hooks/useTokenData";
import tokens from "static/compiled/tokens.json";
import useTokenMarketInfo from "./useTokenMarketInfo";

export const useTokenDataBySymbol = (tokenSymbol: string) => {
  // Find token in static file by its symbol
  // @ts-ignore
  let token: any = tokens[tokenSymbol] ?? null;
  if (tokenSymbol === "ETH") {
    token = ETH_TOKEN_DATA;
  }

  const { address } = token;

  const tokenData = useTokenData(address);
  const tokenDataWithContract = useTokenDataWithContract(address);
  const tokenMarketData = useTokenMarketInfo(address);
  const fuseDataForAsset = useFuseDataForAsset(tokenSymbol);

  return { tokenData, tokenDataWithContract, tokenMarketData, fuseDataForAsset };
};


export const useTokenDataByAddress = (tokenAddress: string) => {

  const tokenData = useTokenData(tokenAddress);
  const tokenDataWithContract = useTokenDataWithContract(tokenAddress);
  const tokenMarketData = useTokenMarketInfo(tokenAddress);

  return { tokenData, tokenDataWithContract, tokenMarketData };
};


export const useAllTokenData = (token : TokenData) => {
  const { address, symbol } = token
  
  const tokenData = useTokenData(address);
  const tokenDataWithContract = useTokenDataWithContract(address);
  const tokenMarketData = useTokenMarketInfo(address);
  const fuseDataForAsset = useFuseDataForAsset(symbol);

  return { tokenData, tokenDataWithContract, tokenMarketData, fuseDataForAsset };

}


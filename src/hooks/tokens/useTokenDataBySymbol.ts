import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import {
  ETH_TOKEN_DATA,
  useTokenData,
  useTokenDataWithContract,
} from "hooks/useTokenData";
import tokens from "static/compiled/tokens.json";
import useTokenMarketInfo from "./useTokenMarketInfo";

const useTokenDataBySymbol = (tokenSymbol: string) => {
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

export default useTokenDataBySymbol;

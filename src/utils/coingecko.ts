import axios from "axios";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";

const VS_CURRENCY = "usd";

export const fetchTokenMarketInfo = async (
  address: string,
  days: number = 1
) => {
  if (address === ETH_TOKEN_DATA.address) {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=${VS_CURRENCY}&days=${days}`
    );
    console.log({ data });
    return data;
  }

  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart?vs_currency=${VS_CURRENCY}&days=${days}`
  );
  console.log({ data });
  return data;
};

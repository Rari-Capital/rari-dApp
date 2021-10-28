import axios from "axios";

import { MarketInterval } from "hooks/tokens/useTokenMarketInfo";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";

const VS_CURRENCY = "usd";

export interface GranularTokenMarketInfo {
  market_caps: Number[][];
  prices: Number[][];
  total_volumes: Number[][];
}

export interface AggregateTokenMarketInfo {
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    circulating_supply: number | null;
    price_change_24h: number;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_14d: number | null;
    price_change_percentage_30d: number | null;
    price_change_percentage_1y: number | null;
  };
}

export interface AllTokenMarketInfo {
  granularTokenMarketInfo: GranularTokenMarketInfo | null;
  aggregateTokenMarketInfo: AggregateTokenMarketInfo | null;
}

export const fetchAllTokenMarketInfo = async (
  address: string,
  days: MarketInterval = MarketInterval.DAY
) => {
  try {
    const [granularTokenMarketInfo, aggregateTokenMarketInfo]: [
      GranularTokenMarketInfo,
      AggregateTokenMarketInfo
    ] = await Promise.all([
      fetchGranularTokenMarketInfo(address, days),
      fetchAggregateTokenMarketInfo(address),
    ]);
    return { granularTokenMarketInfo, aggregateTokenMarketInfo };
  } catch (err) {
    return {
      granularTokenMarketInfo: null,
      aggregateTokenMarketInfo: null,
    };
  }
};

export const fetchGranularTokenMarketInfo = async (
  address: string,
  days: number = 1
): Promise<GranularTokenMarketInfo> => {
  let _address = address;

  // sOHM
  if (address === "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f") {
    _address = "0x383518188c0c6d7730d91b2c03a03c837814a899"
  }

  const url: string =
    address === ETH_TOKEN_DATA.address
      ? `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=${VS_CURRENCY}&days=${days}`
      : `https://api.coingecko.com/api/v3/coins/ethereum/contract/${_address}/market_chart?vs_currency=${VS_CURRENCY}&days=${days}`;


  const { data } = await axios.get(url);
  return data;
};

export const fetchAggregateTokenMarketInfo = async (
  address: string
): Promise<AggregateTokenMarketInfo> => {
  let _address = address;

  // sOHM
  if (address === "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f") {
    _address = "0x383518188c0c6d7730d91b2c03a03c837814a899"
  }

  const url: string =
    address === ETH_TOKEN_DATA.address
      ? `https://api.coingecko.com/api/v3/coins/ethereum`
      : `https://api.coingecko.com/api/v3/coins/ethereum/contract/${_address}`;

  const { data } = await axios.get(url);

  const aggregateMarketInfo: AggregateTokenMarketInfo = {
    market_data: {
      current_price: {
        usd: data.market_data.current_price.usd,
      },
      market_cap: {
        usd: data.market_data.market_cap.usd,
      },
      high_24h: {
        usd: data.market_data.high_24h.usd,
      },
      low_24h: {
        usd: data.market_data.low_24h.usd,
      },
      total_volume: {
        usd: data.market_data.total_volume.usd,
      },
      circulating_supply: data.market_data.circulating_supply,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      price_change_percentage_7d: data.market_data.price_change_percentage_7d,
      price_change_percentage_14d: data.market_data.price_change_percentage_14d,
      price_change_percentage_30d: data.market_data.price_change_percentage_30d,
      price_change_percentage_1y: data.market_data.price_change_percentage_1y,
    },
  };
  return aggregateMarketInfo;
};

export const fetchCurrentETHPrice = async () =>
  (
    await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum"
    )
  ).data.ethereum.usd;

export const fetchETHPriceAtDate = async (date: string) =>
  (
    await axios.get(
      `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date}`
    )
  ).data.market_data.current_price.usd;

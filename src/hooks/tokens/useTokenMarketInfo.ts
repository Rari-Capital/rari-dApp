import { useMemo } from "react";
import { useQuery } from "react-query";
import {
  fetchAllTokenMarketInfo,
  fetchAggregateTokenMarketInfo,
} from "utils/coingecko";

export enum MarketInterval {
  DAY = 1,
  WEEK = 7,
  MONTH = 30,
  YEAR = 356,
}

export const useTokenMarketInfo = (
  address: string,
  days: MarketInterval = MarketInterval.DAY
) => {
  const { data } = useQuery(
    `${address} market info for ${days} days`,
    async () => await fetchAllTokenMarketInfo(address, days)
  );

  return useMemo(() => data, [data]);
};

export const useTokenMarketAggregateInfo = (address: string) => {
  const { data } = useQuery(
    `${address} token aggregate info`,
    async () => await fetchAggregateTokenMarketInfo(address)
  );

  return useMemo(() => data, [data]);
};

export default useTokenMarketInfo;

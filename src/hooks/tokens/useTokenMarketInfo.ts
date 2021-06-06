import { useMemo } from "react";
import { useQuery } from "react-query";
import { fetchAllTokenMarketInfo } from "utils/coingecko";

export enum MarketInterval {
  DAY = 1,
  WEEK = 7,
  MONTH = 30,
  YEAR = 356,
}

const useTokenMarketInfo = (
  address: string,
  days: MarketInterval = MarketInterval.DAY
) => {
  const { data } = useQuery(
    `${address} market info for ${days} days`,
    async () => await fetchAllTokenMarketInfo(address, days)
  );
  return data
};

export default useTokenMarketInfo;

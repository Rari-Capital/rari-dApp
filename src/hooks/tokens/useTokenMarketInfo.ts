import { useMemo } from "react";
import { useQuery } from "react-query";
import { fetchAllTokenMarketInfo } from "utils/coingecko";

const useTokenMarketInfo = (address: string) => {
  const { data } = useQuery(
    `${address} market info`,
    async () => await fetchAllTokenMarketInfo(address)
  );
  return useMemo(() => data, [data])
};

export default useTokenMarketInfo;

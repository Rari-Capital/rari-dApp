import { useQuery } from "react-query";
import { fetchTokenMarketInfo } from "utils/coingecko";

const useTokenMarketInfo = (address: string) => {
  const { data } = useQuery(
    `${address} market info`,
    async () => await fetchTokenMarketInfo(address)
  );
  return data;
};

export default useTokenMarketInfo;

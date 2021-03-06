import { useQuery } from "react-query";

import { useRari } from "../context/RariContext";
import { fetchFusePoolData } from "../utils/fetchFusePoolData";

export const useFusePoolData = (poolId: string) => {
  const { fuse, rari, address } = useRari();

  const { data } = useQuery(poolId + " poolData " + address, () => {
    return fetchFusePoolData(poolId, address, fuse, rari);
  });

  return data;
};

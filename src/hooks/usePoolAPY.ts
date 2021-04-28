import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";

import { fetchRGTAPR, fetchPoolAPY } from "../utils/fetchPoolAPY";
import { useMemo } from "react";
import { PoolInterface } from "constants/pools";

export const useRGTAPR = () => {
  const { rari } = useRari();

  const { data: rgtAPR } = useQuery("rgtAPR", async () => fetchRGTAPR(rari));

  return rgtAPR;
};

export const usePoolAPY = (pool: Pool) => {
  const { rari } = useRari();

  const { data: poolAPY } = useQuery(pool + " apy", () => {
    return fetchPoolAPY(rari, pool);
  });

  return poolAPY;
};

// Fetch APYs for all pools
export const usePoolsAPY = (pools: PoolInterface[]) => {
  const { rari } = useRari();

  const poolAPYs = useQueries(
    pools.map(({ type: poolType }) => {
      return {
        queryKey: poolType + " apy",
        queryFn: () => fetchPoolAPY(rari, poolType),
      };
    })
  );

  return useMemo(() => {
    return !poolAPYs.length
      ? []
      : poolAPYs.map(({ isLoading, error, data }) => ({
          isLoading,
          error,
          data,
        }));
  }, [poolAPYs]);
};

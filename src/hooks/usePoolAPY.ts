import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";

import { fetchRGTAPR, fetchPoolAPY } from "../utils/fetchPoolAPY";
import { useMemo } from "react";

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

// Todo (sharad) - better error handling for dynamic queries
export const usePoolsAPY = (pools: Pool[]) => {
  const { rari } = useRari();

  // Fetch APYs for all pools
  const poolAPYs = useQueries(
    pools.map(pool => {
      return {
        queryKey: pool + " apy",
        queryFn: () => fetchPoolAPY(rari, pool),
      }
    })
  )

  return useMemo(() => {
    return !poolAPYs.length || !poolAPYs[0]?.isLoading || poolAPYs[0]?.isError
    ? []
    : poolAPYs.map((({data} )=> data))
  }, [poolAPYs])
}

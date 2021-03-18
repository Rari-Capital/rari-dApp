import { useQuery } from "react-query";
import { Pool } from "../context/PoolContext";
import { useRari } from "../context/RariContext";

import { fetchRGTAPR, fetchPoolAPY } from "../utils/fetchPoolAPY";

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

import { useQuery } from "react-query";
import { Pool } from "../utils/poolUtils";
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

// Todo (sharad) - finish - refactor iterative pool query
export const usePoolAPYs = () => {
  const { rari } = useRari();
  const pools = Object.values(Pool)

  // const data = useQueries(
  //   pools.map(pool => {
  //     return {
  //       queryKey: pool + " apy",
  //       queryFn: () => fetchPoolAPY(rari, pool),
  //     }
  //   })
  // )

  // console.log({data})
  // return data

  return false

}

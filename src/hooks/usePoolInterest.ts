import { useMemo } from "react";
import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import { fetchPoolInterestEarned } from "../utils/fetchPoolInterest";

export const usePoolInterestEarned = () => {
    const { rari, address } = useRari();

    const { data: poolInterestEarned} = useQuery(
        address + " interest earned",
        () => {
            return fetchPoolInterestEarned(rari, address);
        });

    return poolInterestEarned;
};

// Todo (sharad) - better error handling for dynamic queries
// export const usePoolsAPY = (pools: Pool[]) => {
//   const { rari } = useRari();

//   // Fetch APYs for all pools
//   const poolAPYs = useQueries(
//     pools.map(pool => {
//       return {
//         queryKey: pool + " apy",
//         queryFn: () => fetchPoolAPY(rari, pool),
//       }
//     })
//   )

//   return useMemo(() => {
//     return !poolAPYs.length || !poolAPYs[0]?.isLoading || poolAPYs[0]?.isError
//     ? []
//     : poolAPYs.map((({data} )=> data))
//   }, [poolAPYs])
// }

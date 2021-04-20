import { useMemo } from "react";
import { useQuery, useQueries } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";
import { BN, stringUsdFormatter } from "../utils/bigUtils";
import { getSDKPool } from "../utils/poolUtils";

export const fetchPoolBalance = async ({
  pool,
  rari,
  address,
}: {
  pool: Pool;
  rari: Rari;
  address: string;
}) : Promise<BN> => {
  const balance = await getSDKPool({ rari, pool }).balances.balanceOf(address);

  let formattedBalance = stringUsdFormatter(rari.web3.utils.fromWei(balance));

  if (pool === Pool.ETH) {
    formattedBalance = formattedBalance.replace("$", "") + " ETH";
  }

  return balance;
};

export const usePoolBalance = (pool: Pool) => {
  const { address, rari } = useRari();

  const { data, isLoading, error } = useQuery(
    address + " " + pool + " balance",
    async () => {
      return fetchPoolBalance({ pool, rari, address });
    }
  );

  return { data, isLoading, error };
};

export const usePoolBalances = (pools: Pool[]) => {
  const { rari, address } = useRari();

  // Fetch APYs for all pools
  const poolBalances = useQueries(
    pools.map(pool => {
      return {
        queryKey: address + " " + pool + " balance",
        queryFn: () => fetchPoolBalance({ pool, rari, address }),
      }
    })
  )

  return useMemo(() =>
    !poolBalances.length
      ? []
      : poolBalances.map(
        ({ isLoading, error, data }) =>
          ({ isLoading, error, data })
      )
    , [poolBalances])
}

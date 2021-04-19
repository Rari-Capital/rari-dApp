import { useQuery } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";
import { stringUsdFormatter } from "../utils/bigUtils";
import { getSDKPool } from "../utils/poolUtils";

export const fetchPoolBalance = async ({
  pool,
  rari,
  address,
}: {
  pool: Pool;
  rari: Rari;
  address: string;
}) => {
  const balance = await getSDKPool({ rari, pool }).balances.balanceOf(address);

  let formattedBalance = stringUsdFormatter(rari.web3.utils.fromWei(balance));

  if (pool === Pool.ETH) {
    formattedBalance = formattedBalance.replace("$", "") + " ETH";
  }

  return { formattedBalance, bigBalance: balance };
};

export const usePoolBalance = (pool: Pool) => {
  const { address, rari } = useRari();

  const { data: balanceData, isLoading: isPoolBalanceLoading } = useQuery(
    address + " " + pool + " balance",
    async () => {
      return fetchPoolBalance({ pool, rari, address });
    }
  );

  return { balanceData, isPoolBalanceLoading };
};

// Todo (sharad) - finish
export const usePoolBalances = () => {
  const { address, rari } = useRari();
  const pools = Object.values(Pool)

  const promises =
    pools.map(async pool => {
      const poolBalance = await fetchPoolBalance({ pool, rari, address })
      return poolBalance
    })

  return Promise.all(promises)
    .then(res => {
      console.log('poolbalances', { res })
      return res
    })
}

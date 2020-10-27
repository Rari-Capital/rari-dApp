import { useQuery } from "react-query";
import { Pool } from "../context/PoolContext";
import { useRari } from "../context/RariContext";
import { stringUsdFormatter } from "../utils/bigUtils";

export const usePoolBalance = (pool: Pool) => {
  const { address, rari } = useRari();

  const { data: poolBalance, isLoading: isPoolBalanceLoading } = useQuery(
    address + " " + pool + " balance",
    async () => {
      let balance;

      if (pool === Pool.ETH) {
        balance = await rari.pools.ethereum.balances.balanceOf(address);
      } else if (pool === Pool.STABLE) {
        balance = await rari.pools.stable.balances.balanceOf(address);
      } else {
        balance = await rari.pools.yield.balances.balanceOf(address);
      }

      let formattedBalance = stringUsdFormatter(
        rari.web3.utils.fromWei(balance)
      );

      if (pool === Pool.ETH) {
        formattedBalance = formattedBalance.replace("$", "") + " ETH";
      }

      return { formattedBalance, bigBalance: balance };
    }
  );

  return { balanceData: poolBalance, isPoolBalanceLoading };
};

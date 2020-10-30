import { useQuery } from "react-query";
import { usePoolType } from "../context/PoolContext";
import { useRari } from "../context/RariContext";
import { BN } from "../utils/bigUtils";
import { getSDKPool } from "../utils/poolUtils";
import { fetchPoolBalance } from "./usePoolBalance";

export const useMaxWithdraw = (symbol: string) => {
  const { rari, address } = useRari();

  const poolType = usePoolType();

  const { data: max, isLoading: isMaxLoading } = useQuery(
    address + " max " + symbol,
    async () => {
      const { bigBalance } = await fetchPoolBalance({
        pool: poolType,
        rari,
        address,
      });

      const [amount] = await getSDKPool({
        rari,
        pool: poolType,
      }).withdrawals.getMaxWithdrawalAmount(symbol, bigBalance);

      return amount as BN;
    }
  );

  return { max, isMaxLoading };
};

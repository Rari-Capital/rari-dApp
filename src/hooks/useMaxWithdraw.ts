import { useQuery } from "react-query";
import { Pool, usePoolType } from "../context/PoolContext";
import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";
import { BN } from "../utils/bigUtils";
import { getSDKPool } from "../utils/poolUtils";
import { fetchPoolBalance } from "./usePoolBalance";

export const fetchMaxWithdraw = async ({
  rari,
  address,
  poolType,
  symbol,
}: {
  rari: Rari;
  address: string;
  symbol: string;
  poolType: Pool;
}) => {
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
};

export const useMaxWithdraw = (symbol: string) => {
  const { rari, address } = useRari();

  const poolType = usePoolType();

  const { data: max, isLoading: isMaxLoading } = useQuery(
    address + " max " + symbol,
    async () => {
      return fetchMaxWithdraw({ rari, address, symbol, poolType });
    }
  );

  return { max, isMaxLoading };
};

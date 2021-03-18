import { useQuery } from "react-query";
import { Pool } from "../utils/poolUtils";
import { useRari } from "../context/RariContext";
import { getSDKPool } from "../utils/poolUtils";

export const useNoSlippageCurrencies = (pool: Pool) => {
  const { rari } = useRari();

  const { data } = useQuery(pool + " noSlippageCurrencies", async () => {
    let noSlippageCurrencies: string[];

    if (pool === Pool.ETH) {
      noSlippageCurrencies = ["ETH"];
    } else {
      noSlippageCurrencies = await getSDKPool({
        rari,
        pool,
      }).deposits.getDirectDepositCurrencies();
    }

    if (noSlippageCurrencies.length === 0) {
      return ["None"];
    }

    return noSlippageCurrencies;
  });

  return data;
};

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePoolType } from "context/PoolContext";
import { Pool, getPoolName, getPoolCaption, getPoolLogo } from "utils/poolUtils";
import { formatBalanceBN } from "utils/format";

// Constants
import { pools, PoolInterface } from "constants/pools";
import { usePoolsAPY } from "./usePoolAPY";
import { usePoolBalances } from "./usePoolBalance";
import { usePoolInterestEarned } from "./usePoolInterest";
import { useRari } from "context/RariContext";
import { BN } from "utils/bigUtils";

export const usePoolInfo = (poolType: Pool) => {
  const { t } = useTranslation();

  const poolData = useMemo(() => {
    const poolName = getPoolName(poolType, t)
    const poolCaption = getPoolCaption(poolType, t)
    const poolLogo = getPoolLogo(poolType, t)
    return { poolCaption, poolName, poolLogo };
  }, [poolType, t]);

  return {
    ...poolData,
    poolType,
  };
};

export const usePoolInfoFromContext = () => {
  const poolType = usePoolType();
  return usePoolInfo(poolType);
};


export const usePoolInfos = (): PoolInterface[] => {
  const { t } = useTranslation();

  return useMemo(() =>
    pools.map((pool: PoolInterface) => ({
      ...pool,
      title: t(pool.title),
      name: t(pool.name),
      caption: t(pool.caption),
    }))
    , [t])

}

export const useAggregatePoolInfos = () => {
  const { rari } = useRari()
  const poolInfos = usePoolInfos()
  const poolAPYs = usePoolsAPY(poolInfos)
  const poolBalances = usePoolBalances(poolInfos)
  const poolInterestEarned = usePoolInterestEarned()

  return useMemo(
    () =>
      poolInfos.reduce((memo: any[], poolInfo: PoolInterface, index: number) => {
        const poolAPY = poolAPYs[index]?.data ?? null
        const poolBalanceBN : BN = poolBalances[index]?.data ?? rari.web3.utils.toBN(0)
        const formattedBalance = formatBalanceBN(rari, poolBalanceBN, poolInfo.type === Pool.ETH)
        const poolInterestEarned = "25"
        const poolGrowth = "6.9"
        // const fbalance = formatBalanceBN(rari, poolBalance, poolInfo.type === Pool.ETH) ?? null
        memo.push({poolInfo, poolAPY, poolBalanceBN, formattedBalance, poolInterestEarned, poolGrowth})
        return memo
      }, []),
    [
      rari,
      poolInfos,
      poolAPYs,
      poolBalances,
      poolInterestEarned
    ])
}

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePoolType } from "context/PoolContext";
import { Pool, getPoolName, getPoolCaption, getPoolLogo } from "utils/poolUtils";
import { formatBalanceBN } from "utils/format";

// Constants
import { pools, PoolInterface } from "constants/pools";
import { usePoolsAPY } from "./usePoolAPY";
import { usePoolBalances, useTotalPoolsBalance } from "./usePoolBalance";
import { usePoolInterestEarned } from "./usePoolInterest";
import { useRari } from "context/RariContext";
import { BN, shortUsdFormatter } from "utils/bigUtils";

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
  const { web3: { utils: { toBN } } } = rari
  const poolInfos = usePoolInfos()
  const poolAPYs = usePoolsAPY(poolInfos)
  const poolBalances = usePoolBalances(poolInfos)
  const poolsInterestEarned = usePoolInterestEarned()

  // Totals
  const { data: totalPoolsBalance } = useTotalPoolsBalance()

  const aggregatePoolsInfo = useMemo(
    () =>
      poolInfos.map((poolInfo: PoolInterface, index: number) => {

        const poolAPY = poolAPYs[index]?.data ?? null
        const poolBalance = poolBalances[index]?.data ?? null

        const formattedPoolBalance: string | null = formatBalanceBN(rari, poolBalance, poolInfo.type === Pool.ETH)

        // Right now we handle interest earned a little differently
        let poolInterestEarned
        switch (poolInfo.type) {
          case Pool.STABLE:
            poolInterestEarned = poolsInterestEarned?.stablePoolInterestEarned ?? null
            break;
          case Pool.YIELD:
            poolInterestEarned = poolsInterestEarned?.yieldPoolInterestEarned ?? null
            break;
          default:
            poolInterestEarned = poolsInterestEarned?.ethPoolInterestEarned ?? null
            break;
        }

        const formattedPoolInterestEarned = formatBalanceBN(rari, poolInterestEarned, poolInfo.type === Pool.ETH)

        // Growth for a pool = % increase between balance & (balance - interest earned)
        const poolGrowth: BN | null =
          poolBalance && poolInterestEarned
            ? !poolBalance.isZero()
              ? toBN(1).sub((poolBalance.sub(poolInterestEarned)).div(poolBalance))
              : null
            : null

        const formattedPoolGrowth = poolGrowth?.toNumber() ?? null

        return {
          poolInfo,
          poolAPY,
          poolBalance,
          formattedPoolBalance,
          poolInterestEarned,
          formattedPoolInterestEarned,
          poolGrowth,
          formattedPoolGrowth
        }
      }),
    [
      rari,
      poolInfos,
      poolAPYs,
      poolBalances,
      poolsInterestEarned,
      totalPoolsBalance,
      toBN
    ])

  const totals = useMemo(() => ({
    balance: totalPoolsBalance ?? null,
    balanceFormatted: shortUsdFormatter(totalPoolsBalance) ?? null,
    interestEarned: formatBalanceBN(rari, poolsInterestEarned?.totalEarnings ?? null),
    apy: "50%",
    growth: "50%"
  })
    , [totalPoolsBalance, poolsInterestEarned, aggregatePoolsInfo])

  // todo - implement totals
  // const totals = {}

  return ({ totals, aggregatePoolsInfo })
}

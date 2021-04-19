import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePoolType } from "../context/PoolContext";
import { Pool, getPoolName, getPoolCaption, getPoolLogo } from "../utils/poolUtils";

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


export const usePoolInfos = () => {
  const pools = Object.values(Pool)
  const { t } = useTranslation();

  return useMemo(() =>
    pools.map((poolType: any) => {
      const poolName = getPoolName(poolType, t)
      const poolCaption = getPoolCaption(poolType, t)
      const poolLogo = getPoolLogo(poolType, t)
      return { poolCaption, poolName, poolLogo, poolType };
    })
    , [pools, t])

}

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pool, usePoolType } from "../context/PoolContext";

import EthIcon from "../static/ethicon.png";
import StableIcon from "../static/stableicon.png";
import YieldIcon from "../static/yieldicon.png";

export const usePoolInfo = (poolType: Pool) => {
  const { t } = useTranslation();

  const poolData = useMemo(() => {
    const poolName =
      poolType === Pool.ETH
        ? t("ETH Pool")
        : poolType === Pool.STABLE
        ? t("Stable Pool")
        : t("Yield Pool");

    const poolCaption =
      poolType === Pool.ETH
        ? t("Safe returns on ETH")
        : poolType === Pool.STABLE
        ? t("Safe returns on stablecoins")
        : t("High risk, high reward");

    const poolLogo =
      poolType === Pool.ETH
        ? EthIcon
        : poolType === Pool.STABLE
        ? StableIcon
        : YieldIcon;

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

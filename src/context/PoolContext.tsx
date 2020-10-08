import React, { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";

import EthIcon from "../static/ethicon.png";
import StableIcon from "../static/stableicon.png";
import YieldIcon from "../static/yieldicon.png";

export enum Pool {
  STABLE = "stable",
  YIELD = "yield",
  ETH = "eth",
}

export const PoolTypeContext = React.createContext<Pool | undefined>(undefined);

export const PoolTypeProvider = ({
  pool,
  children,
}: {
  pool: Pool;
  children: ReactNode;
}) => {
  return (
    <PoolTypeContext.Provider value={pool}>{children}</PoolTypeContext.Provider>
  );
};

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
        ? t("Safe on stablecoins")
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

export const usePoolType = () => {
  const poolType = React.useContext(PoolTypeContext);

  if (poolType === undefined) {
    throw new Error(`usePoolType must be used within a PoolTypeProvider`);
  }

  return poolType;
};

export const usePoolInfoFromContext = () => {
  const poolType = usePoolType();

  return usePoolInfo(poolType);
};

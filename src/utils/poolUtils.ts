import Rari from "../rari-sdk/index";

import EthereumPool from "../rari-sdk/pools/ethereum";
import StablePool from "../rari-sdk/pools/stable";
import YieldPool from "../rari-sdk/pools/yield";

export enum Pool {
  STABLE = "stable",
  YIELD = "yield",
  ETH = "eth",
}

export function getSDKPool({ rari, pool }: { rari: Rari; pool: Pool | undefined }) {
  let sdkPool: StablePool | EthereumPool | YieldPool;

  if (pool === Pool.ETH) {
    sdkPool = rari.pools.ethereum;
  } else if (pool === Pool.STABLE) {
    sdkPool = rari.pools.stable;
  } else {
    sdkPool = rari.pools.yield;
  }

  return sdkPool;
}

export function poolHasDivergenceRisk(pool: Pool) {
  return pool === Pool.YIELD;
}

export const getPoolName = (pool: Pool, t: any) =>
  pool === Pool.ETH
    ? t("ETH Pool")
    : pool === Pool.STABLE
    ? t("Stable Pool")
    : t("Yield Pool");

export const getPoolCaption = (pool: Pool, t: any) =>
  pool === Pool.ETH
    ? t("Safe returns on ETH")
    : pool === Pool.STABLE
    ? t("Safe returns on stablecoins")
    : t("High risk, high reward");

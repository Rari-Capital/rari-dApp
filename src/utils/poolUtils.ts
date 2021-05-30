import Rari from "../rari-sdk/index";

import EthereumPool from "../rari-sdk/pools/ethereum";
import StablePool from "../rari-sdk/pools/stable";
import YieldPool from "../rari-sdk/pools/yield";
import DaiPool from "../rari-sdk/pools/dai";

export enum Pool {
  USDC = "usdc",
  DAI = "dai",
  YIELD = "yield",
  ETH = "eth",
}

export const getSDKPool = ({
  rari,
  pool,
}: {
  rari: Rari;
  pool: Pool | undefined;
}) => {
  let sdkPool: StablePool | EthereumPool | YieldPool | DaiPool;

  switch (pool) {
    case Pool.USDC:
      sdkPool = rari.pools.stable;
      break;
    case Pool.DAI:
      sdkPool = rari.pools.dai;
      break;
    case Pool.ETH:
      sdkPool = rari.pools.ethereum;
      break;
    case Pool.YIELD:
      sdkPool = rari.pools.yield;
      break;
    default:
      sdkPool = rari.pools.yield;
      break;
  }

  return sdkPool;
};

export function poolHasDivergenceRisk(pool: Pool) {
  return pool === Pool.YIELD;
}

export const getPoolName = (pool: Pool, t: any) => {
  switch (pool) {
    case Pool.USDC:
      return t("USDC Pool");
    case Pool.DAI:
      return t("DAI Pool");
    case Pool.ETH:
      return t("ETH Pool");
    case Pool.YIELD:
      return t("Yield Pool");
    default:
      return t("Yield Pool");
  }
};

export const getPoolCaption = (pool: Pool, t: any) => {
  switch (pool) {
    case Pool.USDC:
      return t("Safe returns on USDC");
    case Pool.DAI:
      return t("Safe returns on DAI");
    case Pool.ETH:
      return t("Returns on ETH");
    case Pool.YIELD:
      return t("High risk, high reward");
    default:
      return t("High risk, high reward");
  }
};

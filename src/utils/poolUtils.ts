import { Pool } from "../context/PoolContext";
import Rari from "../rari-sdk/index";

import EthereumPool from "../rari-sdk/pools/ethereum";
import StablePool from "../rari-sdk/pools/stable";
import YieldPool from "../rari-sdk/pools/yield";

export function getSDKPool({ rari, pool }: { rari: Rari; pool: Pool }) {
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

/** Returns the percentage of an original deposit after the withdrawal fee of that pool (aka 1 - fee percent)
 *
 * EX: 0.995 (99.5% of deposit returned | 0.5% fee)
 * EX: 0.9 (90% of deposit returned | 10% fee)
 * EX: 1 (100% of deposit returned | 0% fee)
 */
export function depositPercentAfterWithdrawFee(pool: Pool) {
  return pool === Pool.YIELD ? 0.995 : pool === Pool.STABLE ? 0.995 : 1;
}

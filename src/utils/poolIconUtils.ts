// Icons
import { Pool } from "./poolUtils";

export const getPoolLogo = (pool: Pool) => {
  return pool === Pool.ETH
    ? '/static/ethicon.png'
    : pool === Pool.STABLE
    ? '/static/stableicon.png'
    : 'static/yieldicon.png';
};

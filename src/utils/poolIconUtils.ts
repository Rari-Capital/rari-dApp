import { Pool } from "./poolUtils";

export const getPoolLogo = (pool: Pool) => {
  switch (pool) {
    case Pool.USDC:
      return "/static/stableicon.png";
    case Pool.DAI:
      return "/static/stableicon.png";
    case Pool.ETH:
      return "/static/ethicon.png";
    default:
      return "/static/yieldicon.png";
  }
};

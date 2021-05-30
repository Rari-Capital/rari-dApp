// Icons
import EthIcon from "../static/ethicon.png";
import StableIcon from "../static/stableicon.png";
import YieldIcon from "../static/yieldicon.png";
import { Pool } from "./poolUtils";

export const getPoolLogo = (pool: Pool) => {
  switch (pool) {
    case Pool.USDC:
      return StableIcon;
    case Pool.DAI:
      return StableIcon;
    case Pool.ETH:
      return EthIcon;
    default:
      return YieldIcon;
  }
};

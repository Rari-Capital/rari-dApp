// Icons
import EthIcon from "../static/ethicon.png";
import StableIcon from "../static/stableicon.png";
import YieldIcon from "../static/yieldicon.png";
import { Pool } from "./poolUtils";

export const getPoolLogo = (pool: Pool) => {
  return pool === Pool.ETH
    ? EthIcon
    : pool === Pool.STABLE
    ? StableIcon
    : YieldIcon;
};

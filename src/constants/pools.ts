import { Pool } from "utils/poolUtils";

// Icons
import EthIcon from "static/ethicon.png";
import StableIcon from "static/stableicon.png";
import YieldIcon from "static/yieldicon.png";

export interface PoolInterface {
  type: Pool;
  name: string;
  title: string;
  caption: string;
  logo: any;
}

export const pools: PoolInterface[] = [
  {
    type: Pool.USDC,
    title: "Stable",
    name: "Stable Pool",
    caption: "Earn interest on stablecoins by providing liquidity to Fuse pools.",
    logo: StableIcon,
  },
  {
    type: Pool.YIELD,
    title: "Yield",
    name: "Yield Pool",
    caption: "Please withdraw funds. Pool is no longer in use.",
    logo: YieldIcon,
  },
  {
    type: Pool.ETH,
    title: "ETH",
    name: "ETH Pool",
    caption: "Please withdraw funds. Pool is no longer in use.",
    logo: EthIcon,
  },
];

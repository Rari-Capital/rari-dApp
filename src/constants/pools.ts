import { Pool } from "utils/poolUtils";

// Icons

export interface PoolInterface {
  type: Pool;
  name: string;
  title: string;
  caption: string;
  logo: string;
}

export const pools: PoolInterface[] = [
  {
    type: Pool.STABLE,
    title: "Stable",
    name: "Stable Pool",
    caption: "Safe returns on stablecoins",
    logo: '/static/stableicon.png'
  },
  {
    type: Pool.YIELD,
    title: "Yield",
    name: "Yield Pool",
    caption: "High risk, high reward",
    logo:  '/static/yieldicon.png'
  },
  {
    type: Pool.ETH,
    title: "ETH",
    name: "ETH Pool",
    caption: "Safe returns on ETH",
    logo: '/static/ethicon.png'
  },
];

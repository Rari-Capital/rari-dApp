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
  // {
  //   type: Pool.STABLE,
  //   title: "Stable",
  //   name: "Stable Pool",
  //   caption: "Safe returns on stablecoins",
  //   logo: "/static/stableicon.png",
  // },
  {
    type: Pool.USDC,
    title: "USDC",
    name: "USDC Vault",
    caption: "Safe returns on USDC",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    type: Pool.DAI,
    title: "DAI",
    name: "DAI Vault",
    caption: "Safe returns on DAI",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  },
  {
    type: Pool.YIELD,
    title: "Yield",
    name: "Yield Vault",
    caption: "High risk, high reward",
    logo: "/static/yieldicon.png",
  },
  {
    type: Pool.ETH,
    title: "ETH",
    name: "ETH Vault",
    caption: "Returns on ETH",
    logo: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/64/Ethereum-ETH-icon.png",
  },
];

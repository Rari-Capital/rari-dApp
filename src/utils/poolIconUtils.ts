// Icons
import EthIcon from "../static/ethicon.png";
import StableIcon from "../static/stableicon.png";
import YieldIcon from "../static/yieldicon.png";
import { Pool } from "./poolUtils";

export const getPoolLogo = (pool: Pool) => {
  switch (pool) {
    case Pool.USDC:
      return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png";
    case Pool.DAI:
      return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png";
    case Pool.ETH:
      return EthIcon;
    default:
      return YieldIcon;
  }
};

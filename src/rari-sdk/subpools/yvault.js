/* eslint-disable */
import Web3 from "web3";

export default class YVaultSubpool {
  constructor(web3) {
    this.web3 = web3;
  }

  getCurrencyApys() {
    // TODO: yVault APYs
    return {
      DAI: Web3.utils.toBN(0),
      USDC: Web3.utils.toBN(0),
      USDT: Web3.utils.toBN(0),
      TUSD: Web3.utils.toBN(0)
    };
  }
}
/* eslint-disable */
import Web3 from "web3";

export default class KeeperDAOSubpool {
  constructor(web3) {
    this.web3 = web3;
  }

  getCurrencyApys() {
    // TODO: KeeperDAO APYs
    return {
      ETH: Web3.utils.toBN(0)
    };
  }
}

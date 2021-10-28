/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";

export default class DydxSubpool {
  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      dydxCurrencyApys: 300,
    });
  }

  async getCurrencyApys() {
    return await this.cache.getOrUpdate("dydxCurrencyApys", async function () {
      const data = (await axios.get("https://api.dydx.exchange/v1/markets"))
        .data;
      var apyBNs = {};

      for (var i = 0; i < data.markets.length; i++)
        apyBNs[data.markets[i].symbol] = Web3.utils.toBN(
          Math.trunc(parseFloat(data.markets[i].totalSupplyAPR) * 1e18)
        );

      return apyBNs;
    });
  }
}

/* eslint-disable */
import Cache from "../cache.js";

var cErc20DelegateAbi = require("./fuse/abi/CErc20Delegate.json");

export default class FuseSubpool {
  constructor(web3, cTokens) {
    this.web3 = web3;
    this.cTokens = cTokens;
    this.cache = new Cache({
      currencyApys: 300
    });
  }

  async getCurrencyApy(cTokenAddress) {
    var cToken = new this.web3.eth.Contract(cErc20DelegateAbi, cTokenAddress);
    var supplyRatePerBlock = await cToken.methods.supplyRatePerBlock().call();
    return Math.pow((supplyRatePerBlock / 1e18) * (4 * 60 * 24) + 1, 365) - 1;
  }

  async getCurrencyApys() {
    return await this.cache.getOrUpdate("currencyApys", async function() {
      var apyBNs = {};
      for (const currencyCode of Object.keys(this.cTokens)) apyBNs[currencyCode] = await getCurrencyApy(this.cTokens[currencyCode]);
      return apyBNs;
    });
  }
}

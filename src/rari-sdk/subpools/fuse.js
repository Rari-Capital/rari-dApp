/* eslint-disable */
import Cache from "../cache.js";

var cErc20DelegateAbi = require("./fuse/abi/CErc20Delegate.json");

export default class FuseSubpool {
  constructor(web3, cTokens) {
    this.web3 = web3;
    this.cTokens = cTokens;
    this.cache = new Cache({
      currencyApys: 300,
    });
  }

  async getCurrencyApy(cTokenAddress) {
    var cToken = new this.web3.eth.Contract(cErc20DelegateAbi, cTokenAddress);
    var supplyRatePerBlock = await cToken.methods.supplyRatePerBlock().call();
    return this.web3.utils.toBN(
      (
        (Math.pow((supplyRatePerBlock / 1e18) * (4 * 60 * 24) + 1, 365) - 1) *
        1e18
      ).toFixed(0)
    );
  }

  async getCurrencyApys() {
    var self = this;

    return await self.cache.getOrUpdate("currencyApys", async function () {
      var apyBNs = {};
      for (const currencyCode of Object.keys(self.cTokens))
        apyBNs[currencyCode] = await self.getCurrencyApy(
          self.cTokens[currencyCode]
        );
      return apyBNs;
    });
  }
}

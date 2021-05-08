/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";

export default class CompoundSubpool {
  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      compoundCurrencySupplierAndCompApys: 300,
    });
  }

  async getCurrencySupplierAndCompApys() {
    return await this.cache.getOrUpdate(
      "compoundCurrencySupplierAndCompApys",
      async function () {
        const data = (
          await axios.get("https://api.compound.finance/api/v2/ctoken")
        ).data;
        var apyBNs = {};

        for (var i = 0; i < data.cToken.length; i++) {
          var supplyApy = Web3.utils.toBN(
            Math.trunc(parseFloat(data.cToken[i].supply_rate.value) * 1e18)
          );
          var compApy = Web3.utils.toBN(
            Math.trunc(
              (parseFloat(data.cToken[i].comp_supply_apy.value) / 100) * 1e18
            )
          );
          apyBNs[data.cToken[i].underlying_symbol] = [supplyApy, compApy];
        }

        return apyBNs;
      }
    );
  }

  async getCurrencyApys() {
    var compoundApyBNs = await this.getCurrencySupplierAndCompApys();
    var compoundCombinedApyBNs = {};
    for (const currencyCode of Object.keys(compoundApyBNs))
      compoundCombinedApyBNs[currencyCode] = compoundApyBNs[
        currencyCode
      ][0].add(compoundApyBNs[currencyCode][1]);
    return compoundCombinedApyBNs;
  }
}

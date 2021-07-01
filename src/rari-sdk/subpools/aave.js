/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";

export default class AaveSubpool {
  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      aaveCurrencyApys: 300,
    });
  }

  async getCurrencyApys() {
    return await this.cache.getOrUpdate("aaveCurrencyApys", async function () {
      let currencyCodes = [
        "DAI",
        "USDC",
        "USDT",
        "TUSD",
        "BUSD",
        "SUSD",
        "mUSD",
        "ETH",
      ];

      const data = (
        await axios.post(
          "https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw",
          {
            query:
              `{
                    reserves(where: {
                        symbol_in: ` +
              JSON.stringify(currencyCodes) +
              `
                    }) {
                        id
                        symbol
                        liquidityRate
                    }
                }`,
          }
        )
      ).data;

      var apyBNs = {};

      for (var i = 0; i < data.data.reserves.length; i++) {
        if (
          data.data.reserves[i].symbol === "ETH" &&
          data.data.reserves[i].id !==
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0x24a42fd28c976a61df5d00d0599c34c4f90748c8"
        )
          continue;
        apyBNs[
          data.data.reserves[i].symbol == "SUSD"
            ? "sUSD"
            : data.data.reserves[i].symbol
        ] = Web3.utils
          .toBN(data.data.reserves[i].liquidityRate)
          .div(Web3.utils.toBN(1e9));
      }

      return apyBNs;
    });
  }
}

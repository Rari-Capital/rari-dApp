/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";

export default class MStableSubpool {
  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      mStableCurrencyApys: 60,
      mUsdSwapFee: 3600
    });
  }

  async getMUsdSavingsApy() {
    // TODO: Get exchange rates from contracts instead of The Graph
    // TODO: Use instantaneous APY instead of 24-hour APY?
    // Calculate APY with calculateApy using exchange rates from The Graph
    var epochNow = Math.floor(new Date().getTime() / 1000);
    var epoch24HrsAgo = epochNow - 86400;

    const data = (
      await axios.post(
        "https://api.thegraph.com/subgraphs/name/mstable/mstable-protocol",
        {
          operationName: "ExchangeRates",
          variables: { day0: epoch24HrsAgo, day1: epochNow },
          query:
            "query ExchangeRates($day0: Int!, $day1: Int!) {\n  day0: exchangeRates(where: {timestamp_lt: $day0}, orderDirection: desc, orderBy: timestamp, first: 1) {\n    ...ER\n    __typename\n  }\n  day1: exchangeRates(where: {timestamp_lt: $day1}, orderDirection: desc, orderBy: timestamp, first: 1) {\n    ...ER\n    __typename\n  }\n}\n\nfragment ER on ExchangeRate {\n  exchangeRate\n  timestamp\n  __typename\n}\n",
        }
      )
    ).data;

    if (!data || !data.data)
      return console.error(
        "Failed to decode exchange rates from The Graph when calculating mStable 24-hour APY"
      );
    return this.calculateMUsdSavingsApy(
      epoch24HrsAgo,
      data.data.day0[0].exchangeRate,
      epochNow,
      data.data.day1[0].exchangeRate
    );
  }

  calculateMUsdSavingsApy(
    startTimestamp,
    startExchangeRate,
    endTimestamp,
    endExchangeRate
  ) {
    const SCALE = 1e18;
    const YEAR_BN = 365 * 24 * 60 * 60;

    const rateDiff =
      (endExchangeRate * SCALE) / startExchangeRate - SCALE;
    const timeDiff = endTimestamp - startTimestamp;

    const portionOfYear = (timeDiff * SCALE) / YEAR_BN;
    const portionsInYear = SCALE / portionOfYear;
    const rateDecimals = (SCALE + rateDiff) / SCALE;

    if (rateDecimals > 0) {
      const diff = rateDecimals ** portionsInYear;
      const parsed = diff * SCALE;
      return (
        Web3.utils.toBN((parsed - SCALE).toFixed(0)) || Web3.utils.toBN(0)
      );
    }

    return Web3.utils.toBN(0);
  }

  async getCurrencyApys() {
    return await this.cache.getOrUpdate("mStableCurrencyApys", async function() {
      return { mUSD: await self.pools.mStable.getMUsdSavingsApy() };
    });
  }

  async getMUsdSwapFeeBN() {
    return await this.cache.getOrUpdate("mUsdSwapFee", async function() {
      try {
        const data = (
          await axios.post(
            "https://api.thegraph.com/subgraphs/name/mstable/mstable-protocol",
            {
              query: `{
                  massets(where: { id: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5" }) {
                  feeRate
                  }
              }`,
            }
          )
        ).data;
        return Web3.utils.toBN(data.data.massets[0].feeRate);
      } catch (err) {
        throw "Failed to get mUSD swap fee: " + err;
      }
    });
  }
}

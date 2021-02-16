/* eslint-disable */
import Web3 from "web3";

import Cache from "../cache.js";

const externalContractAddresses = {
  Bank: "0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A",
  ConfigurableInterestBankConfig: "0x97a49f8eec63c0dfeb9db4c791229477962dc692",
};

var externalAbis = {};

externalAbis["Bank"] = require("." + "/alpha/abi/" + "Bank" + ".json");

externalAbis["ConfigurableInterestBankConfig"] = require("." +
  "/alpha/abi/" +
  "ConfigurableInterestBankConfig" +
  ".json");

export default class AlphaSubpool {
  static EXTERNAL_CONTRACT_ADDRESSES = externalContractAddresses;
  static EXTERNAL_CONTRACT_ABIS = externalAbis;

  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      alphaIBEthApy: 300,
    });

    this.externalContracts = {};
    for (const contractName of Object.keys(externalContractAddresses))
      this.externalContracts[contractName] = new this.web3.eth.Contract(
        externalAbis[contractName],
        externalContractAddresses[contractName]
      );
  }

  async getCurrencyApys() {
    return { ETH: await this.getIBEthApyBN() };
  }

  async getIBEthApyBN() {
    var self = this;
    return await this.cache.getOrUpdate("alphaIBEthApy", async function () {
      try {
        var glbDebtVal = await self.externalContracts.Bank.methods
          .glbDebtVal()
          .call();
        var balance = await self.web3.eth.getBalance(
          self.externalContracts.Bank.options.address
        );
        var interestRatePerSecondBN = await self.externalContracts.ConfigurableInterestBankConfig.methods
          .getInterestRate(glbDebtVal, balance)
          .call();
        return Web3.utils.toBN(
          Math.trunc(
            ((1 + interestRatePerSecondBN / 1e18) ** (365 * 24 * 60 * 60) - 1) *
              1e18
          )
        );
      } catch (err) {
        throw new Error("Failed to get Alpha Homora V1 interest rate: " + err);
      }
    });
  }
}

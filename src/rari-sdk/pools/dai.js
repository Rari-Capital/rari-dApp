/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import StablePool from "./stable.js";

const contractAddresses = {
  RariFundController: "0xaFD2AaDE64E6Ea690173F6DE59Fc09F5C9190d74",
  RariFundManager: "0xB465BAF04C087Ce3ed1C266F96CA43f4847D9635",
  RariFundToken: "0x0833cfcb11A5ba89FbAF73a407831c98aD2D7648",
  RariFundPriceConsumer: "0x96ce4C781eDF07F4e3D210c919CA4F9A7ad82a7f",
  RariFundProxy: "0x7C332FeA58056D1EF6aB2B2016ce4900773DC399"
};

const legacyContractAddresses = {
  "v1.0.0": {
    RariFundController: "0xD7590e93a2e04110Ad50ec70EADE7490F7B8228a",
    RariFundProxy: "0x3F579F097F2CE8696Ae8C417582CfAFdE9Ec9966"
  }
};

var legacyAbis = {};

// 1.0.0
legacyAbis["v1.0.0"] = {};
legacyAbis["v1.0.0"]["RariFundController"] = require("." +
  "/dai/abi/legacy/" +
  "v1.0.0" +
  "/" +
  "RariFundController" +
  ".json");

legacyAbis["v1.0.0"]["RariFundProxy"] = require("." +
  "/dai/abi/legacy/" +
  "v1.0.0" +
  "/" +
  "RariFundProxy" +
  ".json");

export default class DaiPool extends StablePool {
  API_BASE_URL = "https://api.rari.capital/pools/dai/";
  POOL_NAME = "Rari DAI Pool";
  POOL_TOKEN_SYMBOL = "RDPT";

  static CONTRACT_ADDRESSES = contractAddresses;
  static LEGACY_CONTRACT_ADDRESSES = legacyContractAddresses;
  static LEGACY_CONTRACT_ABIS = legacyAbis;

  constructor(web3, subpools, getAllTokens) {
    super(web3, subpools, getAllTokens);

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new web3.eth.Contract(
        DaiPool.CONTRACT_ABIS[contractName],
        contractAddresses[contractName]
      );
    // this.gsnContracts = { RariFundProxy: new web3Gsn.eth.Contract(abis.RariFundProxy, contractAddresses.RariFundProxy) };
    this.legacyContracts = {};

    for (const version of Object.keys(legacyContractAddresses)) {
      if (!this.legacyContracts[version]) this.legacyContracts[version] = {};
      for (const contractName of Object.keys(legacyContractAddresses[version]))
        this.legacyContracts[version][
          contractName
        ] = new this.web3.eth.Contract(
          legacyAbis[version][contractName],
          legacyContractAddresses[version][contractName]
        );
    }

    this.rdpt = this.rspt;
    delete this.rspt;

    this.allocations.POOLS = (function() {
      var pools = ["dYdX", "Compound", "Aave", "mStable"];
      pools[100] = "Fuse6";
      return pools;
    })();
    this.allocations.POOLS_BY_CURRENCY = {
      DAI: ["dYdX", "Compound", "Aave", "Fuse6"],
      mUSD: ["mStable"],
    };
    this.allocations.CURRENCIES_BY_POOL = {
      dYdX: ["DAI"],
      Compound: ["DAI"],
      Aave: ["DAI"],
      mStable: ["mUSD"],
      Fuse6: ["DAI"]
    };

    delete this.history.getRsptExchangeRateHistory;
    this.history.getRdptExchangeRateHistory = this.history.getPoolTokenExchangeRateHistory;

    var self = this;

    this.history.getPoolAllocationHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      var events = [];
      if (toBlock >= 11441321 && fromBlock <= 12535101)
        events = await self.legacyContracts[
          "v1.0.0"
        ].RariFundController.getPastEvents("PoolAllocation", {
          fromBlock: Math.max(fromBlock, 11441321),
          toBlock: Math.min(toBlock, 12535101),
          filter,
        });
      if (toBlock >= 12535101)
        events = events.concat(
          await self.contracts.RariFundController.getPastEvents("PoolAllocation", {
            fromBlock: Math.max(fromBlock, 12535101),
            toBlock,
            filter,
          })
        );
      return events;
    };

    this.history.getCurrencyExchangeHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      var events = [];
      if (toBlock >= 11441321 && fromBlock <= 12535101)
        events = await self.legacyContracts[
          "v1.0.0"
        ].RariFundController.getPastEvents("CurrencyTrade", {
          fromBlock: Math.max(fromBlock, 11441321),
          toBlock: Math.min(toBlock, 12535101),
          filter,
        });
      if (toBlock >= 12535101)
        events = events.concat(
          await self.contracts.RariFundController.getPastEvents("CurrencyTrade", {
            fromBlock: Math.max(fromBlock, 12535101),
            toBlock,
            filter,
          })
        );
      return events;
    };

    this.history.getDepositHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11441321
        ? await self.contracts.RariFundManager.getPastEvents("Deposit", {
            fromBlock: Math.max(fromBlock, 11441321),
            toBlock,
            filter,
          })
        : [];
    };

    this.history.getWithdrawalHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11441321
        ? await self.contracts.RariFundManager.getPastEvents("Withdrawal", {
            fromBlock: Math.max(fromBlock, 11441321),
            toBlock,
            filter,
          })
        : [];
    };

    this.history.getPreDepositExchangeHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      var events = [];
      if (toBlock >= 11441321 && fromBlock <= 12535101)
        events = await self.legacyContracts[
          "v1.0.0"
        ].RariFundProxy.getPastEvents("PreDepositExchange", {
          fromBlock: Math.max(fromBlock, 11441321),
          toBlock: Math.min(toBlock, 12535101),
          filter,
        });
      if (toBlock >= 12535101)
        events = events.concat(
          await self.contracts.RariFundProxy.getPastEvents("PreDepositExchange", {
            fromBlock: Math.max(fromBlock, 12535101),
            toBlock,
            filter,
          })
        );
      return events;
    };

    this.history.getPostWithdrawalExchangeHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      var events = [];
      if (toBlock >= 11441321 && fromBlock <= 12535101)
        events = await self.legacyContracts[
          "v1.0.0"
        ].RariFundProxy.getPastEvents("PostWithdrawalExchange", {
          fromBlock: Math.max(fromBlock, 11441321),
          toBlock: Math.min(toBlock, 12535101),
          filter,
        });
      if (toBlock >= 12535101)
        events = events.concat(
          await self.contracts.RariFundProxy.getPastEvents("PostWithdrawalExchange", {
            fromBlock: Math.max(fromBlock, 12535101),
            toBlock,
            filter,
          })
        );
      return events;
    };

    this.history.getPoolTokenTransferHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11441321
        ? await self.contracts.RariFundToken.getPastEvents("Transfer", {
            fromBlock: Math.max(fromBlock, 11441321),
            toBlock,
            filter,
          })
        : [];
    };

    delete this.history.getRsptTransferHistory;
    this.history.getRdptTransferHistory = this.history.getPoolTokenTransferHistory;
  }
}

/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import StablePool from "./stable.js";

const contractAddresses = {
  RariFundController: "0x9245efB59f6491Ed1652c2DD8a4880cBFADc3ffA",
  RariFundManager: "0x59FA438cD0731EBF5F4cDCaf72D4960EFd13FCe6",
  RariFundToken: "0x3baa6B7Af0D72006d3ea770ca29100Eb848559ae",
  RariFundPriceConsumer: "0x00815e0e9d118769542ce24be95f8e21c60e5561",
  RariFundProxy: "0x35DDEFa2a30474E64314aAA7370abE14c042C6e8"
};

const legacyContractAddresses = {
  "v1.0.0": {
    RariFundController: "0x6afE6C37bF75f80D512b9D89C19EC0B346b09a8d",
    RariFundProxy: "0x6dd8e1Df9F366e6494c2601e515813e0f9219A88"
  },
  "v1.1.0": {
    RariFundProxy: "0x626d6979F3607d13051594d8B27a0A64E413bC11"
  }
};

var legacyAbis = {};

for (const version of Object.keys(legacyContractAddresses))
  for (const contractName of Object.keys(legacyContractAddresses[version])) {
    if (!legacyAbis[version]) legacyAbis[version] = {};
    legacyAbis[version][contractName] = require(__dirname +
      "/yield/abi/legacy/" +
      version +
      "/" +
      contractName +
      ".json");
  }

export default class YieldPool extends StablePool {
  API_BASE_URL = "https://api.rari.capital/pools/yield/";
  POOL_NAME = "Rari Yield Pool";
  POOL_TOKEN_SYMBOL = "RYPT";

  static CONTRACT_ADDRESSES = contractAddresses;
  static LEGACY_CONTRACT_ADDRESSES = legacyContractAddresses;
  static LEGACY_CONTRACT_ABIS = legacyAbis;

  constructor(web3, subpools, getAllTokens) {
    super(web3, subpools, getAllTokens);

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new web3.eth.Contract(
        YieldPool.CONTRACT_ABIS[contractName],
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

    this.rypt = this.rspt;
    delete this.rspt;

    this.allocations.POOLS = ["dYdX", "Compound", "Aave", "mStable", "yVault"];
    this.allocations.POOLS_BY_CURRENCY = {
      DAI: ["dYdX", "Compound", "Aave", "yVault"],
      USDC: ["dYdX", "Compound", "Aave", "yVault"],
      USDT: ["Compound", "Aave", "yVault"],
      TUSD: ["Aave", "yVault"],
      BUSD: ["Aave"],
      sUSD: ["Aave"],
      mUSD: ["mStable"],
    };
    this.allocations.CURRENCIES_BY_POOL = {
      dYdX: ["DAI", "USDC"],
      Compound: ["DAI", "USDC", "USDT"],
      Aave: ["DAI", "USDC", "USDT", "TUSD", "BUSD", "sUSD"],
      mStable: ["mUSD"],
      yVault: ["DAI", "USDC", "USDT", "TUSD"],
    };

    delete this.history.getRsptExchangeRateHistory;
    this.history.getRyptExchangeRateHistory = this.history.getPoolTokenExchangeRateHistory;

    var self = this;

    this.history.getPoolAllocationHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      var events = [];
        if (toBlock >= 11085000 && fromBlock <= 11854009)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundController.getPastEvents("PoolAllocation", {
            fromBlock: Math.max(fromBlock, 11085000),
            toBlock: Math.min(toBlock, 11854009),
            filter,
          });
        if (toBlock >= 11854009)
          events = events.concat(
            await self.contracts.RariFundController.getPastEvents("PoolAllocation", {
              fromBlock: Math.max(fromBlock, 11854009),
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
        if (toBlock >= 11085000 && fromBlock <= 11854009)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundController.getPastEvents("CurrencyTrade", {
            fromBlock: Math.max(fromBlock, 11085000),
            toBlock: Math.min(toBlock, 11854009),
            filter,
          });
        if (toBlock >= 11854009)
          events = events.concat(
            await self.contracts.RariFundController.getPastEvents("CurrencyTrade", {
              fromBlock: Math.max(fromBlock, 11854009),
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
      return toBlock >= 11085000
        ? await self.contracts.RariFundManager.getPastEvents("Deposit", {
            fromBlock: Math.max(fromBlock, 11085000),
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
      return toBlock >= 11085000
        ? await self.contracts.RariFundManager.getPastEvents("Withdrawal", {
            fromBlock: Math.max(fromBlock, 11085000),
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
      return toBlock >= 11085000
        ? await self.contracts.RariFundProxy.getPastEvents(
            "PreDepositExchange",
            { fromBlock: Math.max(fromBlock, 11085000), toBlock, filter }
          )
        : [];
    };

    this.history.getPostWithdrawalExchangeHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await self.contracts.RariFundProxy.getPastEvents(
            "PostWithdrawalExchange",
            { fromBlock: Math.max(fromBlock, 20000001), toBlock, filter }
          )
        : [];
    };

    this.history.getPoolTokenTransferHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await self.contracts.RariFundToken.getPastEvents("Transfer", {
            fromBlock: Math.max(fromBlock, 10909582),
            toBlock,
            filter,
          })
        : [];
    };

    delete this.history.getRsptTransferHistory;
    this.history.getRyptTransferHistory = this.history.getPoolTokenTransferHistory;
  }
}

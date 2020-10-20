/* eslint-disable */
import StablePool from "./stable.js";

const contractAddresses = {
  "RariFundController": "0x6afE6C37bF75f80D512b9D89C19EC0B346b09a8d",
  "RariFundManager": "0x59FA438cD0731EBF5F4cDCaf72D4960EFd13FCe6",
  "RariFundToken": "0x3baa6B7Af0D72006d3ea770ca29100Eb848559ae",
  "RariFundPriceConsumer": "0x00815e0e9d118769542ce24be95f8e21c60e5561",
  "RariFundProxy": "0x6dd8e1Df9F366e6494c2601e515813e0f9219A88"
};

export default class YieldPool extends StablePool {
  API_BASE_URL = "http://localhost:3000/pools/yield/";

  static CONTRACT_ADDRESSES = contractAddresses;
  static LEGACY_CONTRACT_ADDRESSES = undefined;
  static LEGACY_CONTRACT_ABIS = undefined;

  constructor(web3, getAllTokens) {
    super(web3, getAllTokens);

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new web3.eth.Contract(
        YieldPool.CONTRACT_ABIS[contractName],
        contractAddresses[contractName]
      );
    // this.gsnContracts = { RariFundProxy: new web3Gsn.eth.Contract(abis.RariFundProxy, contractAddresses.RariFundProxy) };
    delete this.legacyContracts;

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

    delete this.history.getRsptExchangeRateHistory;
    this.history.getRyptExchangeRateHistory = this.history.getPoolTokenExchangeRateHistory;

    this.history.getPoolAllocationHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await this.contracts.RariFundController.getPastEvents(
            "PoolAllocation",
            { fromBlock: Math.max(fromBlock, 11085000), toBlock, filter }
          )
        : [];
    };

    this.history.getCurrencyExchangeHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await this.contracts.RariFundController.getPastEvents(
            "CurrencyTrade",
            { fromBlock: Math.max(fromBlock, 11085000), toBlock, filter }
          )
        : [];
    };

    this.history.getDepositHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await this.contracts.RariFundManager.getPastEvents("Deposit", {
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
        ? await this.contracts.RariFundManager.getPastEvents("Withdrawal", {
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
        ? await this.contracts.RariFundProxy.getPastEvents(
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
        ? await this.contracts.RariFundProxy.getPastEvents(
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
        ? await this.contracts.RariFundToken.getPastEvents("Transfer", {
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

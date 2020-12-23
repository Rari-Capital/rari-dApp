/* eslint-disable */
import StablePool from "./stable.js";

const contractAddresses = {
  RariFundController: "0x6afE6C37bF75f80D512b9D89C19EC0B346b09a8d",
  RariFundManager: "0x59FA438cD0731EBF5F4cDCaf72D4960EFd13FCe6",
  RariFundToken: "0x3baa6B7Af0D72006d3ea770ca29100Eb848559ae",
  RariFundPriceConsumer: "0x00815e0e9d118769542ce24be95f8e21c60e5561",
  RariFundProxy: "0x35DDEFa2a30474E64314aAA7370abE14c042C6e8"
};

const legacyContractAddresses = {
  "v1.0.0": {
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

    this.deposits.getDepositSlippage = async function(currencyCode, amount, usdAmount) {
      // Get tokens
      var allTokens = await self.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode]) throw new Error("Invalid currency code!");

      // Try cache
      if (self.cache._raw.coinGeckoUsdPrices && self.cache._raw.coinGeckoUsdPrices.value && self.cache._raw.coinGeckoUsdPrices.value[currencyCode] && new Date().getTime() / 1000 > self.cache._raw.coinGeckoUsdPrices.lastUpdated + self.cache._raw.coinGeckoUsdPrices.timeout)
        return Web3.utils.toBN(1e18).sub(usdAmount.mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(currencyCode === "ETH" ? 18 : allTokens[currencyCode].decimals))).div(Web3.utils.toBN(Math.trunc(parseFloat(amount.toString()) * self.cache._raw.coinGeckoUsdPrices.value[currencyCode]))));

      // Build currency code array
      var currencyCodes = [...self.allocations.CURRENCIES];
      if (currencyCodes.indexOf(currencyCode) < 0) currencyCodes.push(currencyCode);

      // Get CoinGecko IDs
      var decoded = await self.cache.getOrUpdate("coinGeckoList", async function() { return (await axios.get('https://api.coingecko.com/api/v3/coins/list')).data });
      if (!decoded) throw new Error("Failed to decode coins list from CoinGecko");
      var currencyCodesByCoinGeckoIds = {};

      for (const currencyCode of currencyCodes) {
        var filtered = decoded.filter(coin => coin.symbol.toLowerCase() === currencyCode.toLowerCase());
        if (!filtered) throw new Error("Failed to get currency IDs from CoinGecko");
        for (const coin of filtered) currencyCodesByCoinGeckoIds[coin.id] = currencyCode;
      }

      // Get prices
      var decoded = (await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          vs_currencies: "usd",
          ids: Object.keys(currencyCodesByCoinGeckoIds).join(','),
          include_market_cap: true
        }
      })).data;
      if (!decoded) throw new Error("Failed to decode USD exchange rates from CoinGecko");
      var prices = {};
      var maxMarketCaps = {};
      
      for (const key of Object.keys(decoded)) if (prices[currencyCodesByCoinGeckoIds[key]] === undefined || decoded[key].usd_market_cap > maxMarketCaps[currencyCodesByCoinGeckoIds[key]]) {
        maxMarketCaps[currencyCodesByCoinGeckoIds[key]] = decoded[key].usd_market_cap;
        prices[currencyCodesByCoinGeckoIds[key]] = decoded[key].usd;
      }

      // Update cache
      self.cache.update("coinGeckoUsdPrices", prices);

      // Return slippage
      if (self.cache._raw.coinGeckoUsdPrices.value[currencyCode])
        return Web3.utils.toBN(1e18).sub(usdAmount.mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(currencyCode === "ETH" ? 18 : allTokens[currencyCode].decimals))).div(Web3.utils.toBN(Math.trunc(parseFloat(amount.toString()) * self.cache._raw.coinGeckoUsdPrices.value[currencyCode]))));
      else throw new Error("Failed to get currency prices from CoinGecko");
    };

    this.withdrawals.getWithdrawalSlippage = async function(currencyCode, amount, usdAmount) {
      // Get tokens
      var allTokens = await self.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode]) throw new Error("Invalid currency code!");

      // Try cache
      if (self.cache._raw.coinGeckoUsdPrices && self.cache._raw.coinGeckoUsdPrices.value && self.cache._raw.coinGeckoUsdPrices.value[currencyCode] && new Date().getTime() / 1000 > self.cache._raw.coinGeckoUsdPrices.lastUpdated + self.cache._raw.coinGeckoUsdPrices.timeout)
        return Web3.utils.toBN(1e18).sub(Web3.utils.toBN(Math.trunc(parseFloat(amount) * self.cache._raw.coinGeckoUsdPrices.value[currencyCode])).mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(currencyCode === "ETH" ? 18 : allTokens[currencyCode].decimals))).div(usdAmount));

      // Build currency code array
      var currencyCodes = [...self.allocations.CURRENCIES];
      currencyCodes.push(currencyCode);

      // Get CoinGecko IDs
      var decoded = await self.cache.getOrUpdate("coinGeckoList", async function() { return (await axios.get('https://api.coingecko.com/api/v3/coins/list')).data });
      if (!decoded) throw new Error("Failed to decode coins list from CoinGecko");
      var currencyCodesByCoinGeckoIds = {};

      for (const currencyCode of currencyCodes) {
        var filtered = decoded.filter(coin => coin.symbol.toLowerCase() === currencyCode.toLowerCase());
        if (!filtered) throw new Error("Failed to get currency IDs from CoinGecko");
        for (coin of filtered) currencyCodesByCoinGeckoIds[coin.id] = currencyCode;
      }

      // Get prices
      var decoded = (await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          vs_currencies: "usd",
          ids: Object.keys(currencyCodesByCoinGeckoIds).join(','),
          include_market_cap: true
        }
      })).data;
      if (!decoded) throw new Error("Failed to decode USD exchange rates from CoinGecko");
      var prices = {};
      var maxMarketCaps = {};
      
      for (const key of Object.keys(decoded)) if (prices[currencyCodesByCoinGeckoIds[key]] === undefined || decoded[key].usd_market_cap > maxMarketCaps[currencyCodesByCoinGeckoIds[key]]) {
        maxMarketCaps[currencyCodesByCoinGeckoIds[key]] = decoded[key].usd_market_cap;
        prices[currencyCodesByCoinGeckoIds[key]] = decoded[key].usd;
      }

      // Update cache
      self.cache.update("coinGeckoUsdPrices", prices);

      // Return slippage
      if (self.cache._raw.coinGeckoUsdPrices.value[currencyCode])
        return Web3.utils.toBN(1e18).sub(Web3.utils.toBN(Math.trunc(parseFloat(amount.toString()) * self.cache._raw.coinGeckoUsdPrices.value[currencyCode])).mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(currencyCode === "ETH" ? 18 : allTokens[currencyCode].decimals))).div(usdAmount));
      else throw new Error("Failed to get currency prices from CoinGecko");
    };

    this.history.getPoolAllocationHistory = async function (
      fromBlock,
      toBlock,
      filter
    ) {
      return toBlock >= 11085000
        ? await self.contracts.RariFundController.getPastEvents(
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
        ? await self.contracts.RariFundController.getPastEvents(
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

/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";
import { get0xSwapOrders } from "../0x.js";

var erc20Abi = require(__dirname + "/../abi/ERC20.json");

const contractAddresses = {
  RariFundController: "0xEe7162bB5191E8EC803F7635dE9A920159F1F40C",
  RariFundManager: "0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a",
  RariFundToken: "0x016bf078ABcaCB987f0589a6d3BEAdD4316922B0",
  RariFundPriceConsumer: "0xFE98A52bCAcC86432E7aa76376751DcFAB202244",
  RariFundProxy: "0xB202cAd3965997f2F5E67B349B2C5df036b9792e"
};

var abis = {};
for (const contractName of Object.keys(contractAddresses))
  abis[contractName] = require(__dirname +
    "/stable/abi/" +
    contractName +
    ".json");

const legacyContractAddresses = {
  "v1.0.0": {
    RariFundManager: "0x686ac9d046418416d3ed9ea9206f3dace4943027",
    RariFundToken: "0x9366B7C00894c3555c7590b0384e5F6a9D55659f",
    RariFundProxy: "0x27C4E34163b5FD2122cE43a40e3eaa4d58eEbeaF"
  },
  "v1.1.0": {
    RariFundManager: "0x6bdaf490c5b6bb58564b3e79c8d18e8dfd270464",
    RariFundProxy: "0x318cfd99b60a63d265d2291a4ab982073fbf245d"
  },
  "v1.2.0": {
    RariFundProxy: "0xb6b79D857858004BF475e4A57D4A446DA4884866"
  },
  "v2.0.0": {
    RariFundManager: "0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a",
    RariFundProxy: "0xD4be7E211680e12c08bbE9054F0dA0D646c45228"
  }
};

var legacyAbis = {};

for (const version of Object.keys(legacyContractAddresses))
  for (const contractName of Object.keys(legacyContractAddresses[version])) {
    if (!legacyAbis[version]) legacyAbis[version] = {};
    legacyAbis[version][contractName] = require(__dirname +
      "/stable/abi/legacy/" +
      version +
      "/" +
      contractName +
      ".json");
  }

export default class StablePool {
  API_BASE_URL = "https://api.rari.capital/pools/stable/";
  POOL_TOKEN_SYMBOL = "RSPT";

  static CONTRACT_ADDRESSES = contractAddresses;
  static CONTRACT_ABIS = abis;
  static LEGACY_CONTRACT_ADDRESSES = legacyContractAddresses;
  static LEGACY_CONTRACT_ABIS = legacyAbis;

  internalTokens = {
    DAI: {
      symbol: "DAI",
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      name: "Dai Stablecoin",
      decimals: 18,
    },
    USDC: {
      symbol: "USDC",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      name: "USD Coin",
      decimals: 6,
    },
    USDT: {
      symbol: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      name: "Tether USD",
      decimals: 6,
    },
    TUSD: {
      symbol: "TUSD",
      address: "0x0000000000085d4780b73119b644ae5ecd22b376",
      name: "TrueUSD",
      decimals: 18,
    },
    BUSD: {
      symbol: "BUSD",
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      name: "Binance USD",
      decimals: 18,
    },
    sUSD: {
      symbol: "sUSD",
      address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
      name: "sUSD",
      decimals: 18,
    },
    mUSD: {
      symbol: "mUSD",
      address: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
      name: "mStable USD",
      decimals: 18,
    },
  };

  constructor(web3, subpools, getAllTokens) {
    this.web3 = web3;
    this.pools = subpools;
    this.getAllTokens = getAllTokens;
    this.cache = new Cache({
      usdPrices: 900,
      allBalances: 30,
      accountBalanceLimit: 3600,
    });

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new this.web3.eth.Contract(
        abis[contractName],
        contractAddresses[contractName]
      );
    // this.gsnContracts = { RariFundProxy: new this.web3Gsn.eth.Contract(abis.RariFundProxy, contractAddresses.RariFundProxy) };
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
    
    for (const currencyCode of Object.keys(this.internalTokens))
      this.internalTokens[currencyCode].contract = new this.web3.eth.Contract(
        erc20Abi,
        this.internalTokens[currencyCode].address
      );

    var self = this;

    this.balances = {
      getTotalSupply: async function () {
        return Web3.utils.toBN(
          await self.contracts.RariFundManager.methods.getFundBalance().call()
        );
      },
      getTotalInterestAccrued: async function (
        fromBlock = 0,
        toBlock = "latest"
      ) {
        if (!fromBlock) fromBlock = 0;
        if (toBlock === undefined) toBlock = "latest";

        if (fromBlock == 0 && toBlock === "latest")
          return Web3.utils.toBN(
            await self.contracts.RariFundManager.methods
              .getInterestAccrued()
              .call()
          );
        else
          try {
            return Web3.utils.toBN(
              (
                await axios.get(self.API_BASE_URL + "interest", {
                  params: { fromBlock, toBlock },
                })
              ).data
            );
          } catch (error) {
            throw new Error("Error in Rari API: " + error);
          }
      },
      balanceOf: async function (account) {
        if (!account) throw new Error("No account specified");
        return Web3.utils.toBN(
          await self.contracts.RariFundManager.methods.balanceOf(account).call()
        );
      },
      interestAccruedBy: async function (
        account,
        fromBlock = 0,
        toBlock = "latest"
      ) {
        if (!account) throw new Error("No account specified");
        if (!fromBlock) fromBlock = 0;
        if (toBlock === undefined) toBlock = "latest";

        try {
          return Web3.utils.toBN(
            (
              await axios.get(self.API_BASE_URL + "interest/" + account, {
                params: { fromBlock, toBlock },
              })
            ).data
          );
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
      transfer: async function (recipient, amount, options) {
        if (!recipient) throw new Error("No recipient specified.");
        if (
          !amount ||
          !Web3.utils.BN.isBN(amount) ||
          !amount.gt(Web3.utils.toBN(0))
        )
          throw new Error("Amount is not a valid BN instance greater than 0.");
        if (!options || !options.from)
          throw new Error("Options parameter not set or from address not set.");

        var fundBalanceBN = Web3.utils.toBN(
          await self.contracts.RariFundManager.methods.getFundBalance().call()
        );
        var rftTotalSupplyBN = Web3.utils.toBN(
          await self.contracts.RariFundToken.methods.totalSupply().call()
        );
        var rftAmountBN = amount.mul(rftTotalSupplyBN).div(fundBalanceBN);
        return await self.contracts.RariFundToken.methods
          .transfer(recipient, rftAmountBN)
          .send(options);
      },
    };

    this.allocations = {
      CURRENCIES: ["DAI", "USDC", "USDT", "TUSD", "BUSD", "sUSD", "mUSD"],
      POOLS: ["dYdX", "Compound", "Aave", "mStable"],
      POOLS_BY_CURRENCY: {
        DAI: ["dYdX", "Compound", "Aave"],
        USDC: ["dYdX", "Compound", "Aave"],
        USDT: ["Compound", "Aave"],
        TUSD: ["Aave"],
        BUSD: ["Aave"],
        sUSD: ["Aave"],
        mUSD: ["mStable"],
      },
      CURRENCIES_BY_POOL: {
        dYdX: ["DAI", "USDC"],
        Compound: ["DAI", "USDC", "USDT"],
        Aave: ["DAI", "USDC", "USDT", "TUSD", "BUSD", "sUSD"],
        mStable: ["mUSD"],
      },
      getRawCurrencyAllocations: async function () {
        var allocationsByCurrency = {
          DAI: Web3.utils.toBN(0),
          USDC: Web3.utils.toBN(0),
          USDT: Web3.utils.toBN(0),
          TUSD: Web3.utils.toBN(0),
          BUSD: Web3.utils.toBN(0),
          sUSD: Web3.utils.toBN(0),
          mUSD: Web3.utils.toBN(0),
        };
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        for (var i = 0; i < allBalances["0"].length; i++) {
          var currencyCode = allBalances["0"][i];
          var contractBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          allocationsByCurrency[currencyCode] = contractBalanceBN;
          var pools = allBalances["2"][i];
          var poolBalances = allBalances["3"][i];

          for (var j = 0; j < pools.length; j++) {
            var poolBalanceBN = Web3.utils.toBN(poolBalances[j]);
            allocationsByCurrency[currencyCode].iadd(poolBalanceBN);
          }
        }

        return allocationsByCurrency;
      },
      getRawCurrencyAllocationsInUsd: async function () {
        var allocationsByCurrency = {
          DAI: Web3.utils.toBN(0),
          USDC: Web3.utils.toBN(0),
          USDT: Web3.utils.toBN(0),
          TUSD: Web3.utils.toBN(0),
          BUSD: Web3.utils.toBN(0),
          sUSD: Web3.utils.toBN(0),
          mUSD: Web3.utils.toBN(0),
        };
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        for (var i = 0; i < allBalances["0"].length; i++) {
          var currencyCode = allBalances["0"][i];
          var priceInUsdBN = Web3.utils.toBN(allBalances["4"][i]);
          var contractBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          var contractBalanceUsdBN = contractBalanceBN
            .mul(priceInUsdBN)
            .div(
              Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals)
            );
          allocationsByCurrency[currencyCode] = contractBalanceUsdBN;
          var pools = allBalances["2"][i];
          var poolBalances = allBalances["3"][i];

          for (var j = 0; j < pools.length; j++) {
            var poolBalanceBN = Web3.utils.toBN(poolBalances[j]);
            var poolBalanceUsdBN = poolBalanceBN
              .mul(priceInUsdBN)
              .div(
                Web3.utils.toBN(
                  10 ** self.internalTokens[currencyCode].decimals
                )
              );
            allocationsByCurrency[currencyCode].iadd(poolBalanceUsdBN);
          }
        }

        return allocationsByCurrency;
      },
      getRawPoolAllocations: async function () {
        var allocationsByPool = {
          _cash: Web3.utils.toBN(0),
          dYdX: Web3.utils.toBN(0),
          Compound: Web3.utils.toBN(0),
          Aave: Web3.utils.toBN(0),
          mStable: Web3.utils.toBN(0),
        };
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        for (var i = 0; i < allBalances["0"].length; i++) {
          var currencyCode = allBalances["0"][i];
          var priceInUsdBN = Web3.utils.toBN(allBalances["4"][i]);
          var contractBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          var contractBalanceUsdBN = contractBalanceBN
            .mul(priceInUsdBN)
            .div(
              Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals)
            );
          allocationsByPool._cash.iadd(contractBalanceUsdBN);
          var pools = allBalances["2"][i];
          var poolBalances = allBalances["3"][i];

          for (var j = 0; j < pools.length; j++) {
            var pool = pools[j];
            var poolBalanceBN = Web3.utils.toBN(poolBalances[j]);
            var poolBalanceUsdBN = poolBalanceBN
              .mul(priceInUsdBN)
              .div(
                Web3.utils.toBN(
                  10 ** self.internalTokens[currencyCode].decimals
                )
              );
            allocationsByPool[self.allocations.POOLS[pool]].iadd(
              poolBalanceUsdBN
            );
          }
        }

        return allocationsByPool;
      },
      getRawAllocations: async function () {
        var currencies = {};
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        for (var i = 0; i < allBalances["0"].length; i++) {
          var currencyCode = allBalances["0"][i];
          var contractBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          currencies[currencyCode] = { _cash: contractBalanceBN };
          var pools = allBalances["2"][i];
          var poolBalances = allBalances["3"][i];

          for (var j = 0; j < pools.length; j++) {
            var pool = pools[j];
            var poolBalanceBN = Web3.utils.toBN(poolBalances[j]);
            currencies[currencyCode][
              self.allocations.POOLS[pool]
            ] = poolBalanceBN;
          }
        }

        return currencies;
      },
      getCurrencyUsdPrices: async function () {
        var prices = {};
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );
        for (var i = 0; i < allBalances["0"].length; i++)
          prices[allBalances["0"][i]] = Web3.utils.toBN(allBalances["4"][i]);
        return prices;
      },
    };

    this.apy = {
      getCurrentRawApy: async function () {
        var factors = [];
        var totalBalanceUsdBN = Web3.utils.toBN(0);

        // Get pool APYs
        var poolApyBNs = [];
        for (var i = 0; i < self.allocations.POOLS.length; i++)
          poolApyBNs[i] = await self.pools[
            self.allocations.POOLS[i]
          ].getCurrencyApys();

        // Get all balances
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        // Get raw balances
        for (var i = 0; i < allBalances["0"].length; i++) {
          var currencyCode = allBalances["0"][i];
          var priceInUsdBN = Web3.utils.toBN(allBalances["4"][i]);
          var contractBalanceBN = Web3.utils.toBN(allBalances["1"][i]);

          var contractBalanceUsdBN = contractBalanceBN
            .mul(priceInUsdBN)
            .div(
              Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals)
            );
          factors.push([contractBalanceUsdBN, Web3.utils.toBN(0)]);
          totalBalanceUsdBN = totalBalanceUsdBN.add(contractBalanceUsdBN);
          var pools = allBalances["2"][i];
          var poolBalances = allBalances["3"][i];

          for (var j = 0; j < pools.length; j++) {
            var pool = pools[j];
            var poolBalanceBN = Web3.utils.toBN(poolBalances[j]);

            var poolBalanceUsdBN = poolBalanceBN
              .mul(priceInUsdBN)
              .div(
                Web3.utils.toBN(
                  10 ** self.internalTokens[currencyCode].decimals
                )
              );

            factors.push([poolBalanceUsdBN, poolApyBNs[pool][currencyCode]]);
            totalBalanceUsdBN = totalBalanceUsdBN.add(poolBalanceUsdBN);
          }
        }

        if (totalBalanceUsdBN.isZero()) {
          var maxApyBN = Web3.utils.toBN(0);
          for (var i = 0; i < factors.length; i++)
            if (factors[i][1].gt(maxApyBN)) maxApyBN = factors[i][1];
          return maxApyBN;
        }

        var apyBN = Web3.utils.toBN(0);
        for (var i = 0; i < factors.length; i++) {
          apyBN.iadd(factors[i][0].mul(factors[i][1]).div(totalBalanceUsdBN));
        }

        return apyBN;
      },
      getCurrentApy: async function () {
        var rawFundApy = await self.apy.getCurrentRawApy();
        return rawFundApy.sub(
          rawFundApy
            .mul(
              Web3.utils.toBN(
                await self.contracts.RariFundManager.methods
                  .getInterestFeeRate()
                  .call()
              )
            )
            .div(Web3.utils.toBN(1e18))
        );
      },
      calculateApy: function (
        startTimestamp,
        startRsptExchangeRate,
        endTimestamp,
        endRsptExchangeRate
      ) {
        const SECONDS_PER_YEAR = 365 * 86400;
        var timeDiff = endTimestamp - startTimestamp;
        return Web3.utils.toBN((((endRsptExchangeRate.toString() / startRsptExchangeRate.toString()) ** (SECONDS_PER_YEAR / timeDiff)) - 1) * 1e18);
      },
      getApyOverBlocks: async function (fromBlock = 0, toBlock = "latest") {
        var blockNumber = await self.web3.eth.getBlockNumber();
        var fromBlock =
          fromTimestamp !== undefined
            ? Math.max(fromTimestamp, 10365607)
            : 10365607;
        var toBlock =
          toBlock !== undefined && toBlock !== "latest"
            ? Math.min(toBlock, blockNumber)
            : blockNumber;
        var fromTimestamp = (await self.web3.eth.getBlock(fromBlock)).timestamp;
        var toTimestamp = (await self.web3.eth.getBlock(toBlock)).timestamp;
        return await self.apy.calculateApy(
          fromTimestamp,
          await self.poolToken.getExchangeRate(fromBlock),
          toTimestamp,
          await self.poolToken.getExchangeRate(toBlock)
        );
      },
      getApyOverTime: async function (
        fromTimestamp = 0,
        toTimestamp = "latest"
      ) {
        var fromTimestamp =
          fromTimestamp !== undefined
            ? Math.max(fromTimestamp, 1593499687)
            : 1593499687;
        var toTimestamp =
          toTimestamp !== undefined && toTimestamp !== "latest"
            ? Math.min(toTimestamp, new Date().getTime() / 1000)
            : Math.trunc(new Date().getTime() / 1000);

        try {
          return (
            await axios.get(self.API_BASE_URL + "apy", {
              params: { fromTimestamp, toTimestamp },
            })
          ).data;
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
    };

    this.deposits = {
      getDepositCurrencies: async function () {
        var currencyCodes = self.allocations.CURRENCIES.slice();
        currencyCodes.push("ETH");
        var allTokens = await self.getAllTokens();
        for (const currencyCode of Object.keys(allTokens))
          if (currencyCodes.indexOf(currencyCode) < 0)
            currencyCodes.push(currencyCode);
        return currencyCodes;
      },
      getDirectDepositCurrencies: async function () {
        return await self.contracts.RariFundManager.methods
          .getAcceptedCurrencies()
          .call();
      },
      getAccountBalanceLimit: async function (account) {
        return await self.contracts.RariFundManager.methods
          .getAccountBalanceLimit(account)
          .call();
      },
      getDefaultAccountBalanceLimit: async function (account) {
        return await self.contracts.RariFundManager.methods
          .getDefaultAccountBalanceLimit(account)
          .call();
      },
      validateDeposit: async function (currencyCode, amount, sender) {
        // Input validation
        if (!sender) throw new Error("Sender parameter not set.");
        var allTokens = await self.getAllTokens();
        if (currencyCode !== "ETH" && !allTokens[currencyCode])
          throw new Error("Invalid currency code!");
        if (!amount || amount.lte(Web3.utils.toBN(0)))
          throw new Error("Deposit amount must be greater than 0!");
        var accountBalanceBN = Web3.utils.toBN(
          await (currencyCode == "ETH"
            ? self.web3.eth.getBalance(sender)
            : allTokens[currencyCode].contract.methods.balanceOf(sender).call())
        );
        if (amount.gt(accountBalanceBN))
          throw new Error("Not enough balance in your account to make a deposit of this amount.");

        // Check if currency is directly depositable
        var directlyDepositableCurrencyCodes = await self.contracts.RariFundManager.methods
          .getAcceptedCurrencies()
          .call();
        if (!directlyDepositableCurrencyCodes || directlyDepositableCurrencyCodes.length == 0)
          throw new Error("No directly depositable currencies found.");

        if (directlyDepositableCurrencyCodes.indexOf(currencyCode) >= 0) {
          // Get USD amount added to sender's fund balance
          var allBalances = await self.cache.getOrUpdate(
            "allBalances",
            self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
              .call
          );
          var amountUsdBN = amount
            .mul(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            )
            .div(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            );

          // Return amountUsdBN
          return [amountUsdBN];
        } else {
          // Get mStable output currency if possible
          var mStableOutputCurrency = null;
          var mStableOutputAmountAfterFeeBN = null;

          if (
            ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(currencyCode) >= 0
          ) {
            for (var acceptedCurrency of directlyDepositableCurrencyCodes)
              if (
                ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(
                  acceptedCurrency
                ) >= 0
              ) {
                if (currencyCode === "mUSD") {
                  try {
                    var redeemValidity = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                      .getRedeemValidity(
                        "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                        amount,
                        self.internalTokens[acceptedCurrency].address
                      )
                      .call();
                  } catch (err) {
                    console.error("Failed to check mUSD redeem validity:", err);
                    continue;
                  }

                  if (!redeemValidity || !redeemValidity["0"]) continue;
                  mStableOutputAmountAfterFeeBN = Web3.utils.toBN(
                    redeemValidity["2"]
                  );
                } else {
                  try {
                    var maxSwap = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                      .getMaxSwap(
                        "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                        self.internalTokens[currencyCode].address,
                        self.internalTokens[acceptedCurrency].address
                      )
                      .call();
                  } catch (err) {
                    console.error("Failed to check mUSD max swap:", err);
                    continue;
                  }

                  if (!maxSwap || !maxSwap["0"] || amount.gt(Web3.utils.toBN(maxSwap["2"]))) continue;
                  var outputAmountBeforeFeesBN = amount.mul(Web3.utils.toBN(10 ** self.internalTokens[acceptedCurrency].decimals)).div(Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals));
    
                  if (acceptedCurrency === "mUSD") mStableOutputAmountAfterFeeBN = outputAmountBeforeFeesBN;
                  else {
                    var swapFeeBN = await self.pools["mStable"].getMUsdSwapFeeBN();
                    mStableOutputAmountAfterFeeBN = outputAmountBeforeFeesBN.sub(outputAmountBeforeFeesBN.mul(swapFeeBN).div(Web3.utils.toBN(1e18)));
                  }
                }

                mStableOutputCurrency = acceptedCurrency;
                break;
              }
          }

          // Ideally mStable, but 0x works too
          if (mStableOutputCurrency !== null) {
            // Get USD amount added to sender's fund balance
            var allBalances = await self.cache.getOrUpdate(
              "allBalances",
              self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
                .call
            );
            var outputAmountUsdBN = mStableOutputAmountAfterFeeBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(mStableOutputCurrency)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(
                      self.internalTokens[mStableOutputCurrency].decimals
                    )
                  )
              );

            // Return outputAmountUsdBN
            return [outputAmountUsdBN];
          } else {
            // Otherwise, use first accepted currency for 0x
            var acceptedCurrency = directlyDepositableCurrencyCodes[0];

            // Get orders from 0x swap API
            try {
              var [
                orders,
                inputFilledAmountBN,
                protocolFee,
                takerAssetFilledAmountBN,
                makerAssetFilledAmountBN,
                gasPrice,
              ] = await get0xSwapOrders(
                currencyCode === "ETH"
                  ? "WETH"
                  : allTokens[currencyCode].address,
                allTokens[acceptedCurrency].address,
                amount
              );
            } catch (err) {
              throw new Error("Failed to get swap orders from 0x API: " + err);
            }

            // Get USD amount added to sender's fund balance
            var allBalances = await self.cache.getOrUpdate(
              "allBalances",
              self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
                .call
            );
            var makerAssetFilledAmountUsdBN = makerAssetFilledAmountBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(acceptedCurrency)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(
                      self.internalTokens[acceptedCurrency].decimals
                    )
                  )
              );

            // Make sure input amount is completely filled
            if (inputFilledAmountBN.lt(amount))
              throw new Error(
                "Unable to find enough liquidity to exchange " +
                currencyCode +
                " before depositing."
              );

            // Make sure we have enough ETH for the protocol fee
            var ethBalanceBN =
              currencyCode == "ETH"
                ? accountBalanceBN
                : Web3.utils.toBN(await self.web3.eth.getBalance(sender));
            if (
              Web3.utils
                .toBN(protocolFee)
                .gt(
                  currencyCode === "ETH"
                    ? ethBalanceBN.sub(amount)
                    : ethBalanceBN
                )
            )
              throw new Error("ETH balance too low to cover 0x exchange protocol fee.");

            // Return makerAssetFilledAmountUsdBN and protocolFee
            return [makerAssetFilledAmountUsdBN, Web3.utils.toBN(protocolFee)];
          }
        }
      },
      deposit: async function (currencyCode, amount, minUsdAmount, options) {
        // Input validation
        if (!options || !options.from)
          throw new Error("Options parameter not set or from address not set.");
        var allTokens = await self.getAllTokens();
        if (currencyCode !== "ETH" && !allTokens[currencyCode])
          throw new Error("Invalid currency code!");
        if (!amount || amount.lte(Web3.utils.toBN(0)))
          throw new Error("Deposit amount must be greater than 0!");
        var accountBalanceBN = Web3.utils.toBN(
          await (currencyCode == "ETH"
            ? self.web3.eth.getBalance(options.from)
            : allTokens[currencyCode].contract.methods.balanceOf(options.from).call())
        );
        if (amount.gt(accountBalanceBN))
          throw new Error("Not enough balance in your account to make a deposit of this amount.");

        // Check if currency is directly depositable
        var directlyDepositableCurrencyCodes = await self.contracts.RariFundManager.methods
          .getAcceptedCurrencies()
          .call();
        if (!directlyDepositableCurrencyCodes || directlyDepositableCurrencyCodes.length == 0)
          throw new Error("No directly depositable currencies found.");

        if (directlyDepositableCurrencyCodes.indexOf(currencyCode) >= 0) {
          // Get USD amount added to sender's fund balance
          var allBalances = await self.cache.getOrUpdate(
            "allBalances",
            self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
              .call
          );
          var amountUsdBN = amount
            .mul(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            )
            .div(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            );

          // Check amountUsdBN against minUsdAmount
          if (typeof minUsdAmount !== undefined && minUsdAmount !== null && amountUsdBN.lt(minUsdAmount)) return [amountUsdBN];

          // Get deposit contract
          var useGsn = /* amountUsdBN.gte(Web3.utils.toBN(250e18)) && myFundBalanceBN.isZero() */ false;
          var approvalReceipt = null;
          var receipt;

          var approveAndDeposit = async function () {
            var depositContract = useGsn
              ? self.gsnContracts.RariFundProxy
              : self.contracts.RariFundManager;

            // Approve tokens to RariFundManager
            try {
              var allowanceBN = Web3.utils.toBN(
                await allTokens[currencyCode].contract.methods
                  .allowance(options.from, depositContract.options.address)
                  .call()
              );
              if (allowanceBN.lt(amount))
                approvalReceipt = await allTokens[
                  currencyCode
                ].contract.methods
                  .approve(depositContract.options.address, amount)
                  .send(options);
            } catch (err) {
              throw new Error(
                "Failed to approve tokens: " + (err.message ? err.message : err)
              );
            }

            // Deposit tokens to RariFundManager
            try {
              receipt = await depositContract.methods
                .deposit(currencyCode, amount)
                .send(options);
            } catch (err) {
              if (useGsn) {
                useGsn = false;
                return await approveAndDeposit();
              }

              throw err;
            }
          };

          await approveAndDeposit();
          self.cache.clear("allBalances");
          return [amountUsdBN, null, approvalReceipt, receipt];
        } else {
          // Get mStable output currency if possible
          var mStableOutputCurrency = null;
          var mStableOutputAmountAfterFeeBN = null;

          if (
            ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(currencyCode) >= 0
          ) {
            for (var acceptedCurrency of directlyDepositableCurrencyCodes)
              if (
                ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(
                  acceptedCurrency
                ) >= 0
              ) {
                if (currencyCode === "mUSD") {
                  try {
                    var redeemValidity = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                      .getRedeemValidity(
                        "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                        amount,
                        self.internalTokens[acceptedCurrency].address
                      )
                      .call();
                  } catch (err) {
                    console.error("Failed to check mUSD redeem validity:", err);
                    continue;
                  }

                  if (!redeemValidity || !redeemValidity["0"]) continue;
                  mStableOutputAmountAfterFeeBN = Web3.utils.toBN(
                    redeemValidity["2"]
                  );
                } else {
                  try {
                    var maxSwap = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                      .getMaxSwap(
                        "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                        self.internalTokens[currencyCode].address,
                        self.internalTokens[acceptedCurrency].address
                      )
                      .call();
                  } catch (err) {
                    console.error("Failed to check mUSD max swap:", err);
                    continue;
                  }

                  if (!maxSwap || !maxSwap["0"] || amount.gt(Web3.utils.toBN(maxSwap["2"]))) continue;
                  var outputAmountBeforeFeesBN = amount.mul(Web3.utils.toBN(10 ** self.internalTokens[acceptedCurrency].decimals)).div(Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals));
    
                  if (acceptedCurrency === "mUSD") mStableOutputAmountAfterFeeBN = outputAmountBeforeFeesBN;
                  else {
                    var swapFeeBN = await self.pools["mStable"].getMUsdSwapFeeBN();
                    mStableOutputAmountAfterFeeBN = outputAmountBeforeFeesBN.sub(outputAmountBeforeFeesBN.mul(swapFeeBN).div(Web3.utils.toBN(1e18)));
                  }
                }

                mStableOutputCurrency = acceptedCurrency;
                break;
              }
          }

          // Ideally mStable, but 0x works too
          if (mStableOutputCurrency !== null) {
            // Get USD amount added to sender's fund balance
            var allBalances = await self.cache.getOrUpdate(
              "allBalances",
              self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
                .call
            );
            var outputAmountUsdBN = mStableOutputAmountAfterFeeBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(mStableOutputCurrency)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(
                      self.internalTokens[mStableOutputCurrency].decimals
                    )
                  )
              );

            // Check outputAmountUsdBN against minUsdAmount
            if (typeof minUsdAmount !== undefined && minUsdAmount !== null && outputAmountUsdBN.lt(minUsdAmount)) return [outputAmountUsdBN];

            // Approve tokens to RariFundProxy
            try {
              var allowanceBN = Web3.utils.toBN(
                await self.internalTokens[currencyCode].contract.methods
                  .allowance(
                    options.from,
                    self.contracts.RariFundProxy.options.address
                  )
                  .call()
              );
              if (allowanceBN.lt(amount))
                var approvalReceipt = await self.internalTokens[
                  currencyCode
                ].contract.methods
                  .approve(self.contracts.RariFundProxy.options.address, amount)
                  .send(options);
            } catch (err) {
              throw new Error(
                "Failed to approve tokens to RariFundProxy: " +
                (err.message ? err.message : err)
              );
            }

            // Exchange and deposit tokens via mStable via RariFundProxy
            try {
              var receipt = await self.contracts.RariFundProxy.methods[
                "exchangeAndDeposit(string,uint256,string)"
              ](currencyCode, amount, mStableOutputCurrency).send(options);
            } catch (err) {
              throw new Error(
                "RariFundProxy.exchangeAndDeposit failed: " +
                (err.message ? err.message : err)
              );
            }

            self.cache.clear("allBalances");
            return [
              mStableOutputAmountAfterFeeBN,
              null,
              approvalReceipt,
              receipt,
            ];
          } else {
            // Use first accepted currency for 0x
            var acceptedCurrency = directlyDepositableCurrencyCodes[0];

            // Get orders from 0x swap API
            try {
              var [
                orders,
                inputFilledAmountBN,
                protocolFee,
                takerAssetFilledAmountBN,
                makerAssetFilledAmountBN,
                gasPrice,
              ] = await get0xSwapOrders(
                currencyCode === "ETH"
                  ? "WETH"
                  : allTokens[currencyCode].address,
                allTokens[acceptedCurrency].address,
                amount
              );
            } catch (err) {
              throw new Error("Failed to get swap orders from 0x API: " + err);
            }

            // Get USD amount added to sender's fund balance
            var allBalances = await self.cache.getOrUpdate(
              "allBalances",
              self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
                .call
            );
            var makerAssetFilledAmountUsdBN = makerAssetFilledAmountBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(acceptedCurrency)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(
                      self.internalTokens[acceptedCurrency].decimals
                    )
                  )
              );

            // Make sure input amount is completely filled
            if (inputFilledAmountBN.lt(amount))
              throw new Error(
                "Unable to find enough liquidity to exchange " +
                currencyCode +
                " before depositing."
              );

            // Make sure we have enough ETH for the protocol fee
            var ethBalanceBN =
              currencyCode == "ETH"
                ? accountBalanceBN
                : Web3.utils.toBN(await self.web3.eth.getBalance(options.from));
            if (
              Web3.utils
                .toBN(protocolFee)
                .gt(
                  currencyCode === "ETH"
                    ? ethBalanceBN.sub(amount)
                    : ethBalanceBN
                )
            )
              throw new Error("ETH balance too low to cover 0x exchange protocol fee.");

            // Check makerAssetFilledAmountUsdBN against minUsdAmount
            if (typeof minUsdAmount !== undefined && minUsdAmount !== null && makerAssetFilledAmountUsdBN.lt(minUsdAmount))
              return [makerAssetFilledAmountUsdBN];

            // Approve tokens to RariFundProxy if token is not ETH
            if (currencyCode !== "ETH")
              try {
                var allowanceBN = Web3.utils.toBN(
                  await allTokens[currencyCode].contract.methods
                    .allowance(
                      options.from,
                      self.contracts.RariFundProxy.options.address
                    )
                    .call()
                );
                if (allowanceBN.lt(amount))
                  var approvalReceipt = await allTokens[
                    currencyCode
                  ].contract.methods
                    .approve(
                      self.contracts.RariFundProxy.options.address,
                      amount
                    )
                    .send(options);
              } catch (err) {
                throw new Error(
                  "Failed to approve tokens to RariFundProxy: " +
                  (err.message ? err.message : err)
                );
              }

            // Build array of orders and signatures
            var signatures = [];

            for (var j = 0; j < orders.length; j++) {
              signatures[j] = orders[j].signature;

              orders[j] = {
                makerAddress: orders[j].makerAddress,
                takerAddress: orders[j].takerAddress,
                feeRecipientAddress: orders[j].feeRecipientAddress,
                senderAddress: orders[j].senderAddress,
                makerAssetAmount: orders[j].makerAssetAmount,
                takerAssetAmount: orders[j].takerAssetAmount,
                makerFee: orders[j].makerFee,
                takerFee: orders[j].takerFee,
                expirationTimeSeconds: orders[j].expirationTimeSeconds,
                salt: orders[j].salt,
                makerAssetData: orders[j].makerAssetData,
                takerAssetData: orders[j].takerAssetData,
                makerFeeAssetData: orders[j].makerFeeAssetData,
                takerFeeAssetData: orders[j].takerFeeAssetData,
              };
            }

            // Exchange and deposit tokens via RariFundProxy
            try {
              var receipt = await self.contracts.RariFundProxy.methods
                .exchangeAndDeposit(
                  currencyCode === "ETH"
                    ? "0x0000000000000000000000000000000000000000"
                    : allTokens[currencyCode].address,
                  amount,
                  acceptedCurrency,
                  orders,
                  signatures,
                  takerAssetFilledAmountBN
                )
                .send(
                  Object.assign(
                    {
                      value:
                        currencyCode === "ETH"
                          ? Web3.utils.toBN(protocolFee).add(amount).toString()
                          : protocolFee,
                      gasPrice: gasPrice,
                    },
                    options
                  )
                );
            } catch (err) {
              throw new Error(
                "RariFundProxy.exchangeAndDeposit failed: " +
                (err.message ? err.message : err)
              );
            }

            self.cache.clear("allBalances");
            return [
              makerAssetFilledAmountUsdBN,
              Web3.utils.toBN(protocolFee),
              approvalReceipt,
              receipt,
            ];
          }
        }
      },
    };

    this.withdrawals = {
      getWithdrawalCurrencies: async function () {
        var currencyCodes = self.allocations.CURRENCIES.slice();
        currencyCodes.push("ETH");
        var allTokens = await self.getAllTokens();
        for (const currencyCode of Object.keys(allTokens))
          if (currencyCodes.indexOf(currencyCode) < 0)
            currencyCodes.push(currencyCode);
        return currencyCodes;
      },
      getWithdrawalCurrenciesWithoutSlippage: async function () {
        return await self.allocations.getRawCurrencyAllocations();
      },
      getMaxWithdrawalAmount: async function (currencyCode, senderUsdBalance) {
        var allTokens = await self.getAllTokens();
        if (currencyCode !== "ETH" && !allTokens[currencyCode])
          throw new Error("Invalid currency code!");
        if (!senderUsdBalance || senderUsdBalance.lte(Web3.utils.toBN(0)))
          return [Web3.utils.toBN(0)];

        // Get user fund balance
        if (senderUsdBalance === undefined) senderUsdBalance = Web3.utils.toBN(await self.contracts.RariFundManager.methods.balanceOf(sender).call());

        // Check balances to find withdrawal source
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        // See how much we can withdraw directly if token is supported by the fund
        var i = allBalances["0"].indexOf(currencyCode);
        var tokenRawFundBalanceBN = Web3.utils.toBN(0);

        if (i >= 0) {
          tokenRawFundBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          for (var j = 0; j < allBalances["3"][i].length; j++)
            tokenRawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));
        }

        if (tokenRawFundBalanceBN.gt(Web3.utils.toBN(0))) {
          var maxWithdrawalAmountBN = senderUsdBalance
            .mul(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            )
            .div(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            );

          if ((maxWithdrawalAmountBN
            .mul(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            )
            .div(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            )).gt(senderUsdBalance)) maxWithdrawalAmountBN.isubn(1);

          // If tokenRawFundBalanceBN >= maxWithdrawalAmountBN, return maxWithdrawalAmountBN
          if (tokenRawFundBalanceBN.gte(maxWithdrawalAmountBN)) return [maxWithdrawalAmountBN];
        }

        // Otherwise, exchange as few currencies as possible (ideally those with the lowest balances)
        var amountInputtedUsdBN = Web3.utils.toBN(0);
        var amountWithdrawnBN = Web3.utils.toBN(0);
        var totalProtocolFeeBN = Web3.utils.toBN(0);

        // Withdraw as much as we can of the output token first
        if (tokenRawFundBalanceBN.gt(Web3.utils.toBN(0))) {
          amountInputtedUsdBN.iadd(
            tokenRawFundBalanceBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(currencyCode)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                  )
              )
          );
          amountWithdrawnBN.iadd(tokenRawFundBalanceBN);
        }

        // Get input candidates
        var inputCandidates = [];

        for (var i = 0; i < allBalances["0"].length; i++) {
          var inputCurrencyCode = allBalances["0"][i];
          if (inputCurrencyCode !== currencyCode) {
            var rawFundBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
            for (var j = 0; j < allBalances["3"][i].length; j++)
              rawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));

            if (rawFundBalanceBN.gt(Web3.utils.toBN(0))) {
              inputCandidates.push({
                currencyCode: inputCurrencyCode,
                rawFundBalanceBN
              });
            }
          }
        }

        // Calculate max inputs
        function updateMaxInputs() {
          var inputCandidates2 = [];

          for (const inputCandidate of inputCandidates) {
            // Calculate inputAmountBN as maximum of sender USD balance left and rawFundBalanceBN
            var usdAmountLeft = senderUsdBalance.sub(amountInputtedUsdBN);
            var maxInputAmountLeftBN = usdAmountLeft
              .mul(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(self.internalTokens[inputCandidate.currencyCode].decimals)
                  )
              )
              .div(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(inputCandidate.currencyCode)
                ])
              );
            if ((maxInputAmountLeftBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(inputCandidate.currencyCode)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(self.internalTokens[inputCandidate.currencyCode].decimals)
                  )
              )).gt(usdAmountLeft)) maxInputAmountLeftBN.isubn(1);
            var inputAmountBN = Web3.utils.BN.min(maxInputAmountLeftBN, inputCandidate.rawFundBalanceBN);
            
            if (inputAmountBN.gt(Web3.utils.toBN(0))) inputCandidates2.push({
              currencyCode: inputCandidate.currencyCode,
              rawFundBalanceBN: inputCandidate.rawFundBalanceBN,
              inputAmountBN
            });
          }

          inputCandidates = inputCandidates2;
        }

        updateMaxInputs();

        // TODO: Sort candidates from lowest to highest inputAmountUsdBN (or highest to lowest inputAmountUsdBN?)
        /* inputCandidates.sort((a, b) =>
          a.inputAmountUsdBN.gt(b.inputAmountUsdBN) ? 1 : -1
        ); */

        // mStable
        if (
          ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(currencyCode) >= 0
        ) {
          var mStableSwapFeeBN = null;

          for (var i = 0; i < inputCandidates.length; i++) {
            if (
              ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(
                inputCandidates[i].currencyCode
              ) < 0
            )
              continue;

            var mStableInputAmountBN = inputCandidates[i].inputAmountBN;
            var mStableOutputAmountAfterFeesBN = Web3.utils.toBN(0);

            // Check max swap/redeem validity
            if (inputCandidates[i].currencyCode === "mUSD") {
              try {
                var redeemValidity = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                  .getRedeemValidity(
                    "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                    mStableInputAmountBN,
                    self.internalTokens[currencyCode].address
                  )
                  .call();
              } catch (err) {
                console.error("Failed to check mUSD redeem validity:", err);
                continue;
              }

              if (!redeemValidity || !redeemValidity["0"]) continue;
              mStableOutputAmountAfterFeesBN = Web3.utils.toBN(
                redeemValidity["2"]
              );
            } else {
              try {
                var maxSwap = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                  .getMaxSwap(
                    "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                    self.internalTokens[inputCandidates[i].currencyCode].address,
                    self.internalTokens[currencyCode].address
                  )
                  .call();
              } catch (err) {
                console.error("Failed to check mUSD max swap:", err);
                continue;
              }

              if (!maxSwap || !maxSwap["0"] || Web3.utils.toBN(maxSwap["2"]).lte(Web3.utils.toBN(0))) continue;
              mStableInputAmountBN = Web3.utils.BN.min(mStableInputAmountBN, Web3.utils.toBN(maxSwap["2"]));
              var outputAmountBeforeFeesBN = mStableInputAmountBN.mul(Web3.utils.toBN(10 ** self.internalTokens[currencyCode].decimals)).div(Web3.utils.toBN(10 ** self.internalTokens[inputCandidates[i].currencyCode].decimals));

              if (currencyCode === "mUSD") mStableOutputAmountAfterFeesBN = outputAmountBeforeFeesBN;
              else {
                if (mStableSwapFeeBN === null) mStableSwapFeeBN = await self.pools["mStable"].getMUsdSwapFeeBN();
                mStableOutputAmountAfterFeesBN = outputAmountBeforeFeesBN.sub(outputAmountBeforeFeesBN.mul(mStableSwapFeeBN).div(Web3.utils.toBN(1e18)));
              }
            }

            amountInputtedUsdBN.iadd(
              mStableInputAmountBN
                .mul(
                  Web3.utils.toBN(allBalances["4"][
                    self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                  ])
                )
                .div(
                  Web3.utils
                    .toBN(10)
                    .pow(
                      Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                    )
                )
            );
            amountWithdrawnBN.iadd(mStableOutputAmountAfterFeesBN);

            // Update inputCandidates
            updateMaxInputs();

            // Stop if we have filled the USD amount
            if (amountInputtedUsdBN.gt(senderUsdBalance)) throw new Error("Amount inputted in USD greater than sender USD fund balance");
            if (amountInputtedUsdBN.gte(senderUsdBalance.sub(Web3.utils.toBN(1e16)))) break;
          }
        }

        // Use 0x if necessary
        // Deal with amountInputtedUsdBN.lt(senderUsdBalance) not being accurate better than 1 cent margin of error
        if (amountInputtedUsdBN.lt(senderUsdBalance.sub(Web3.utils.toBN(1e16))) && inputCandidates.length > 0) {
          // Get orders from 0x swap API for each input currency candidate
          for (var i = 0; i < inputCandidates.length; i++) {
            try {
              var [
                orders,
                inputFilledAmountBN,
                protocolFee,
                takerAssetFilledAmountBN,
                makerAssetFilledAmountBN,
                gasPrice,
              ] = await get0xSwapOrders(
                self.internalTokens[inputCandidates[i].currencyCode].address,
                currencyCode === "ETH"
                  ? "WETH"
                  : allTokens[currencyCode].address,
                inputCandidates[i].inputAmountBN
              );
            } catch (err) {
              if (err === "Insufficient liquidity") {
                inputCandidates.splice(i, 1);
                i--;
                continue;
              }

              throw new Error("Failed to get swap orders from 0x API: " + err);
            }

            inputCandidates[i].inputFillAmountBN = inputFilledAmountBN;
            inputCandidates[i].protocolFee = protocolFee;
            inputCandidates[i].takerAssetFillAmountBN = takerAssetFilledAmountBN;
            inputCandidates[i].makerAssetFillAmountBN = makerAssetFilledAmountBN;
            inputCandidates[i].takerAssetFillAmountUsdBN = takerAssetFilledAmountBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                  )
              );
          }

          // Sort candidates from highest to lowest output per USD burned
          inputCandidates.sort((a, b) =>
            b.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(b.takerAssetFillAmountUsdBN).gt(a.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(a.takerAssetFillAmountUsdBN)) ? 1 : -1
          );

          // Loop through input currency candidates until we fill the withdrawal
          for (var i = 0; i < inputCandidates.length; i++) {
            // Is this order enough to cover the rest of the withdrawal?
            var usdAmountLeft = senderUsdBalance.sub(amountInputtedUsdBN);
            var inputFillAmountUsdBN = inputCandidates[i].inputFillAmountBN
              .mul(
                Web3.utils.toBN(allBalances["4"][
                  self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                ])
              )
              .div(
                Web3.utils
                  .toBN(10)
                  .pow(
                    Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                  )
              );
            if (
              inputFillAmountUsdBN.gte(usdAmountLeft.sub(Web3.utils.toBN(1e16)))
            ) {
              // If order is enough to cover the rest of the withdrawal, cover it and stop looping through input candidates
              var thisInputAmountBN = inputCandidates[i].inputFillAmountBN
                .mul(usdAmountLeft)
                .div(inputFillAmountUsdBN);
              var thisOutputAmountBN = inputCandidates[i].makerAssetFillAmountBN
                .mul(usdAmountLeft)
                .div(inputFillAmountUsdBN);

              amountInputtedUsdBN.iadd(
                thisInputAmountBN
                  .mul(
                    Web3.utils.toBN(allBalances["4"][
                      self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                    ])
                  )
                  .div(
                    Web3.utils
                      .toBN(10)
                      .pow(
                        Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                      )
                  )
              );
              amountWithdrawnBN.iadd(thisOutputAmountBN);
              totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));

              break;
            } else {
              // Otherwise, add the whole order and keep looping through input candidates
              amountInputtedUsdBN.iadd(
                inputCandidates[i].inputFillAmountBN
                  .mul(
                    Web3.utils.toBN(allBalances["4"][
                      self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                    ])
                  )
                  .div(
                    Web3.utils
                      .toBN(10)
                      .pow(
                        Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                      )
                  )
              );
              amountWithdrawnBN.iadd(inputCandidates[i].makerAssetFillAmountBN);
              totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));
            }

            // Stop if we have filled the USD amount
            if (amountInputtedUsdBN.gt(senderUsdBalance)) throw new Error("Amount inputted in USD greater than sender USD fund balance");
            if (amountInputtedUsdBN.gte(senderUsdBalance.sub(Web3.utils.toBN(1e16)))) break;
          }

          // Make sure input amount is completely filled
          if (amountInputtedUsdBN.lt(senderUsdBalance.sub(Web3.utils.toBN(1e16))))
            throw new Error("Unable to find enough liquidity to exchange withdrawn tokens to " + currencyCode + ".");   
        }

        // Return amountWithdrawnBN and totalProtocolFeeBN
        return [amountWithdrawnBN, totalProtocolFeeBN];
      },
      validateWithdrawal: async function (currencyCode, amount, sender) {
        var allTokens = await self.getAllTokens();
        if (currencyCode !== "ETH" && !allTokens[currencyCode])
          throw new Error("Invalid currency code!");
        if (!amount || amount.lte(Web3.utils.toBN(0)))
          throw new Error("Withdrawal amount must be greater than 0!");

        // Check balances to find withdrawal source
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        // See how much we can withdraw directly if token is supported by the fund
        var i = allBalances["0"].indexOf(currencyCode);
        var tokenRawFundBalanceBN = Web3.utils.toBN(0);

        if (i >= 0) {
          tokenRawFundBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          for (var j = 0; j < allBalances["3"][i].length; j++)
            tokenRawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));
        }

        if (tokenRawFundBalanceBN.gte(amount)) {
          var amountUsdBN = amount
            .mul(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            )
            .div(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            );

          // Return amountUsdBN
          return [amountUsdBN];
        } else {
          // Otherwise, exchange as few currencies as possible (ideally those with the lowest balances)
          var amountInputtedUsdBN = Web3.utils.toBN(0);
          var amountWithdrawnBN = Web3.utils.toBN(0);
          var totalProtocolFeeBN = Web3.utils.toBN(0);

          // Withdraw as much as we can of the output token first
          if (tokenRawFundBalanceBN.gt(Web3.utils.toBN(0))) {
            amountInputtedUsdBN.iadd(
              tokenRawFundBalanceBN
                .mul(
                  Web3.utils.toBN(allBalances["4"][
                    self.allocations.CURRENCIES.indexOf(currencyCode)
                  ])
                )
                .div(
                  Web3.utils
                    .toBN(10)
                    .pow(
                      Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                    )
                )
            );
            amountWithdrawnBN.iadd(tokenRawFundBalanceBN);
          }

          // Get input candidates
          var inputCandidates = [];

          for (var i = 0; i < allBalances["0"].length; i++)
            if (allBalances["0"][i] !== currencyCode) {
              var rawFundBalanceBN = Web3.utils.toBN(0);
              for (var j = 0; j < allBalances["3"][i].length; j++)
                rawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));
              if (rawFundBalanceBN.gt(Web3.utils.toBN(0)))
                inputCandidates.push({
                  currencyCode: allBalances["0"][i],
                  rawFundBalanceBN,
                });
            }

          // TODO: Sort candidates from lowest to highest rawFundBalanceUsdBN (or highest to lowest?)
          /* inputCandidates.sort((a, b) =>
            a.rawFundBalanceUsdBN.gt(b.rawFundBalanceUsdBN) ? 1 : -1
          ); */

          // mStable

          if (
            ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(currencyCode) >= 0
          ) {
            var mStableSwapFeeBN = null;

            for (var i = 0; i < inputCandidates.length; i++) {
              if (
                ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(
                  inputCandidates[i].currencyCode
                ) < 0
              )
                continue;

              // Get swap fee and calculate input amount needed to fill output amount
              if (currencyCode !== "mUSD" && mStableSwapFeeBN === null)
                mStableSwapFeeBN = await self.pools["mStable"].getMUsdSwapFeeBN();
              var inputAmountBN = amount
                .sub(amountWithdrawnBN)
                .mul(Web3.utils.toBN(1e18))
                .div(Web3.utils.toBN(1e18).sub(mStableSwapFeeBN))
                .mul(
                  Web3.utils.toBN(
                    10 **
                      self.internalTokens[inputCandidates[i].currencyCode]
                        .decimals
                  )
                )
                .div(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals));
              var outputAmountBeforeFeesBN = inputAmountBN
                .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                .div(
                  Web3.utils.toBN(
                    10 **
                      self.internalTokens[inputCandidates[i].currencyCode]
                        .decimals
                  )
                );
              var outputAmountBN =
                currencyCode === "mUSD"
                  ? outputAmountBeforeFeesBN
                  : outputAmountBeforeFeesBN.sub(
                      outputAmountBeforeFeesBN
                        .mul(mStableSwapFeeBN)
                        .div(Web3.utils.toBN(1e18))
                    );

              var tries = 0;
              while (outputAmountBN.lt(amount.sub(amountWithdrawnBN))) {
                if (tries >= 1000)
                  throw new Error("Failed to get increment order input amount to achieve desired output amount.");
                inputAmountBN.iadd(Web3.utils.toBN(1)); // Make sure we have enough input amount to receive amount.sub(amountWithdrawnBN)
                outputAmountBeforeFeesBN = inputAmountBN
                  .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                  .div(
                    Web3.utils.toBN(
                      10 **
                        self.internalTokens[inputCandidates[i].currencyCode]
                          .decimals
                    )
                  );
                outputAmountBN =
                  currencyCode === "mUSD"
                    ? outputAmountBeforeFeesBN
                    : outputAmountBeforeFeesBN.sub(
                        outputAmountBeforeFeesBN
                          .mul(mStableSwapFeeBN)
                          .div(Web3.utils.toBN(1e18))
                      );
                tries++;
              }

              if (inputAmountBN.gt(inputCandidates[i].rawFundBalanceBN)) {
                inputAmountBN = inputCandidates[i].rawFundBalanceBN;
                outputAmountBeforeFeesBN = inputAmountBN
                  .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                  .div(
                    Web3.utils.toBN(
                      10 **
                        self.internalTokens[inputCandidates[i].currencyCode]
                          .decimals
                    )
                  );
                outputAmountBN =
                  currencyCode === "mUSD"
                    ? outputAmountBeforeFeesBN
                    : outputAmountBeforeFeesBN.sub(
                        outputAmountBeforeFeesBN
                          .mul(mStableSwapFeeBN)
                          .div(Web3.utils.toBN(1e18))
                      );
              }

              // Check max swap/redeem validity
              if (inputCandidates[i].currencyCode === "mUSD") {
                try {
                  var redeemValidity = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                    .getRedeemValidity(
                      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                      inputAmountBN,
                      self.internalTokens[currencyCode].address
                    )
                    .call();
                } catch (err) {
                  console.error("Failed to check mUSD redeem validity:", err);
                  continue;
                }
  
                if (!redeemValidity || !redeemValidity["0"]) continue;
                if (!outputAmountBN.eq(Web3.utils.toBN(redeemValidity["2"]))) throw new Error("Predicted mStable output amount and output amount returned by getRedeemValidity not equal.");
              } else {
                try {
                  var maxSwap = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                    .getMaxSwap(
                      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                      self.internalTokens[inputCandidates[i].currencyCode].address,
                      self.internalTokens[currencyCode].address
                    )
                    .call();
                } catch (err) {
                  console.error("Failed to check mUSD max swap:", err);
                  continue;
                }
  
                if (!maxSwap || !maxSwap["0"] || Web3.utils.toBN(maxSwap["2"]).lt(inputAmountBN)) continue;
              }

              amountInputtedUsdBN.iadd(
                inputAmountBN
                  .mul(
                    Web3.utils.toBN(allBalances["4"][
                      self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                    ])
                  )
                  .div(
                    Web3.utils
                      .toBN(10)
                      .pow(
                        Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                      )
                  )
              );
              amountWithdrawnBN.iadd(outputAmountBN);

              inputCandidates[i].rawFundBalanceBN.isub(inputAmountBN);
              if (inputCandidates[i].rawFundBalanceBN.isZero()) {
                inputCandidates.splice(i, 1);
                i--;
              }

              // Stop if we have filled the withdrawal
              if (amountWithdrawnBN.gte(amount)) break;
            }
          }

          // Use 0x if necessary
          if (amountWithdrawnBN.lt(amount)) {
            // Get orders from 0x swap API for each input currency candidate
            for (var i = 0; i < inputCandidates.length; i++) {
              try {
                var [
                  orders,
                  inputFilledAmountBN,
                  protocolFee,
                  takerAssetFilledAmountBN,
                  makerAssetFilledAmountBN,
                  gasPrice,
                ] = await get0xSwapOrders(
                  self.internalTokens[inputCandidates[i].currencyCode].address,
                  currencyCode === "ETH"
                    ? "WETH"
                    : allTokens[currencyCode].address,
                  inputCandidates[i].rawFundBalanceBN,
                  amount.sub(amountWithdrawnBN)
                );
              } catch (err) {
                if (err === "Insufficient liquidity") {
                  inputCandidates.splice(i, 1);
                  i--;
                  continue;
                }

                throw new Error("Failed to get swap orders from 0x API: " + err);
              }

              inputCandidates[i].inputFillAmountBN = inputFilledAmountBN;
              inputCandidates[i].protocolFee = protocolFee;
              inputCandidates[i].takerAssetFillAmountBN = takerAssetFilledAmountBN;
              inputCandidates[i].makerAssetFillAmountBN = makerAssetFilledAmountBN;
              inputCandidates[i].takerAssetFillAmountUsdBN = takerAssetFilledAmountBN
                .mul(
                  Web3.utils.toBN(allBalances["4"][
                    self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                  ])
                )
                .div(
                  Web3.utils
                    .toBN(10)
                    .pow(
                      Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                    )
                );
            }

            // Sort candidates from highest to lowest output per USD burned
            inputCandidates.sort((a, b) =>
              b.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(b.takerAssetFillAmountUsdBN).gt(a.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(a.takerAssetFillAmountUsdBN)) ? 1 : -1
            );

            // Loop through input currency candidates until we fill the withdrawal
            for (var i = 0; i < inputCandidates.length; i++) {
              // Is this order enough to cover the rest of the withdrawal?
              if (
                inputCandidates[i].makerAssetFillAmountBN.gte(
                  amount.sub(amountWithdrawnBN)
                )
              ) {
                // If order is enough to cover the rest of the withdrawal, cover it and stop looping through input candidates
                var thisOutputAmountBN = amount.sub(amountWithdrawnBN);
                var thisInputAmountBN = inputCandidates[i].inputFillAmountBN
                  .mul(thisOutputAmountBN)
                  .div(inputCandidates[i].makerAssetFillAmountBN);

                var tries = 0;
                while (
                  inputCandidates[i].makerAssetFillAmountBN
                    .mul(thisInputAmountBN)
                    .div(inputCandidates[i].inputFillAmountBN)
                    .lt(thisOutputAmountBN)
                ) {
                  if (tries >= 1000)
                    throw new Error("Failed to get increment order input amount to achieve desired output amount.");
                  thisInputAmountBN.iadd(Web3.utils.toBN(1)); // Make sure we have enough input fill amount to achieve this maker asset fill amount
                  tries++;
                }

                amountInputtedUsdBN.iadd(
                  thisInputAmountBN
                    .mul(
                      Web3.utils.toBN(allBalances["4"][
                        self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                      ])
                    )
                    .div(
                      Web3.utils
                        .toBN(10)
                        .pow(
                          Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                        )
                    )
                );
                amountWithdrawnBN.iadd(thisOutputAmountBN);
                totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));

                break;
              } else {
                // Otherwise, add the whole order and keep looping through input candidates
                amountInputtedUsdBN.iadd(
                  inputCandidates[i].inputFillAmountBN
                    .mul(
                      Web3.utils.toBN(allBalances["4"][
                        self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                      ])
                    )
                    .div(
                      Web3.utils
                        .toBN(10)
                        .pow(
                          Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                        )
                    )
                );
                amountWithdrawnBN.iadd(inputCandidates[i].makerAssetFillAmountBN);
                totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));
              }

              // Stop if we have filled the withdrawal
              if (amountWithdrawnBN.gte(amount)) break;
            }

            // Make sure input amount is completely filled
            if (amountWithdrawnBN.lt(amount))
              throw new Error(
                "Unable to find enough liquidity to exchange withdrawn tokens to " +
                currencyCode +
                "."
              );
          }

          // Return amountInputtedUsdBN
          return [amountInputtedUsdBN, totalProtocolFeeBN];
        }
      },
      withdraw: async function (currencyCode, amount, maxUsdAmount, options) {
        if (!options || !options.from)
          throw new Error("Options parameter not set or from address not set.");
        var allTokens = await self.getAllTokens();
        if (currencyCode !== "ETH" && !allTokens[currencyCode])
          throw new Error("Invalid currency code!");
        if (!amount || amount.lte(Web3.utils.toBN(0)))
          throw new Error("Withdrawal amount must be greater than 0!");

        // Check balances to find withdrawal source
        var allBalances = await self.cache.getOrUpdate(
          "allBalances",
          self.contracts.RariFundProxy.methods.getRawFundBalancesAndPrices()
            .call
        );

        // See how much we can withdraw directly if token is supported by the fund
        var i = allBalances["0"].indexOf(currencyCode);
        var tokenRawFundBalanceBN = Web3.utils.toBN(0);

        if (i >= 0) {
          tokenRawFundBalanceBN = Web3.utils.toBN(allBalances["1"][i]);
          for (var j = 0; j < allBalances["3"][i].length; j++)
            tokenRawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));
        }

        if (tokenRawFundBalanceBN.gte(amount)) {
          // Check maxUsdAmount
          var amountUsdBN = amount
            .mul(
              Web3.utils.toBN(allBalances["4"][
                self.allocations.CURRENCIES.indexOf(currencyCode)
              ])
            )
            .div(
              Web3.utils
                .toBN(10)
                .pow(
                  Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                )
            );
          if (typeof maxUsdAmount !== undefined && maxUsdAmount !== null && amountUsdBN.gt(maxUsdAmount)) return [amountUsdBN];

          // If we can withdraw everything directly, do so
          try {
            var receipt = await self.contracts.RariFundManager.methods
              .withdraw(currencyCode, amount)
              .send(options);
          } catch (err) {
            throw new Error(
              "RariFundManager.withdraw failed: " +
              (err.message ? err.message : err)
            );
          }

          self.cache.clear("allBalances");
          return [amountUsdBN, null, receipt];
        } else {
          // Otherwise, exchange as few currencies as possible (ideally those with the lowest balances)
          var inputCurrencyCodes = [];
          var inputAmountBNs = [];
          var allOrders = [];
          var allSignatures = [];
          var makerAssetFillAmountBNs = [];
          var protocolFeeBNs = [];

          var amountInputtedUsdBN = Web3.utils.toBN(0);
          var amountWithdrawnBN = Web3.utils.toBN(0);
          var totalProtocolFeeBN = Web3.utils.toBN(0);

          // Withdraw as much as we can of the output token first
          if (tokenRawFundBalanceBN.gt(Web3.utils.toBN(0))) {
            inputCurrencyCodes.push(currencyCode);
            inputAmountBNs.push(tokenRawFundBalanceBN);
            allOrders.push([]);
            allSignatures.push([]);
            makerAssetFillAmountBNs.push(0);
            protocolFeeBNs.push(0);

            amountInputtedUsdBN.iadd(
              tokenRawFundBalanceBN
                .mul(
                  Web3.utils.toBN(allBalances["4"][
                    self.allocations.CURRENCIES.indexOf(currencyCode)
                  ])
                )
                .div(
                  Web3.utils
                    .toBN(10)
                    .pow(
                      Web3.utils.toBN(self.internalTokens[currencyCode].decimals)
                    )
                )
            );
            amountWithdrawnBN.iadd(tokenRawFundBalanceBN);
          }

          // Get input candidates
          var inputCandidates = [];

          for (var i = 0; i < allBalances["0"].length; i++)
            if (allBalances["0"][i] !== currencyCode) {
              var rawFundBalanceBN = Web3.utils.toBN(0);
              for (var j = 0; j < allBalances["3"][i].length; j++)
                rawFundBalanceBN.iadd(Web3.utils.toBN(allBalances["3"][i][j]));
              if (rawFundBalanceBN.gt(Web3.utils.toBN(0)))
                inputCandidates.push({
                  currencyCode: allBalances["0"][i],
                  rawFundBalanceBN,
                });
            }

          // TODO: Sort candidates from lowest to highest rawFundBalanceUsdBN (or highest to lowest?)
          /* inputCandidates.sort((a, b) =>
            a.rawFundBalanceUsdBN.gt(b.rawFundBalanceUsdBN) ? 1 : -1
          ); */

          // mStable
          if (
            ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(currencyCode) >= 0
          ) {
            var mStableSwapFeeBN = null;

            for (var i = 0; i < inputCandidates.length; i++) {
              if (
                ["DAI", "USDC", "USDT", "TUSD", "mUSD"].indexOf(
                  inputCandidates[i].currencyCode
                ) < 0
              )
                continue;

              // Get swap fee and calculate input amount needed to fill output amount
              if (mStableSwapFeeBN === null)
                mStableSwapFeeBN = await self.pools[
                  "mStable"
                ].getMUsdSwapFeeBN();
              var inputAmountBN = amount
                .sub(amountWithdrawnBN)
                .mul(Web3.utils.toBN(1e18))
                .div(Web3.utils.toBN(1e18).sub(mStableSwapFeeBN))
                .mul(
                  Web3.utils.toBN(
                    10 **
                      self.internalTokens[inputCandidates[i].currencyCode]
                        .decimals
                  )
                )
                .div(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals));
              var outputAmountBeforeFeesBN = inputAmountBN
                .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                .div(
                  Web3.utils.toBN(
                    10 **
                      self.internalTokens[inputCandidates[i].currencyCode]
                        .decimals
                  )
                );
              var outputAmountBN = outputAmountBeforeFeesBN.sub(
                outputAmountBeforeFeesBN
                  .mul(mStableSwapFeeBN)
                  .div(Web3.utils.toBN(1e18))
              );

              var tries = 0;
              while (outputAmountBN.lt(amount.sub(amountWithdrawnBN))) {
                if (tries >= 1000)
                  throw new Error("Failed to get increment order input amount to achieve desired output amount.");
                inputAmountBN.iadd(Web3.utils.toBN(1)); // Make sure we have enough input amount to receive amount.sub(amountWithdrawnBN)
                outputAmountBeforeFeesBN = inputAmountBN
                  .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                  .div(
                    Web3.utils.toBN(
                      10 **
                        self.internalTokens[inputCandidates[i].currencyCode]
                          .decimals
                    )
                  );
                outputAmountBN = outputAmountBeforeFeesBN.sub(
                  outputAmountBeforeFeesBN
                    .mul(mStableSwapFeeBN)
                    .div(Web3.utils.toBN(1e18))
                );
                tries++;
              }

              if (inputAmountBN.gt(inputCandidates[i].rawFundBalanceBN)) {
                inputAmountBN = inputCandidates[i].rawFundBalanceBN;
                outputAmountBeforeFeesBN = inputAmountBN
                  .mul(Web3.utils.toBN(10 ** allTokens[currencyCode].decimals))
                  .div(
                    Web3.utils.toBN(
                      10 **
                        self.internalTokens[inputCandidates[i].currencyCode]
                          .decimals
                    )
                  );
                outputAmountBN = outputAmountBeforeFeesBN.sub(
                  outputAmountBeforeFeesBN
                    .mul(mStableSwapFeeBN)
                    .div(Web3.utils.toBN(1e18))
                );
              }

              // Check max swap/redeem validity
              if (inputCandidates[i].currencyCode === "mUSD") {
                try {
                  var redeemValidity = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                    .getRedeemValidity(
                      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                      inputAmountBN,
                      self.internalTokens[currencyCode].address
                    )
                    .call();
                } catch (err) {
                  console.error("Failed to check mUSD redeem validity:", err);
                  continue;
                }
  
                if (!redeemValidity || !redeemValidity["0"]) continue;
                if (!outputAmountBN.eq(Web3.utils.toBN(redeemValidity["2"]))) throw new Error("Predicted mStable output amount and output amount returned by getRedeemValidity not equal.");
              } else {
                try {
                  var maxSwap = await self.pools["mStable"].externalContracts.MassetValidationHelper.methods
                    .getMaxSwap(
                      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
                      self.internalTokens[inputCandidates[i].currencyCode].address,
                      self.internalTokens[currencyCode].address
                    )
                    .call();
                } catch (err) {
                  console.error("Failed to check mUSD max swap:", err);
                  continue;
                }
  
                if (!maxSwap || !maxSwap["0"] || Web3.utils.toBN(maxSwap["2"]).lt(inputAmountBN)) continue;
              }

              inputCurrencyCodes.push(inputCandidates[i].currencyCode);
              inputAmountBNs.push(inputAmountBN);
              allOrders.push([]);
              allSignatures.push([]);
              makerAssetFillAmountBNs.push(0);
              protocolFeeBNs.push(0);

              amountInputtedUsdBN.iadd(
                inputAmountBN
                  .mul(
                    Web3.utils.toBN(allBalances["4"][
                      self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                    ])
                  )
                  .div(
                    Web3.utils
                      .toBN(10)
                      .pow(
                        Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                      )
                  )
              );
              amountWithdrawnBN.iadd(outputAmountBN);

              inputCandidates[i].rawFundBalanceBN.isub(inputAmountBN);
              if (inputCandidates[i].rawFundBalanceBN.isZero()) {
                inputCandidates.splice(i, 1);
                i--;
              }

              // Stop if we have filled the withdrawal
              if (amountWithdrawnBN.gte(amount)) break;
            }
          }

          // Use 0x if necessary
          if (amountWithdrawnBN.lt(amount)) {
            // Get orders from 0x swap API for each input currency candidate
            for (var i = 0; i < inputCandidates.length; i++) {
              try {
                var [
                  orders,
                  inputFilledAmountBN,
                  protocolFee,
                  takerAssetFilledAmountBN,
                  makerAssetFilledAmountBN,
                  gasPrice,
                ] = await get0xSwapOrders(
                  self.internalTokens[inputCandidates[i].currencyCode].address,
                  currencyCode === "ETH"
                    ? "WETH"
                    : allTokens[currencyCode].address,
                  inputCandidates[i].rawFundBalanceBN,
                  amount.sub(amountWithdrawnBN)
                );
              } catch (err) {
                if (err === "Insufficient liquidity") {
                  inputCandidates.splice(i, 1);
                  i--;
                  continue;
                }

                throw new Error("Failed to get swap orders from 0x API: " + err);
              }

              // Build array of orders and signatures
              var signatures = [];

              for (var j = 0; j < orders.length; j++) {
                signatures[j] = orders[j].signature;

                orders[j] = {
                  makerAddress: orders[j].makerAddress,
                  takerAddress: orders[j].takerAddress,
                  feeRecipientAddress: orders[j].feeRecipientAddress,
                  senderAddress: orders[j].senderAddress,
                  makerAssetAmount: orders[j].makerAssetAmount,
                  takerAssetAmount: orders[j].takerAssetAmount,
                  makerFee: orders[j].makerFee,
                  takerFee: orders[j].takerFee,
                  expirationTimeSeconds: orders[j].expirationTimeSeconds,
                  salt: orders[j].salt,
                  makerAssetData: orders[j].makerAssetData,
                  takerAssetData: orders[j].takerAssetData,
                  makerFeeAssetData: orders[j].makerFeeAssetData,
                  takerFeeAssetData: orders[j].takerFeeAssetData,
                };
              }

              inputCandidates[i].orders = orders;
              inputCandidates[i].signatures = signatures;
              inputCandidates[i].inputFillAmountBN = inputFilledAmountBN;
              inputCandidates[i].protocolFee = protocolFee;
              inputCandidates[
                i
              ].takerAssetFillAmountBN = takerAssetFilledAmountBN;
              inputCandidates[
                i
              ].makerAssetFillAmountBN = makerAssetFilledAmountBN;
              inputCandidates[i].takerAssetFillAmountUsdBN = takerAssetFilledAmountBN
                .mul(
                  Web3.utils.toBN(allBalances["4"][
                    self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                  ])
                )
                .div(
                  Web3.utils
                    .toBN(10)
                    .pow(
                      Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                    )
                );
            }

            // Sort candidates from highest to lowest output per USD burned
            inputCandidates.sort((a, b) =>
              b.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(b.takerAssetFillAmountUsdBN).gt(a.makerAssetFillAmountBN.mul(Web3.utils.toBN(1e18)).div(a.takerAssetFillAmountUsdBN)) ? 1 : -1
            );

            // Loop through input currency candidates until we fill the withdrawal
            for (var i = 0; i < inputCandidates.length; i++) {
              // Is this order enough to cover the rest of the withdrawal?
              if (
                inputCandidates[i].makerAssetFillAmountBN.gte(
                  amount.sub(amountWithdrawnBN)
                )
              ) {
                // If order is enough to cover the rest of the withdrawal, cover it and stop looping through input candidates
                var thisOutputAmountBN = amount.sub(amountWithdrawnBN);
                var thisInputAmountBN = inputCandidates[i].inputFillAmountBN
                  .mul(thisOutputAmountBN)
                  .div(inputCandidates[i].makerAssetFillAmountBN);

                var tries = 0;
                while (
                  inputCandidates[i].makerAssetFillAmountBN
                    .mul(thisInputAmountBN)
                    .div(inputCandidates[i].inputFillAmountBN)
                    .lt(thisOutputAmountBN)
                ) {
                  if (tries >= 1000)
                    throw new Error("Failed to get increment order input amount to achieve desired output amount.");
                  thisInputAmountBN.iadd(Web3.utils.toBN(1)); // Make sure we have enough input fill amount to achieve this maker asset fill amount
                  tries++;
                }

                inputCurrencyCodes.push(inputCandidates[i].currencyCode);
                inputAmountBNs.push(thisInputAmountBN);
                allOrders.push(inputCandidates[i].orders);
                allSignatures.push(inputCandidates[i].signatures);
                makerAssetFillAmountBNs.push(thisOutputAmountBN);
                protocolFeeBNs.push(
                  Web3.utils.toBN(inputCandidates[i].protocolFee)
                );

                amountInputtedUsdBN.iadd(
                  thisInputAmountBN
                    .mul(
                      Web3.utils.toBN(allBalances["4"][
                        self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                      ])
                    )
                    .div(
                      Web3.utils
                        .toBN(10)
                        .pow(
                          Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                        )
                    )
                );
                amountWithdrawnBN.iadd(thisOutputAmountBN);
                totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));

                break;
              } else {
                // Otherwise, add the whole order and keep looping through input candidates
                inputCurrencyCodes.push(inputCandidates[i].currencyCode);
                inputAmountBNs.push(inputCandidates[i].inputFillAmountBN);
                allOrders.push(inputCandidates[i].orders);
                allSignatures.push(inputCandidates[i].signatures);
                makerAssetFillAmountBNs.push(
                  inputCandidates[i].makerAssetFillAmountBN
                );
                protocolFeeBNs.push(
                  Web3.utils.toBN(inputCandidates[i].protocolFee)
                );

                amountInputtedUsdBN.iadd(
                  inputCandidates[i].inputFillAmountBN
                    .mul(
                      Web3.utils.toBN(allBalances["4"][
                        self.allocations.CURRENCIES.indexOf(inputCandidates[i].currencyCode)
                      ])
                    )
                    .div(
                      Web3.utils
                        .toBN(10)
                        .pow(
                          Web3.utils.toBN(self.internalTokens[inputCandidates[i].currencyCode].decimals)
                        )
                    )
                );
                amountWithdrawnBN.iadd(inputCandidates[i].makerAssetFillAmountBN);
                totalProtocolFeeBN.iadd(Web3.utils.toBN(inputCandidates[i].protocolFee));
              }

              // Stop if we have filled the withdrawal
              if (amountWithdrawnBN.gte(amount)) break;
            }

            // Make sure input amount is completely filled
            if (amountWithdrawnBN.lt(amount))
              throw new Error(
                "Unable to find enough liquidity to exchange withdrawn tokens to " +
                currencyCode +
                "."
              );
          }

          // Check maxUsdAmount
          if (typeof maxUsdAmount !== undefined && maxUsdAmount !== null && amountInputtedUsdBN.gt(maxUsdAmount))
            return [amountInputtedUsdBN];

          // Withdraw and exchange tokens via RariFundProxy
          try {
            var inputAmountStrings = [];
            for (var i = 0; i < inputAmountBNs.length; i++)
              inputAmountStrings[i] = inputAmountBNs[i].toString();
            var makerAssetFillAmountStrings = [];
            for (var i = 0; i < makerAssetFillAmountBNs.length; i++)
              makerAssetFillAmountStrings[i] = makerAssetFillAmountBNs[
                i
              ].toString();
            var protocolFeeStrings = [];
            for (var i = 0; i < protocolFeeBNs.length; i++)
              protocolFeeStrings[i] = protocolFeeBNs[i].toString();
            var receipt = await self.contracts.RariFundProxy.methods
              .withdrawAndExchange(
                inputCurrencyCodes,
                inputAmountStrings,
                currencyCode === "ETH"
                  ? "0x0000000000000000000000000000000000000000"
                  : allTokens[currencyCode].address,
                allOrders,
                allSignatures,
                makerAssetFillAmountStrings,
                protocolFeeStrings
              )
              .send({
                from: options.from,
                value: totalProtocolFeeBN,
                gasPrice: gasPrice,
                nonce: await self.web3.eth.getTransactionCount(options.from),
              });
          } catch (err) {
            throw new Error(
              "RariFundProxy.withdrawAndExchange failed: " +
              (err.message ? err.message : err)
            );
          }

          self.cache.clear("allBalances");
          return [amountInputtedUsdBN, totalProtocolFeeBN, receipt];
        }
      },
    };

    this.rspt = this.poolToken = {
      getExchangeRate: async function (blockNumber) {
        if (!blockNumber) blockNumber = "latest";
        return Web3.utils
          .toBN(
            await self.contracts.RariFundManager.methods
              .getFundBalance()
              .call(blockNumber)
          )
          .mul(Web3.utils.toBN(1e18))
          .div(
            Web3.utils.toBN(
              await self.contracts.RariFundToken.methods
                .totalSupply()
                .call(blockNumber)
            )
          );
      },
      balanceOf: async function (account) {
        return Web3.utils.toBN(
          await self.contracts.RariFundToken.methods.balanceOf(account).call()
        );
      },
      transfer: async function (recipient, amount, options) {
        return await self.contracts.RariFundToken.methods
          .transfer(recipient, amount)
          .send(options);
      },
    };

    this.fees = {
      getInterestFeeRate: async function () {
        return Web3.utils.toBN(
          await self.contracts.RariFundManager.methods
            .getInterestFeeRate()
            .call()
        );
      },
    };

    this.history = {
      getApyHistory: async function (
        fromTimestamp,
        toTimestamp,
        intervalSeconds = 86400
      ) {
        if (fromTimestamp === undefined || fromTimestamp === "latest")
          fromTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (toTimestamp === undefined || toTimestamp === "latest")
          toTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (!intervalSeconds) intervalSeconds = 86400;

        try {
          return (
            await axios.get(self.API_BASE_URL + "apys", {
              params: { fromTimestamp, toTimestamp, intervalSeconds },
            })
          ).data;
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
      getTotalSupplyHistory: async function (
        fromTimestamp = "latest",
        toTimestamp = "latest",
        intervalSeconds = 86400
      ) {
        if (fromTimestamp === undefined || fromTimestamp === "latest")
          fromTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (toTimestamp === undefined || toTimestamp === "latest")
          toTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (!intervalSeconds) intervalSeconds = 86400;

        try {
          return (
            await axios.get(self.API_BASE_URL + "balances", {
              params: { fromTimestamp, toTimestamp, intervalSeconds },
            })
          ).data;
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
      getBalanceHistoryOf: async function (
        account,
        fromTimestamp,
        toTimestamp,
        intervalSeconds = 86400
      ) {
        if (!account) throw new Error("No account specified");
        if (fromTimestamp === undefined || fromTimestamp === "latest")
          fromTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (toTimestamp === undefined || toTimestamp === "latest")
          toTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (!intervalSeconds) intervalSeconds = 86400;

        try {
          return (
            await axios.get(self.API_BASE_URL + "balances/" + account, {
              params: { fromTimestamp, toTimestamp, intervalSeconds },
            })
          ).data;
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
      getPoolTokenExchangeRateHistory: async function (
        fromTimestamp,
        toTimestamp,
        intervalSeconds = 86400
      ) {
        if (fromTimestamp === undefined || fromTimestamp === "latest")
          fromTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (toTimestamp === undefined || toTimestamp === "latest")
          toTimestamp = Math.trunc(new Date().getTime() / 1000);
        if (!intervalSeconds) intervalSeconds = 86400;

        try {
          return (
            await axios.get(
              self.API_BASE_URL +
                self.POOL_TOKEN_SYMBOL.toLowerCase() +
                "/rates",
              {
                params: { fromTimestamp, toTimestamp, intervalSeconds },
              }
            )
          ).data;
        } catch (error) {
          throw new Error("Error in Rari API: " + error);
        }
      },
      getRsptExchangeRateHistory: this.getPoolTokenExchangeRateHistory,
      getPredictedDailyRawFundApyHistoryLastYear: async function () {
        // TODO: Get results from app.rari.capital
      },
      getPredictedDailyFundApyHistoryLastYear: async function () {
        var history = await self.history.getDailyRawFundApyHistoryLastYear();
        for (const timestamp of Object.keys(history))
          history[timestamp] -=
            (history[timestamp] *
              parseFloat(
                await self.contracts.RariFundManager.methods
                  .getInterestFeeRate()
                  .call()
              )) /
            1e18;
      },
      getPredictedDailyRawFundReturnHistoryLastYear: async function (
        principal
      ) {
        var apyHistory = await self.history.getPredictedDailyRawFundApyHistoryLastYear();
        var returns = {};
        for (const timestamp of Object.keys(apyHistory))
          returns[timestamp] = principal *=
            1 + apyHistory[timestamp] / 100 / 365;
        return returns;
      },
      getPredictedDailyFundReturnHistoryLastYear: async function (principal) {
        var apyHistory = await self.history.getPredictedDailyFundApyHistoryLastYear();
        var returns = {};
        for (const timestamp of Object.keys(apyHistory))
          returns[timestamp] = principal *=
            1 + apyHistory[timestamp] / 100 / 365;
        return returns;
      },
      getPoolAllocationHistory: async function (fromBlock, toBlock, filter) {
        return toBlock >= 10909705
          ? await self.contracts.RariFundController.getPastEvents(
              "PoolAllocation",
              { fromBlock: Math.max(fromBlock, 10909705), toBlock, filter }
            )
          : [];
      },
      getCurrencyExchangeHistory: async function (fromBlock, toBlock, filter) {
        return toBlock >= 10926182
          ? await self.contracts.RariFundController.getPastEvents(
              "CurrencyTrade",
              { fromBlock: Math.max(fromBlock, 10926182), toBlock, filter }
            )
          : [];
      },
      getDepositHistory: async function (fromBlock, toBlock, filter) {
        var events = [];
        if (toBlock >= 10365607 && fromBlock <= 10457338)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundManager.getPastEvents("Deposit", {
            fromBlock: Math.max(fromBlock, 10365607),
            toBlock: Math.min(toBlock, 10457338),
            filter,
          });
        if (toBlock >= 10458405 && fromBlock <= 10889999)
          events = events.concat(
            await self.legacyContracts["v1.1.0"].RariFundManager.getPastEvents(
              "Deposit",
              {
                fromBlock: Math.max(fromBlock, 10458405),
                toBlock: Math.min(toBlock, 10889999),
                filter,
              }
            )
          );
        if (toBlock >= 10922173)
          events = events.concat(
            await self.contracts.RariFundManager.getPastEvents("Deposit", {
              fromBlock: Math.max(fromBlock, 10922173),
              toBlock,
              filter,
            })
          );
        return events;
      },
      getWithdrawalHistory: async function (fromBlock, toBlock, filter) {
        var events = [];
        if (toBlock >= 10365668 && fromBlock <= 10365914)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundManager.getPastEvents("Withdrawal", {
            fromBlock: Math.max(fromBlock, 10365668),
            toBlock: Math.min(toBlock, 10365914),
            filter,
          });
        if (toBlock >= 10468624 && fromBlock <= 10890985)
          events = events.concat(
            await self.legacyContracts["v1.1.0"].RariFundManager.getPastEvents(
              "Withdrawal",
              {
                fromBlock: Math.max(fromBlock, 10468624),
                toBlock: Math.min(toBlock, 10890985),
                filter,
              }
            )
          );
        if (toBlock >= 10932051)
          events = events.concat(
            await self.contracts.RariFundManager.getPastEvents("Withdrawal", {
              fromBlock: Math.max(fromBlock, 10932051),
              toBlock,
              filter,
            })
          );
        return events;
      },
      getPreDepositExchangeHistory: async function (
        fromBlock,
        toBlock,
        filter
      ) {
        var events = [];
        if (toBlock >= 10365738 && fromBlock <= 10395897)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundProxy.getPastEvents("PreDepositExchange", {
            fromBlock: Math.max(fromBlock, 10365738),
            toBlock: Math.min(toBlock, 10395897),
            filter,
          });
        if (toBlock >= 10458408 && fromBlock <= 10489095)
          events = events.concat(
            await self.legacyContracts["v1.1.0"].RariFundProxy.getPastEvents(
              "PreDepositExchange",
              {
                fromBlock: Math.max(fromBlock, 10458408),
                toBlock: Math.min(toBlock, 10489095),
                filter,
              }
            )
          );
        if (toBlock >= 10499014 && fromBlock <= 10833530)
          events = events.concat(
            await self.legacyContracts["v1.2.0"].RariFundProxy.getPastEvents(
              "PreDepositExchange",
              {
                fromBlock: Math.max(fromBlock, 10499014),
                toBlock: Math.min(toBlock, 10833530),
                filter,
              }
            )
          );
        if (toBlock >= 10967766)
          events = events.concat(
            await self.contracts.RariFundProxy.getPastEvents(
              "PreDepositExchange",
              { fromBlock: Math.max(fromBlock, 10967766), toBlock, filter }
            )
          );
        return events;
      },
      getPostWithdrawalExchangeHistory: async function (
        fromBlock,
        toBlock,
        filter
      ) {
        var events = [];
        if (toBlock >= 10365914 && fromBlock <= 10365914)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundToken.getPastEvents("PostWithdrawalExchange", {
            fromBlock: Math.max(fromBlock, 10365914),
            toBlock: Math.min(toBlock, 10365914),
            filter,
          });
        if (toBlock >= 10545467 && fromBlock <= 10545467)
          events = events.concat(
            await self.legacyContracts["v1.2.0"].RariFundProxy.getPastEvents(
              "PostWithdrawalExchange",
              {
                fromBlock: Math.max(fromBlock, 10545467),
                toBlock: Math.min(toBlock, 10545467),
                filter,
              }
            )
          );
        if (toBlock >= 10932051 && fromBlock <= 10932051)
          events = events.concat(
            await self.legacyContracts["v2.0.0"].RariFundProxy.getPastEvents(
              "PostWithdrawalExchange",
              {
                fromBlock: Math.max(fromBlock, 10932051),
                toBlock: Math.min(toBlock, 10932051),
                filter,
              }
            )
          );
        if (toBlock >= 11141845)
          events = events.concat(
            self.contracts.RariFundProxy.getPastEvents(
              "PostWithdrawalExchange",
              {
                fromBlock: Math.max(fromBlock, 11141845),
                toBlock,
                filter,
              }
            )
          );
        return events;
      },
      getPoolTokenTransferHistory: async function (fromBlock, toBlock, filter) {
        var events = [];
        if (toBlock >= 10365607 && fromBlock <= 10890985)
          events = await self.legacyContracts[
            "v1.0.0"
          ].RariFundToken.getPastEvents("Transfer", {
            fromBlock: Math.max(fromBlock, 10365607),
            toBlock: Math.min(toBlock, 10890985),
            filter,
          });
        if (toBlock >= 10909582)
          events = events.concat(
            await self.contracts.RariFundToken.getPastEvents("Transfer", {
              fromBlock: Math.max(fromBlock, 10909582),
              toBlock,
              filter,
            })
          );
        return events;
      },
      getRsptTransferHistory: this.getPoolTokenTransferHistory,
    };
  }
}

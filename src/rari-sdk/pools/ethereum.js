/* eslint-disable */
import Web3 from "web3";

import StablePool from "./stable.js";
import { get0xSwapOrders } from "../0x.js";

const contractAddresses = {
  RariFundController: "0xD9F223A36C2e398B0886F945a7e556B41EF91A3C",
  RariFundManager: "0xD6e194aF3d9674b62D1b30Ec676030C23961275e",
  RariFundToken: "0xCda4770d65B4211364Cb870aD6bE19E7Ef1D65f4",
  RariFundProxy: "0xa3cc9e4B9784c80a05B3Af215C32ff223C3ebE5c",
};

var abis = {};
for (const contractName of Object.keys(contractAddresses))
  abis[contractName] = require(__dirname +
    "/ethereum/abi/" +
    contractName +
    ".json");

export default class EthereumPool extends StablePool {
  API_BASE_URL = "https://api.rari.capital/pools/ethereum/";
  POOL_TOKEN_SYMBOL = "REPT";

  static CONTRACT_ADDRESSES = contractAddresses;
  static CONTRACT_ABIS = abis;
  static LEGACY_CONTRACT_ADDRESSES = undefined;
  static LEGACY_CONTRACT_ABIS = undefined;
  static EXTERNAL_CONTRACT_ADDRESSES = undefined;
  static EXTERNAL_CONTRACT_ABIS = undefined;

  constructor(web3, getAllTokens) {
    super(web3, getAllTokens);

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new this.web3.eth.Contract(
        abis[contractName],
        contractAddresses[contractName]
      );
    // this.gsnContracts = { RariFundProxy: new web3Gsn.eth.Contract(abis.RariFundProxy, contractAddresses.RariFundProxy) };
    delete this.legacyContracts;
    delete this.externalContracts;

    delete this.internalTokens;

    this.rept = this.rspt;
    delete this.rspt;

    delete this.allocations.CURRENCIES;
    this.allocations.POOLS = ["dYdX", "Compound", "KeeperDAO", "Aave"];
    delete this.allocations.POOLS_BY_CURRENCY;
    delete this.allocations.getAllocationsByCurrency;
    delete this.allocations.getRawAllocations;
    delete this.allocations.getCurrencyUsdPrices;

    this.allocations.getRawPoolAllocations = async function () {
      var allocationsByPool = {
        _cash: Web3.utils.toBN(0),
        dYdX: Web3.utils.toBN(0),
        Compound: Web3.utils.toBN(0),
        KeeperDAO: Web3.utils.toBN(0),
        Aave: Web3.utils.toBN(0),
      };
      var allBalances = await this.cache.getOrUpdate(
        "allBalances",
        this.contracts.RariFundController.methods.getRawFundBalances().call
      );

      allocationsByPool._cash = Web3.utils.toBN(allBalances["0"]);
      var pools = allBalances["1"];
      var poolBalances = allBalances["2"];

      for (var i = 0; i < pools.length; i++) {
        var pool = pools[i];
        var poolBalanceBN = Web3.utils.toBN(poolBalances[i]);
        allocationsByPool[this.allocations.POOLS[pool]] = poolBalanceBN;
      }

      return allocationsByPool;
    };

    delete this.deposits.getDirectDepositCurrencies;

    this.deposits.validateDeposit = async function (
      currencyCode,
      amount,
      sender
    ) {
      // Input validation
      if (!sender) throw "Sender parameter not set.";
      var allTokens = await this.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode])
        throw "Invalid currency code!";
      if (!amount || amount.lte(Web3.utils.toBN(0)))
        throw "Deposit amount must be greater than 0!";
      var accountBalanceBN = Web3.utils.toBN(
        await (currencyCode == "ETH"
          ? this.web3.eth.getBalance(sender)
          : allTokens[currencyCode].contract.methods.balanceOf(sender))
      );
      if (amount.gt(accountBalanceBN))
        throw "Not enough balance in your account to make a deposit of this amount.";

      // Check if currency is ETH
      if (currencyCode === "ETH") {
        // Return amountUsdBN
        return [amount];
      } else {
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
            allTokens[currencyCode].address,
            "WETH",
            amount
          );
        } catch (err) {
          throw "Failed to get swap orders from 0x API: " + err;
        }

        // Make sure input amount is completely filled
        if (inputFilledAmountBN.lt(amount))
          throw (
            "Unable to find enough liquidity to exchange " +
            currencyCode +
            " to ETH before depositing."
          );

        // Make sure we have enough ETH for the protocol fee
        var ethBalanceBN = await web3.eth.getBalance(sender);
        if (Web3.utils.toBN(protocolFee).gt(ethBalanceBN))
          throw "ETH balance too low to cover 0x exchange protocol fee.";

        // Return makerAssetFilledAmountBN and protocolFee
        return [makerAssetFilledAmountBN, Web3.utils.toBN(protocolFee)];
      }
    };

    this.deposits.deposit = async function (
      currencyCode,
      amount,
      minEthAmount,
      options
    ) {
      // Input validation
      if (!options || !options.from)
        throw "Options parameter not set or from address not set.";
      var allTokens = await this.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode])
        throw "Invalid currency code!";
      if (!amount || amount.lte(Web3.utils.toBN(0)))
        throw "Deposit amount must be greater than 0!";
      var accountBalanceBN = Web3.utils.toBN(
        await (currencyCode == "ETH"
          ? this.web3.eth.getBalance(options.from)
          : allTokens[currencyCode].contract.methods.balanceOf(options.from))
      );
      if (amount.gt(accountBalanceBN))
        throw "Not enough balance in your account to make a deposit of this amount.";

      // Check if currency is ETH
      if (currencyCode === "ETH") {
        // Input validation
        if (options.value && options.value.toString() !== amount.toString())
          throw "Value set in options paramater but not equal to amount parameter.";

        // Check amountUsdBN against minUsdAmount
        if (amount.lt(minEthAmount)) return [amount];

        // Deposit tokens to RariFundManager
        try {
          options.value = amount;
          var receipt = await this.contracts.RariFundManager.methods
            .deposit()
            .send(options);
        } catch (err) {
          throw err.message ? err.message : err;
        }

        return [amount, null, null, receipt];
      } else {
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
            allTokens[currencyCode].address,
            "WETH",
            amount
          );
        } catch (err) {
          throw "Failed to get swap orders from 0x API: " + err;
        }

        // Make sure input amount is completely filled
        if (inputFilledAmountBN.lt(amount))
          throw (
            "Unable to find enough liquidity to exchange " +
            currencyCode +
            " before depositing."
          );

        // Make sure we have enough ETH for the protocol fee
        var ethBalanceBN = await web3.eth.getBalance(options.from);
        if (Web3.utils.toBN(protocolFee).gt(ethBalanceBN))
          throw "ETH balance too low to cover 0x exchange protocol fee.";

        // Check makerAssetFilledAmountUsdBN against minUsdAmount
        if (makerAssetFilledAmountBN.lt(minEthAmount))
          return [makerAssetFilledAmountBN];

        // Approve tokens to RariFundProxy
        try {
          var allowanceBN = Web3.utils.toBN(
            await allTokens[currencyCode].contract.methods
              .allowance(
                options.from,
                this.contracts.RariFundProxy.options.address
              )
              .call()
          );
          if (allowanceBN.lt(amount))
            var approvalReceipt = await allTokens[currencyCode].contract.methods
              .approve(this.contracts.RariFundProxy.options.address, amount)
              .send(options);
        } catch (err) {
          throw (
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
          var receipt = await this.contracts.RariFundProxy.methods
            .exchangeAndDeposit(
              allTokens[currencyCode].address,
              amount,
              orders,
              signatures,
              takerAssetFilledAmountBN
            )
            .send(
              Object.assign({ value: protocolFee, gasPrice: gasPrice }, options)
            );
        } catch (err) {
          throw (
            "RariFundProxy.exchangeAndDeposit failed: " +
            (err.message ? err.message : err)
          );
        }

        this.cache.clear("allBalances");
        return [
          makerAssetFilledAmountBN,
          Web3.utils.toBN(protocolFee),
          approvalReceipt,
          receipt,
        ];
      }
    };

    this.withdrawals.validateWithdrawal = async function (
      currencyCode,
      amount,
      sender
    ) {
      var allTokens = await this.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode])
        throw "Invalid currency code!";
      if (!amount || amount.lte(Web3.utils.toBN(0)))
        throw "Withdrawal amount must be greater than 0!";

      // Check if withdrawal currency is ETH
      if (currencyCode === "ETH") {
        // Return amount
        return [amount];
      } else {
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
            "WETH",
            allTokens[currencyCode].address,
            null,
            amount
          );
        } catch (err) {
          throw "Failed to get swap orders from 0x API: " + err;
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

        // Make sure input amount is completely filled
        if (makerAssetFilledAmountBN.lt(amount))
          throw (
            "Unable to find enough liquidity to exchange withdrawn ETH to " +
            currencyCode +
            "."
          );

        // Return inputFilledAmountBN
        return [inputFilledAmountBN, Web3.utils.toBN(protocolFee)];
      }
    };

    this.withdrawals.withdraw = async function (
      currencyCode,
      amount,
      maxEthAmount,
      options
    ) {
      var allTokens = await this.getAllTokens();
      if (currencyCode !== "ETH" && !allTokens[currencyCode])
        throw "Invalid currency code!";
      if (!amount || amount.lte(Web3.utils.toBN(0)))
        throw "Withdrawal amount must be greater than 0!";

      // Check if withdrawal currency is ETH
      if (currencyCode === "ETH") {
        // Check maxEthAmount
        if (amount.gt(maxEthAmount)) return [amount];

        // If we can withdraw everything directly, do so
        try {
          var receipt = await this.contracts.RariFundManager.methods
            .withdraw(amount)
            .send(options);
        } catch (err) {
          throw (
            "RariFundManager.withdraw failed: " +
            (err.message ? err.message : err)
          );
        }

        return [amount, null, receipt];
      } else {
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
            "WETH",
            allTokens[currencyCode].address,
            null,
            amount
          );
        } catch (err) {
          throw "Failed to get swap orders from 0x API: " + err;
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

        // Make sure input amount is completely filled
        if (makerAssetFilledAmountBN.lt(amount))
          throw (
            "Unable to find enough liquidity to exchange withdrawn tokens to " +
            currencyCode +
            "."
          );

        // Check maxEthAmount
        if (inputFilledAmountBN.gt(maxEthAmount)) return [inputFilledAmountBN];

        // Withdraw and exchange tokens via RariFundProxy
        try {
          var receipt = await this.contracts.RariFundProxy.methods
            .withdrawAndExchange(
              inputFilledAmountBN,
              allTokens[currencyCode].address,
              orders,
              signatures,
              makerAssetFilledAmountBN,
              protocolFee
            )
            .send({
              from: options.from,
              value: protocolFee,
              gasPrice: gasPrice,
              nonce: await web3.eth.getTransactionCount(options.from),
            });
        } catch (err) {
          throw (
            "RariFundProxy.withdrawAndExchange failed: " +
            (err.message ? err.message : err)
          );
        }

        return [inputFilledAmountBN, Web3.utils.toBN(protocolFee), receipt];
      }
    };

    delete this.history.getRsptExchangeRateHistory;
    this.history.getReptExchangeRateHistory = this.history.getPoolTokenExchangeRateHistory;

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
            "CompToEthTrade",
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
    this.history.getReptTransferHistory = this.history.getPoolTokenTransferHistory;
  }
}

/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import DydxSubpool from "./subpools/dydx.js";
import CompoundSubpool from "./subpools/compound.js";
import AaveSubpool from "./subpools/aave.js";
import MStableSubpool from "./subpools/mstable.js";
import YVaultSubpool from "./subpools/yvault.js";
import KeeperDAOSubpool from "./subpools/keeperdao.js";

import StablePool from "./pools/stable.js";
import YieldPool from "./pools/yield.js";
import EthereumPool from "./pools/ethereum.js";

import Governance from "./governance.js";

import Cache from "./cache.js";

var erc20Abi = require(__dirname + "/abi/ERC20.json");

export default class Rari {
  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider);
    this.cache = new Cache({ allTokens: 86400 });

    this.getEthUsdPriceBN = async function () {
      try {
        return Web3.utils.toBN(
          Math.trunc(
            (
              await axios.get(
                "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum"
              )
            ).data.ethereum.usd * 1e18
          )
        );
      } catch (error) {
        throw new Error("Error retrieving data from Coingecko API: " + error);
      }
    };

    /* const approveFunction = async ({ from, to, encodedFunctionCall, txFee, gasPrice, gas, nonce, relayerAddress, relayHubAddress }) => {
            try {
                var response = await request.post("https://app.rari.capital/checkSig.php", { data: JSON.stringify({ from, to, encodedFunctionCall, txFee, gasPrice, gas, nonce, relayerAddress, relayHubAddress }), contentType: 'application/json', });
            } catch (error) {
                return console.error("checkSig error:", error);
            }

            console.log("checkSig response:", response);
            return response;
        };

        this.web3Gsn = new Web3(new OpenZeppelinGSNProvider.GSNProvider(web3Provider, { approveFunction })); */

    for (const currencyCode of Object.keys(this.internalTokens))
      this.internalTokens[currencyCode].contract = new this.web3.eth.Contract(
        erc20Abi,
        this.internalTokens[currencyCode].address
      );

    var self = this;

    this.getAllTokens = async function (cacheTimeout = 86400) {
      self.cache._raw["allTokens"].timeout =
        typeof cacheTimeout === "undefined" ? 86400 : cacheTimeout;
      return await self.cache.getOrUpdate("allTokens", async function () {
        var allTokens = Object.assign({}, self.internalTokens);
        var data = (await axios.get("https://api.0x.org/swap/v0/tokens")).data;
        data.records.sort((a, b) => (a.symbol > b.symbol ? 1 : -1));

        for (const token of data.records)
          if (
            [
              "DAI",
              "USDC",
              "USDT",
              "TUSD",
              "BUSD",
              "bUSD",
              "sUSD",
              "SUSD",
              "mUSD",
            ].indexOf(token.symbol) < 0
          ) {
            token.contract = new self.web3.eth.Contract(
              erc20Abi,
              token.address
            );
            allTokens[token.symbol] = token;
          }

        return allTokens;
      });
    };

    let subpools = {
      dYdX: new DydxSubpool(this.web3),
      Compound: new CompoundSubpool(this.web3),
      Aave: new AaveSubpool(this.web3),
      mStable: new MStableSubpool(this.web3),
      yVault: new YVaultSubpool(this.web3),
      KeeperDAO: new KeeperDAOSubpool(this.web3),
    };

    this.pools = {
      stable: new StablePool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          Aave: subpools["Aave"],
          mStable: subpools["mStable"],
        },
        this.getAllTokens
      ),
      yield: new YieldPool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          Aave: subpools["Aave"],
          mStable: subpools["mStable"],
          yVault: subpools["yVault"],
        },
        this.getAllTokens
      ),
      ethereum: new EthereumPool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          KeeperDAO: subpools["KeeperDAO"],
          Aave: subpools["Aave"],
        },
        this.getAllTokens
      ),
    };

    this.governance = new Governance(this.web3);
  }

  static StablePool = StablePool;
  static YieldPool = YieldPool;
  static EthereumPool = EthereumPool;

  static Governance = Governance;

  static Web3 = Web3;
  static BN = Web3.utils.BN;

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
}

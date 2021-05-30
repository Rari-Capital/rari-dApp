/* eslint-disable */
import Web3 from "web3";
import axios from "axios";
import Big from "big.js";

import DydxSubpool from "./subpools/dydx.js";
import CompoundSubpool from "./subpools/compound.js";
import AaveSubpool from "./subpools/aave.js";
import MStableSubpool from "./subpools/mstable.js";
import YVaultSubpool from "./subpools/yvault.js";
import KeeperDAOSubpool from "./subpools/keeperdao.js";
import AlphaSubpool from "./subpools/alpha.js";
import FuseSubpool from "./subpools/fuse.js";

import StablePool from "./pools/stable.js";
import YieldPool from "./pools/yield.js";
import EthereumPool from "./pools/ethereum.js";
import DaiPool from "./pools/dai.js";

import Governance from "./governance.js";

import Cache from "./cache.js";

var erc20Abi = require("." + "/abi/ERC20.json");

export default class Rari {
  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider);
    this.cache = new Cache({ allTokens: 86400, ethUsdPrice: 300 });

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

    this.getEthUsdPriceBN = async function () {
      return await self.cache.getOrUpdate("ethUsdPrice", async function () {
        try {
          return Web3.utils.toBN(
            new Big(
              (
                await axios.get(
                  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum"
                )
              ).data.ethereum.usd
            )
              .mul(1e18)
              .toFixed(0)
          );
        } catch (error) {
          throw new Error("Error retrieving data from Coingecko API: " + error);
        }
      });
    };

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
      Alpha: new AlphaSubpool(this.web3),
      Fuse3: new FuseSubpool(this.web3, { "USDC": "0x94C49563a3950424a2a7790c3eF5458A2A359C7e" }),
      Fuse6: new FuseSubpool(this.web3, { "DAI": "0x989273ec41274C4227bCB878C2c26fdd3afbE70d" }),
      Fuse7: new FuseSubpool(this.web3, { "USDC": "0x53De5A7B03dc24Ff5d25ccF7Ad337a0425Dfd8D1" }),
    };

    this.pools = {
      stable: new StablePool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          Aave: subpools["Aave"],
          mStable: subpools["mStable"],
          Fuse3: subpools["Fuse3"],
          Fuse7: subpools["Fuse7"],
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
          Alpha: subpools["Alpha"],
          Enzyme: subpools["Alpha"],
        },
        this.getAllTokens
      ),
      dai: new DaiPool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          Aave: subpools["Aave"],
          mStable: subpools["mStable"],
          Fuse6: subpools["Fuse6"],
        },
        this.getAllTokens
      ),
    };

    this.governance = new Governance(this.web3);
  }

  static StablePool = StablePool;
  static YieldPool = YieldPool;
  static EthereumPool = EthereumPool;
  static DaiPool = DaiPool;

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

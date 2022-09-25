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
        var data = {"records":[{"symbol":"DAI","address":"0x6b175474e89094c44da98b954eedeac495271d0f","name":"Dai Stablecoin","decimals":18},{"symbol":"REP","address":"0x1985365e9f78359a9B6AD760e32412f4a445E862","name":"Augur Reputation","decimals":18},{"symbol":"WETH","address":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","name":"Wrapped Ether","decimals":18},{"symbol":"ZRX","address":"0xe41d2489571d322189246dafa5ebde1f4699f498","name":"0x Protocol Token","decimals":18},{"symbol":"USDC","address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","name":"USD Coin","decimals":6},{"symbol":"BAT","address":"0x0d8775f648430679a709e98d2b0cb6250d2887ef","name":"Basic Attention Token","decimals":18},{"symbol":"MKR","address":"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2","name":"Maker","decimals":18},{"symbol":"WBTC","address":"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","name":"Wrapped BTC","decimals":8},{"symbol":"SNX","address":"0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f","name":"Synthetix Network Token","decimals":18},{"symbol":"SUSD","address":"0x57ab1ec28d129707052df4df418d58a2d46d5f51","name":"sUSD","decimals":18},{"symbol":"KNC","address":"0xdd974d5c2e2928dea5f71b9825b8b646686bd200","name":"Kyber Network Crystal","decimals":18},{"symbol":"BNT","address":"0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c","name":"Bancor Network Token","decimals":18},{"symbol":"GNO","address":"0x6810e776880c02933d47db1b9fc05908e5386b96","name":"Gnosis Token","decimals":18},{"symbol":"LINK","address":"0x514910771af9ca656af840dff83e8264ecf986ca","name":"Chainlink Token","decimals":18},{"symbol":"REN","address":"0x408e41876cccdc0f92210600ef50372656052a38","name":"Republic Protocol","decimals":18},{"symbol":"GNT","address":"0xa74476443119a942de498590fe1f2454d7d4ac0d","name":"Golem Network Token","decimals":18},{"symbol":"OMG","address":"0xd26114cd6ee289accf82350c8d8487fedb8a0c07","name":"OmiseGO","decimals":18},{"symbol":"ANT","address":"0x960b236a07cf122663c4303350609a66a7b288c0","name":"Aragon Network Token","decimals":18},{"symbol":"SAI","address":"0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359","name":"Sai Stablecoin v1.0","decimals":18},{"symbol":"CVL","address":"0x01fa555c97d7958fa6f771f3bbd5ccd508f81e22","name":"Civil Token","decimals":18},{"symbol":"DTH","address":"0x5adc961d6ac3f7062d2ea45fefb8d8167d44b190","name":"Dether","decimals":18},{"symbol":"FOAM","address":"0x4946fcea7c692606e8908002e55a582af44ac121","name":"FOAM","decimals":18},{"symbol":"AST","address":"0x27054b13b1b798b345b591a4d22e6562d47ea75a","name":"AirSwap Token","decimals":4},{"symbol":"AION","address":"0x4ceda7906a5ed2179785cd3a40a69ee8bc99c466","name":"Aion Network","decimals":8},{"symbol":"GEN","address":"0x543ff227f64aa17ea132bf9886cab5db55dcaddf","name":"DAOstack","decimals":18},{"symbol":"STORJ","address":"0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac","name":"Storj","decimals":8},{"symbol":"MANA","address":"0x0f5d2fb29fb7d3cfee444a200298f468908cc942","name":"Decentraland","decimals":18},{"symbol":"ENTRP","address":"0x5bc7e5f0ab8b2e10d2d0a3f21739fce62459aef3","name":"Hut34 Entropy Token","decimals":18},{"symbol":"MLN","address":"0xbeb9ef514a379b997e0798fdcc901ee474b6d9a1","name":"Melon","decimals":18},{"symbol":"LOOM","address":"0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0","name":"Loom Network Token","decimals":18},{"symbol":"CELR","address":"0x4f9254c83eb525f9fcf346490bbb3ed28a81c667","name":"Celer Network Token","decimals":18},{"symbol":"RLC","address":"0x607f4c5bb672230e8672085532f7e901544a7375","name":"iExec RLC Token","decimals":9},{"symbol":"ICN","address":"0x888666ca69e0f178ded6d75b5726cee99a87d698","name":"ICONOMI","decimals":18},{"symbol":"DGD","address":"0xe0b7927c4af23765cb51314a0e0521a9645f0e2a","name":"Digix","decimals":9},{"symbol":"ZIL","address":"0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27","name":"Zilliqa","decimals":12},{"symbol":"cBAT","address":"0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e","name":"Compound Basic Attention Token","decimals":8},{"symbol":"cDAI","address":"0x5d3a536e4d6dbd6114cc1ead35777bab948e3643","name":"Compound Dai","decimals":8},{"symbol":"cSAI","address":"0xf5dce57282a584d2746faf1593d3121fcac444dc","name":"Compound Sai (Legacy Dai)","decimals":8},{"symbol":"cETH","address":"0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5","name":"Compound Ether","decimals":8},{"symbol":"cREP","address":"0x158079ee67fce2f58472a96584a73c7ab9ac95c1","name":"Compound Augur","decimals":8},{"symbol":"cUSDC","address":"0x39aa39c021dfbae8fac545936693ac917d5e7563","name":"Compound USD Coin","decimals":8},{"symbol":"cZRX","address":"0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407","name":"Compound 0x","decimals":8},{"symbol":"0xBTC","address":"0xb6ed7644c69416d67b522e20bc294a9a9b405b31","name":"0xBitcoin Token","decimals":8},{"symbol":"SNT","address":"0x744d70fdbe2ba4cf95131626614a1763df805b9e","name":"Status Network Token","decimals":18},{"symbol":"SPANK","address":"0x42d6622dece394b54999fbd73d108123806f6a18","name":"SPANK","decimals":18},{"symbol":"BOOTY","address":"0x6b01c3170ae1efebee1a3159172cb3f7a5ecf9e5","name":"BOOTY","decimals":18},{"symbol":"UBT","address":"0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e","name":"UniBright","decimals":8},{"symbol":"ICX","address":"0xb5a5f22694352c15b00323844ad545abb2b11028","name":"ICON","decimals":18},{"symbol":"NMR","address":"0x1776e1f26f98b1a5df9cd347953a26dd3cb46671","name":"Numeraire","decimals":18},{"symbol":"GUSD","address":"0x056fd409e1d7a124bd7017459dfea2f387b6d5cd","name":"Gemini Dollar","decimals":2},{"symbol":"FUN","address":"0x419d0d8bdd9af5e606ae2232ed285aff190e711b","name":"FunFair","decimals":8},{"symbol":"PAX","address":"0x8e870d67f660d95d5be530380d0ec0bd388289e1","name":"PAX Stablecoin","decimals":18},{"symbol":"TUSD","address":"0x0000000000085d4780b73119b644ae5ecd22b376","name":"TrueUSD","decimals":18},{"symbol":"LPT","address":"0x58b6a8a3302369daec383334672404ee733ab239","name":"Livepeer","decimals":18},{"symbol":"ENJ","address":"0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c","name":"EnjinCoin","decimals":18},{"symbol":"POWR","address":"0x595832f8fc6bf59c85c527fec3740a1b7a361269","name":"PowerLedger","decimals":6},{"symbol":"REQ","address":"0x8f8221afbb33998d8584a2b05749ba73c37a938a","name":"Request","decimals":18},{"symbol":"DNT","address":"0x0abdace70d3790235af448c88547603b945604ea","name":"district0x","decimals":18},{"symbol":"MATIC","address":"0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0","name":"Matic Network Token","decimals":18},{"symbol":"LRC","address":"0xbbbbca6a901c926f240b89eacb641d8aec7aeafd","name":"Loopring","decimals":18},{"symbol":"RDN","address":"0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6","name":"Raiden Network Token","decimals":18},{"symbol":"USDT","address":"0xdac17f958d2ee523a2206206994597c13d831ec7","name":"Tether USD","decimals":6},{"symbol":"GST2","address":"0x0000000000b3f879cb30fe243b4dfee438691c04","name":"Gas Token 2","decimals":2},{"symbol":"COMP","address":"0xc00e94cb662c3520282e6f5717214004a7f26888","name":"Compound","decimals":18},{"symbol":"UMA","address":"0x04fa0d235c4abf4bcf4787af4cf447de572ef828","name":"Universal Market Access","decimals":18},{"symbol":"BZRX","address":"0x56d811088235f11c8920698a204a5010a788f4b3","name":"bZx Protocol Token","decimals":18},{"symbol":"renBTC","address":"0xeb4c2781e4eba804ce9a9803c67d0893436bb27d","name":"renBTC","decimals":8},{"symbol":"BAL","address":"0xba100000625a3754423978a60c9317c58a424e3d","name":"Balancer","decimals":18},{"symbol":"LEND","address":"0x80fb784b7ed66730e8b1dbd9820afd29931aab03","name":"Aave","decimals":18},{"symbol":"YFI","address":"0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e","name":"yearn.finance","decimals":18},{"symbol":"AMPL","address":"0xd46ba6d942050d489dbd938a2c909a5d5039a161","name":"Ampleforth","decimals":9},{"symbol":"KEEP","address":"0x85eee30c52b0b379b046fb0f85f4f3dc3009afec","name":"Keep","decimals":18},{"symbol":"mUSD","address":"0xe2f2a5c287993345a840db3b0845fbc70f5935a5","name":"mStable USD","decimals":18},{"symbol":"bUSD","address":"0x4Fabb145d64652a948d72533023f6E7A623C7C53","name":"Binance USD","decimals":18},{"symbol":"CRV","address":"0xd533a949740bb3306d119cc777fa900ba034cd52","name":"Curve DAO Token","decimals":18},{"symbol":"SUSHI","address":"0x6b3595068778dd592e39a122f4f5a5cf09c90fe2","name":"Sushi","decimals":18},{"symbol":"swUSD","address":"0x77C6E4a580c0dCE4E5c7a17d0bc077188a83A059","name":"Swerve.fi swUSD","decimals":18},{"symbol":"SWRV","address":"0xB8BAa0e4287890a5F79863aB62b7F175ceCbD433","name":"Swerve DAO Token","decimals":18},{"symbol":"sBTC","address":"0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6","name":"Synth sBTC","decimals":18},{"symbol":"UNI","address":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984","name":"Uniswap Protocol Governance Token","decimals":18}]}
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
      Fuse2: new FuseSubpool(this.web3, { "USDC": "0x69aEd4932B3aB019609dc567809FA6953a7E0858" }),
      Fuse3: new FuseSubpool(this.web3, { "USDC": "0x94C49563a3950424a2a7790c3eF5458A2A359C7e" }),
      Fuse6: new FuseSubpool(this.web3, { "USDC": "0xdb55b77f5e8a1a41931684cf9e4881d24e6b6cc9", "DAI": "0x989273ec41274C4227bCB878C2c26fdd3afbE70d" }),
      Fuse7: new FuseSubpool(this.web3, { "USDC": "0x53De5A7B03dc24Ff5d25ccF7Ad337a0425Dfd8D1", "DAI": "0x7322B10Db09687fe8889aD8e87f333f95104839F" }),
      Fuse11: new FuseSubpool(this.web3, { "USDC": "0x241056eb034BEA7482290f4a9E3e4dd7269D4329" }),
      Fuse13: new FuseSubpool(this.web3, { "USDC": "0x3b624de26A6CeBa421f9857127e37A5EFD8ecaab" }),
      Fuse14: new FuseSubpool(this.web3, { "USDC": "0x6447026FE96363669B5be2EE135843a5e4d15B50" }),
      Fuse15: new FuseSubpool(this.web3, { "USDC": "0x5F9FaeD5599D86D2e6F8d982189d560C067897a0" }),
      Fuse16: new FuseSubpool(this.web3, { "USDC": "0x7bA788fa2773fb157EfAfAd046FE5E0e6120DEd5" }),
      Fuse18: new FuseSubpool(this.web3, { "USDC": "0x6f95d4d251053483f41c8718C30F4F3C404A8cf2", "DAI": "0x8E4E0257A4759559B4B1AC087fe8d80c63f20D19" }),
    };

    this.pools = {
      stable: new StablePool(
        this.web3,
        {
          dYdX: subpools["dYdX"],
          Compound: subpools["Compound"],
          Aave: subpools["Aave"],
          mStable: subpools["mStable"],
          Fuse2: subpools["Fuse2"],
          Fuse3: subpools["Fuse3"],
          Fuse7: subpools["Fuse7"],
          Fuse11: subpools["Fuse11"],
          Fuse13: subpools["Fuse13"],
          Fuse14: subpools["Fuse14"],
          Fuse15: subpools["Fuse15"],
          Fuse16: subpools["Fuse16"],
          Fuse18: subpools["Fuse18"],
          Fuse6: subpools["Fuse6"],
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
          Fuse7: subpools["Fuse7"],
          Fuse18: subpools["Fuse18"],
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

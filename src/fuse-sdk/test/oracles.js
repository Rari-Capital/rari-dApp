var assert = require('assert');
var Big = require('big.js');
var axios = require('axios');

const Fuse = require("../dist/fuse.node.commonjs2.js");

assert(process.env.TESTING_WEB3_PROVIDER_URL, "Web3 provider URL required");
var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

var erc20Abi = JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi);
var cErc20Abi = JSON.parse(fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi);
var comptrollerAbi = JSON.parse(fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi);

// Deploy pool + assets
async function deployPool(conf, options) {
  if (conf.closeFactor === undefined) conf.poolName = "Example Fuse Pool " + (new Date()).getTime();
  if (conf.closeFactor === undefined) conf.closeFactor = Fuse.Web3.utils.toBN(0.5e18);
  else conf.closeFactor = Fuse.Web3.utils.toBN((new Big(conf.closeFactor)).mul((new Big(10)).pow(18)).toFixed(0));
  if (conf.maxAssets === undefined) conf.maxAssets = 20;
  if (conf.liquidationIncentive === undefined) conf.liquidationIncentive = Fuse.Web3.utils.toBN(1.08e18);
  else conf.liquidationIncentive = Fuse.Web3.utils.toBN((new Big(conf.liquidationIncentive)).mul((new Big(10)).pow(18)).toFixed(0));

  var [poolAddress, implementationAddress, priceOracleAddress] = await fuse.deployPool(conf.poolName, conf.isPrivate, conf.closeFactor, conf.maxAssets, conf.liquidationIncentive, conf.priceOracle, conf.priceOracleConf, options);
  return [poolAddress, priceOracleAddress];
}

async function deployAsset(conf, collateralFactor, reserveFactor, adminFee, options, bypassPriceFeedCheck) {
  if (conf.interestRateModel === undefined) conf.interestRateModel = "0x6bc8fe27d0c7207733656595e73c0d5cf7afae36";
  if (conf.decimals === undefined) conf.decimals = 8;
  if (conf.admin === undefined) conf.admin = options.from;
  if (collateralFactor === undefined) collateralFactor = Fuse.Web3.utils.toBN(0.75e18);
  if (reserveFactor === undefined) reserveFactor = Fuse.Web3.utils.toBN(0.2e18);
  if (adminFee === undefined) adminFee = Fuse.Web3.utils.toBN(0.05e18);

  var [assetAddress, implementationAddress, interestRateModel] = await fuse.deployAsset(conf, collateralFactor, reserveFactor, adminFee, options, bypassPriceFeedCheck);
  return assetAddress;
}

// Get token/ETH price via CoinGecko
async function getTokenPrice(tokenAddress) {
  tokenAddress = tokenAddress.toLowerCase();
  var decoded = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/ethereum', {
    params: {
      vs_currencies: "eth",
      contract_addresses: tokenAddress
    }
  })).data;
  if (!decoded || !decoded[tokenAddress]) throw "Failed to decode price of " + tokenAddress + " from CoinGecko";
  return decoded[tokenAddress].eth;
}

describe('UniswapView', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, uniswapView;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Price oracle token configs
    var PriceSource = {
      FIXED_ETH: 0,
      FIXED_USD: 1,
      REPORTER: 2,
      TWAP: 3
    };

    var tokenConfigs = [
      { underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbolHash: Fuse.Web3.utils.soliditySha3("WETH"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.FIXED_ETH, fixedPrice: Fuse.Web3.utils.toBN(1e18).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbolHash: Fuse.Web3.utils.soliditySha3("USDC"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", isUniswapReversed: false },
      { underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbolHash: Fuse.Web3.utils.soliditySha3("USDT"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.FIXED_USD, fixedPrice: Fuse.Web3.utils.toBN(1e6).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", symbolHash: Fuse.Web3.utils.soliditySha3("DAI"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", isUniswapReversed: false },
      { underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623", symbolHash: Fuse.Web3.utils.soliditySha3("RGT"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xdc2b82bc1106c9c5286e59344896fb0ceb932f53", isUniswapReversed: true }
    ];

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    uniswapView = new fuse.web3.eth.Contract(JSON.parse(fuse.openOracleContracts["contracts/Uniswap/UniswapView.sol:UniswapView"].abi), priceOracleAddress);

    // Post prices for TWAP assets
    await uniswapView.methods.postPrices(["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0x6b175474e89094c44da98b954eedeac495271d0f", "0xD291E7a03283640FDc51b121aC401383A46cC623"]).send({ from: accounts[0], gasPrice: "0" });

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
      { name: "Fuse RGT", symbol: "fRGT", underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await uniswapView.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * (symbol == "fRGT" ? 0.9 : 0.95) && oraclePrice <= expectedPrice * (symbol == "fRGT" ? 1.1 : 1.05));
      }
    });
  });
});

describe('UniswapView (public)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, uniswapView;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Price oracle token configs
    var PriceSource = {
      FIXED_ETH: 0,
      FIXED_USD: 1,
      REPORTER: 2,
      TWAP: 3
    };

    var tokenConfigs = [
      { underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbolHash: Fuse.Web3.utils.soliditySha3("WETH"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.FIXED_ETH, fixedPrice: Fuse.Web3.utils.toBN(1e18).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbolHash: Fuse.Web3.utils.soliditySha3("USDC"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", isUniswapReversed: false },
      { underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbolHash: Fuse.Web3.utils.soliditySha3("USDT"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.FIXED_USD, fixedPrice: Fuse.Web3.utils.toBN(1e6).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", symbolHash: Fuse.Web3.utils.soliditySha3("DAI"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", isUniswapReversed: false },
      { underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623", symbolHash: Fuse.Web3.utils.soliditySha3("RGT"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xdc2b82bc1106c9c5286e59344896fb0ceb932f53", isUniswapReversed: true }
    ];

    // Try and fail to deploy pool (because USDT is PriceSource.FIXED_USD)
    await assert.rejects(deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" }), (err) => {
      assert(/Invalid token config price source: must be TWAP/.test(err));
      return true;
    });

    // Change USDT token config to PriceSource.TWAP
    tokenConfigs[2].priceSource = PriceSource.TWAP;
    tokenConfigs[2].fixedPrice = 0;
    tokenConfigs[2].uniswapMarket = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852";
    tokenConfigs[2].isUniswapReversed = true;

    // Change DAI symbol to NOTDAI, try and fail to deploy pool, and change DAI symbol back to DAI
    tokenConfigs[3].symbolHash = Fuse.Web3.utils.soliditySha3("NOTDAI");
    await assert.rejects(deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" }), (err) => {
      assert(/Symbol mismatch between token config and ERC20 symbol method/.test(err));
      return true;
    });
    tokenConfigs[3].symbolHash = Fuse.Web3.utils.soliditySha3("DAI");

    // Change DAI base unit to 1e16, try and fail to deploy pool, and change DAI base unit back to 1e18
    tokenConfigs[3].baseUnit = Fuse.Web3.utils.toBN(1e16).toString();
    await assert.rejects(deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" }), (err) => {
      assert(/Incorrect token config base unit/.test(err));
      return true;
    });
    tokenConfigs[3].baseUnit = Fuse.Web3.utils.toBN(1e18).toString();

    // Change DAI Uniswap market to USDC Uniswap market, try and fail to deploy pool, and change DAI base unit back to 0xa478c2975ab1ea89e8196811f51a7b7ade33eb11
    tokenConfigs[3].uniswapMarket = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
    await assert.rejects(deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" }), (err) => {
      assert(/Token config Uniswap market is not correct/.test(err));
      return true;
    });
    tokenConfigs[3].uniswapMarket = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11";

    // Change DAI Uniswap market reversal to true, try and fail to deploy pool, and change DAI Uniswap market reversal back to false
    tokenConfigs[3].isUniswapReversed = true;
    await assert.rejects(deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" }), (err) => {
      assert(/Token config Uniswap reversal is incorrect/.test(err));
      return true;
    });
    tokenConfigs[3].isUniswapReversed = false;

    // Actually deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "UniswapView", priceOracleConf: { tokenConfigs, isPublic: true } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    uniswapView = new fuse.web3.eth.Contract(JSON.parse(fuse.openOracleContracts["contracts/Uniswap/UniswapView.sol:UniswapView"].abi), priceOracleAddress);

    // Post prices for TWAP assets
    await uniswapView.methods.postPrices(["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xdac17f958d2ee523a2206206994597c13d831ec7", "0x6b175474e89094c44da98b954eedeac495271d0f", "0xD291E7a03283640FDc51b121aC401383A46cC623"]).send({ from: accounts[0], gasPrice: "0" });

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
      { name: "Fuse RGT", symbol: "fRGT", underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await uniswapView.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * (symbol == "fRGT" ? 0.9 : 0.95) && oraclePrice <= expectedPrice * (symbol == "fRGT" ? 1.1 : 1.05));
      }
    });
  });
});

describe('UniswapAnchoredView (Coinbase)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, uniswapAnchoredView;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "UniswapAnchoredView" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    uniswapAnchoredView = new fuse.web3.eth.Contract(JSON.parse(fuse.openOracleContracts["contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView"].abi), priceOracleAddress);

    // Add more token configs
    var PriceSource = {
      FIXED_ETH: 0,
      FIXED_USD: 1,
      REPORTER: 2,
      TWAP: 3
    };

    var tokenConfigs = [
      { underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbolHash: Fuse.Web3.utils.soliditySha3("WETH"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.FIXED_ETH, fixedPrice: Fuse.Web3.utils.toBN(1e18).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbolHash: Fuse.Web3.utils.soliditySha3("USDC"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.FIXED_USD, fixedPrice: Fuse.Web3.utils.toBN(1e6).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbolHash: Fuse.Web3.utils.soliditySha3("USDT"), baseUnit: Fuse.Web3.utils.toBN(1e6).toString(), priceSource: PriceSource.FIXED_USD, fixedPrice: Fuse.Web3.utils.toBN(1e6).toString(), uniswapMarket: "0x0000000000000000000000000000000000000000", isUniswapReversed: false },
      { underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", symbolHash: Fuse.Web3.utils.soliditySha3("DAI"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", isUniswapReversed: false }
    ];

    await uniswapAnchoredView.methods.add(tokenConfigs).send({ from: accounts[0], gasPrice: "0" });

    // Post prices for TWAP assets
    await uniswapAnchoredView.methods.postPrices([], [], ["ETH", "DAI"]).send({ from: accounts[0], gasPrice: "0" });

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await uniswapAnchoredView.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('ChainlinkPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, chainlinkPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "ChainlinkPriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    chainlinkPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["ChainlinkPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
      { name: "Fuse MLN", symbol: "fMLN", underlying: "0xec67005c4e498ec7f55e092bd1d35cbc47c91892" },
      { name: "Fuse sTSLA", symbol: "fsTSLA", underlying: "0x918dA91Ccbc32B7a6A0cc4eCd5987bbab6E31e6D" },
      { name: "Fuse DIGG", symbol: "fDIGG", underlying: "0x798D1bE841a82a273720CE31c822C61a67a601C3" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await chainlinkPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('PreferredPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, preferredPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Price oracle token configs
    var PriceSource = {
      FIXED_ETH: 0,
      FIXED_USD: 1,
      REPORTER: 2,
      TWAP: 3
    };

    var tokenConfigs = [
      { underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623", symbolHash: Fuse.Web3.utils.soliditySha3("RGT"), baseUnit: Fuse.Web3.utils.toBN(1e18).toString(), priceSource: PriceSource.TWAP, fixedPrice: 0, uniswapMarket: "0xdc2b82bc1106c9c5286e59344896fb0ceb932f53", isUniswapReversed: true }
    ];

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "PreferredPriceOracle", priceOracleConf: { tokenConfigs } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    preferredPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["PreferredPriceOracle"].abi, priceOracleAddress);
    var uniswapViewAddress = await preferredPriceOracle.methods.secondaryOracle().call();
    var uniswapView = new fuse.web3.eth.Contract(JSON.parse(fuse.openOracleContracts["contracts/Uniswap/UniswapView.sol:UniswapView"].abi), uniswapViewAddress);

    // Post prices for TWAP assets
    await uniswapView.methods.postPrices(["0xD291E7a03283640FDc51b121aC401383A46cC623"]).send({ from: accounts[0], gasPrice: "0" });

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
      { name: "Fuse MLN", symbol: "fMLN", underlying: "0xec67005c4e498ec7f55e092bd1d35cbc47c91892" },
      { name: "Fuse RGT", symbol: "fRGT", underlying: "0xD291E7a03283640FDc51b121aC401383A46cC623" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await preferredPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * (symbol == "fRGT" ? 0.9 : 0.95) && oraclePrice <= expectedPrice * (symbol == "fRGT" ? 1.1 : 1.05));
      }
    });
  });
});

describe('MasterPriceOracle, YVaultV1PriceOracle, YVaultV2PriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, masterPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Addresses
    var yfi = "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e";
    var wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    var yWeth = "0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7";
    var yYfi = "0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1";
    var yvWbtc = "0xcB550A6D4C8e3517A939BC79d0c7093eb7cF56B5";

    // Deploy ChainlinkPriceOracle
    var chainlinkPriceOracle = await fuse.deployPriceOracle("ChainlinkPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy YVaultV1PriceOracle
    var yVaultV1PriceOracle = await fuse.deployPriceOracle("YVaultV1PriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy YVaultV2PriceOracle
    var yVaultV2PriceOracle = await fuse.deployPriceOracle("YVaultV2PriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy pool with MasterPriceOracle
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "MasterPriceOracle", priceOracleConf: { underlyings: [yfi, wbtc, yWeth, yYfi, yvWbtc], oracles: [chainlinkPriceOracle, chainlinkPriceOracle, yVaultV1PriceOracle, yVaultV1PriceOracle, yVaultV2PriceOracle] } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    masterPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["MasterPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse yWETH", symbol: "fyWETH", underlying: yWeth },
      { name: "Fuse yYFI", symbol: "fyYFI", underlying: yYfi },
      { name: "Fuse yvWBTC", symbol: "fyvWBTC", underlying: yvWbtc }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await masterPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" || underlying.toLowerCase() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase() ? 1 : (await getYVaultPrice(underlying, symbol.substr(0, 3) == "fyv"));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

async function getYVaultPrice(yVault, v2) {
  var abi = v2 ? [{
    "name": "pricePerShare",
    "outputs": [{
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 12704
  }, {
    "name": "token",
    "outputs": [{
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2831
  }] : [{
    "constant": true,
    "inputs": [],
    "name": "getPricePerFullShare",
    "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "token",
    "outputs": [{
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];

  var yVaultContract = new fuse.web3.eth.Contract(abi, yVault);
  var tokenUnderlyingYVault = await yVaultContract.methods.token().call();
  if (v2) return (await yVaultContract.methods.pricePerShare().call()) / (10 ** (await (new fuse.web3.eth.Contract(erc20Abi, yVault)).methods.decimals().call())) * (await getTokenPrice(tokenUnderlyingYVault));
  else return (await yVaultContract.methods.getPricePerFullShare().call()) / 1e18 * (await getTokenPrice(tokenUnderlyingYVault));
}

describe('MasterPriceOracle, UniswapLpTokenPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, masterPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Addresses
    var usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    var usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    var usdcUsdtUniswapLpToken = "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f";
    var mln = "0xec67005c4e498ec7f55e092bd1d35cbc47c91892";
    var ethMlnUniswapLpToken = "0x15ab0333985fd1e289adf4fbbe19261454776642";
    var yfi = "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e";
    var yfiEthSushiSwapLpToken = "0x088ee5007c98a9677165d78dd2109ae4a3d04d0c";

    // Deploy ChainlinkPriceOracle
    var chainlinkPriceOracle = await fuse.deployPriceOracle("ChainlinkPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy UniswapLpTokenPriceOracle
    var uniswapLpTokenPriceOracle = await fuse.deployPriceOracle("UniswapLpTokenPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy pool with MasterPriceOracle
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "MasterPriceOracle", priceOracleConf: { underlyings: [usdc, usdt, mln, yfi, usdcUsdtUniswapLpToken, ethMlnUniswapLpToken, yfiEthSushiSwapLpToken], oracles: [chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, uniswapLpTokenPriceOracle, uniswapLpTokenPriceOracle, uniswapLpTokenPriceOracle] } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    masterPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["MasterPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC-USDT (Uniswap)", symbol: "fuUSDC-USDT", underlying: usdcUsdtUniswapLpToken },
      { name: "Fuse ETH-MLN (Uniswap)", symbol: "fuETH-MLN", underlying: ethMlnUniswapLpToken },
      { name: "Fuse YFI-ETH (SushiSwap)", symbol: "fsYFI-ETH", underlying: yfiEthSushiSwapLpToken }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await masterPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" || underlying.toLowerCase() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase() ? 1 : (await getLpTokenPrice(underlying, symbol.substr(0, 2) == "fs"));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.9 && oraclePrice <= expectedPrice * 1.1);
      }
    });
  });
});

async function getLpTokenPrice(lpToken, sushiSwap) {
  var data = (
    await axios.post(
      sushiSwap ? "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork" : "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        query: `{
          myPair: pair(id: "` + lpToken.toLowerCase() + `") {
            reserveUSD
            totalSupply
          }
        }`,
      }
    )
  ).data;
  return parseFloat(data.data.myPair.reserveUSD) / parseFloat(data.data.myPair.totalSupply) * (await getTokenPrice("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"));
}

describe('AlphaHomoraV1PriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddress, comptroller, priceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "AlphaHomoraV1PriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    priceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["AlphaHomoraV1PriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddress = await deployAsset({ comptroller: poolAddress, name: "Fuse ibETH", symbol: "fibETH", underlying: "0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A" }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      var oraclePrice = (await priceOracle.methods.getUnderlyingPrice(assetAddress).call()) / 1e18;
      var expectedPrice = await getTokenPrice("0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A");
      // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
      assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
    });
  });
});

describe('RecursivePriceOracle (Compound)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, recursivePriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "RecursivePriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    recursivePriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["RecursivePriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse Compound ETH", symbol: "fcETH", underlying: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5" },
      { name: "Fuse Compound USDC", symbol: "fcUSDC", underlying: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643" },
      { name: "Fuse Compound UNI", symbol: "fcUNI", underlying: "0x35a18000230da775cac24873d00ff85bccded550" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        // TODO: Check Compound's UniswapAnchoredView?
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await recursivePriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('RecursivePriceOracle (Fuse)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, recursivePriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy underlying pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "ChainlinkPriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    chainlinkPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["ChainlinkPriceOracle"].abi, priceOracleAddress);

    // Deploy underlying assets
    underlyingPoolAssetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse MLN", symbol: "fMLN", underlying: "0xec67005c4e498ec7f55e092bd1d35cbc47c91892" }
    ]) {
      underlyingPoolAssetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "RecursivePriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    recursivePriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["RecursivePriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse Fuse ETH", symbol: "ffETH", underlying: underlyingPoolAssetAddresses.fETH },
      { name: "Fuse Fuse USDC", symbol: "ffUSDC", underlying: underlyingPoolAssetAddresses.fUSDC },
      { name: "Fuse Fuse MLN", symbol: "ffMLN", underlying: underlyingPoolAssetAddresses.fMLN }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await recursivePriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));

        if (underlying) {
          var underlyingCToken = new fuse.web3.eth.Contract(cErc20Abi, underlying);
          var underlyingCTokenDecimals = await underlyingCToken.methods.decimals().call();
          if (await underlyingCToken.methods.isCEther().call()) {
            var underlyingCTokenUnderlyingDecimals = 18;
          } else {
            var underlyingCTokenUnderlying = await underlyingCToken.methods.underlying().call();
            var underlyingCTokenUnderlyingToken = new fuse.web3.eth.Contract(erc20Abi, underlyingCTokenUnderlying);
            var underlyingCTokenUnderlyingDecimals = await underlyingCTokenUnderlyingToken.methods.decimals().call();
          }
          var expectedUnderlyingCTokenUnderlyingPrice = symbol === "ffETH" ? 1 : (await getTokenPrice(underlyingCTokenUnderlying));
          var expectedPrice = (await underlyingCToken.methods.exchangeRateCurrent().call()) * (10 ** underlyingCTokenDecimals) / (10 ** underlyingCTokenUnderlyingDecimals) / 1e18 * expectedUnderlyingCTokenUnderlyingPrice;
        } else var expectedPrice = 1;

        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('Keep3rPriceOracle (Uniswap)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, keep3rPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "Keep3rPriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    keep3rPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["Keep3rPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse LINK", symbol: "fLINK", underlying: "0x514910771af9ca656af840dff83e8264ecf986ca" },
      { name: "Fuse YFI", symbol: "fYFI", underlying: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e" },
      { name: "Fuse CRV", symbol: "fCRV", underlying: "0xD533a949740bb3306d119CC777fa900bA034cd52" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await keep3rPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('Keep3rPriceOracle (SushiSwap)', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, keep3rPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "Keep3rPriceOracle", priceOracleConf: { sushiswap: true } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    keep3rPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["Keep3rPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse LINK", symbol: "fLINK", underlying: "0x514910771af9ca656af840dff83e8264ecf986ca" },
      { name: "Fuse YFI", symbol: "fYFI", underlying: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e" },
      { name: "Fuse SUSHI", symbol: "fSUSHI", underlying: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await keep3rPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('SynthetixPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, synthetixPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "SynthetixPriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    synthetixPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["SynthetixPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse sUSD", symbol: "fsUSD", underlying: "0x57ab1ec28d129707052df4df418d58a2d46d5f51" },
      { name: "Fuse sBTC", symbol: "fsBTC", underlying: "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6" },
      { name: "Fuse sETH", symbol: "fsETH", underlying: "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb" },
      { name: "Fuse sEUR", symbol: "fsEUR", underlying: "0xd71ecff9342a5ced620049e616c5035f1db98620" },
      { name: "Fuse sDEFI", symbol: "sDEFI", underlying: "0xe1afe1fd76fd88f78cbf599ea1846231b8ba3b6b" }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await synthetixPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" ? 1 : (await getTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05);
      }
    });
  });
});

describe('MasterPriceOracle, CurveLpTokenPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, masterPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Addresses
    var dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    var usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    var usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    var threePoolCurveLpToken = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
    var wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    var renbtc = "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d";
    var renCurveLpToken = "0x49849C98ae39Fff122806C06791Fa73784FB3675";
    var ust = "0xa47c8bf37f92abed4a126bda807a7b7498661acd";
    var ustCurveLpToken = "0x94e131324b6054c0D789b190b2dAC504e4361b53";

    // Deploy ChainlinkPriceOracle
    var chainlinkPriceOracle = await fuse.deployPriceOracle("ChainlinkPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy CurveLpTokenPriceOracle
    var curveLpTokenPriceOracle = await fuse.deployPriceOracle("CurveLpTokenPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Register LP tokens with CurveLpTokenPriceOracle
    var curveOracleContract = new fuse.web3.eth.Contract(fuse.oracleContracts["CurveLpTokenPriceOracle"].abi, curveLpTokenPriceOracle);
    for (const lpToken of [threePoolCurveLpToken, renCurveLpToken, ustCurveLpToken]) await curveOracleContract.methods.registerPool(lpToken).send({ from: accounts[0], gasPrice: "0" });

    // Deploy pool with MasterPriceOracle
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "MasterPriceOracle", priceOracleConf: { underlyings: [dai, usdc, usdt, wbtc, renbtc, ust, threePoolCurveLpToken, renCurveLpToken, ustCurveLpToken], oracles: [chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, curveLpTokenPriceOracle, curveLpTokenPriceOracle, curveLpTokenPriceOracle] } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    masterPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["MasterPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse 3Crv", symbol: "f3Crv", underlying: threePoolCurveLpToken },
      { name: "Fuse crvRenWBTC", symbol: "fcrvRenWBTC", underlying: renCurveLpToken },
      { name: "Fuse ust3CRV", symbol: "fust3CRV", underlying: ustCurveLpToken }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await masterPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" || underlying.toLowerCase() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase() ? 1 : (await getCurveLpTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.9 && oraclePrice <= expectedPrice * 1.1);
      }
    });
  });
});

async function getCurveLpTokenPrice(lpToken) {
  var abi = [{
    "name": "get_virtual_price_from_lp_token",
    "outputs": [{
      "type": "uint256",
      "name": ""
    }],
    "inputs": [{
      "type": "address",
      "name": "_token"
    }],
    "stateMutability": "view",
    "type": "function"
  }];
  var registry = new fuse.web3.eth.Contract(abi, "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c");
  var virtualPrice = (await registry.methods.get_virtual_price_from_lp_token(lpToken).call()) / 1e18;
  switch (lpToken) {
    case "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490":
    case "0x94e131324b6054c0D789b190b2dAC504e4361b53":
      return virtualPrice * (await getTokenPrice("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"));
      break;
    case "0x49849C98ae39Fff122806C06791Fa73784FB3675":
      return virtualPrice * (await getTokenPrice("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"));
      break;
    default: throw "Invalid LP token supplied to Curve LP token price getter.";
  }
}

describe('MasterPriceOracle, BalancerLpTokenPriceOracle', function() {
  this.timeout(15000);
  var accounts, assetAddresses, comptroller, masterPriceOracle;

  before(async function() {
    this.timeout(30000);
    accounts = await fuse.web3.eth.getAccounts();

    // Addresses
    var wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    var wbtcWethBalancerPoolToken = "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5";
    var bal = "0xba100000625a3754423978a60c9317c58a424e3D";
    var balWethBalancerPoolToken = "0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4";
    var susd = "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51";
    var stsla = "0x918dA91Ccbc32B7a6A0cc4eCd5987bbab6E31e6D";
    var susdStslaBalancerPoolToken = "0x055db9aff4311788264798356bbf3a733ae181c6";

    // Deploy ChainlinkPriceOracle
    var chainlinkPriceOracle = await fuse.deployPriceOracle("ChainlinkPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy BalancerLpTokenPriceOracle
    var balancerLpTokenPriceOracle = await fuse.deployPriceOracle("BalancerLpTokenPriceOracle", {}, { from: accounts[0], gasPrice: "0" });

    // Deploy pool with MasterPriceOracle
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "MasterPriceOracle", priceOracleConf: { underlyings: [wbtc, bal, susd, stsla, wbtcWethBalancerPoolToken, balWethBalancerPoolToken, susdStslaBalancerPoolToken], oracles: [chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, chainlinkPriceOracle, balancerLpTokenPriceOracle, balancerLpTokenPriceOracle, balancerLpTokenPriceOracle] } }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    masterPriceOracle = new fuse.web3.eth.Contract(fuse.oracleContracts["MasterPriceOracle"].abi, priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse WBTC-WETH (Balancer)", symbol: "fbWBTC-WETH", underlying: wbtcWethBalancerPoolToken },
      { name: "Fuse BAL-WETH (Balancer)", symbol: "fbBAL-WETH", underlying: balWethBalancerPoolToken },
      { name: "Fuse sUSD-sTSLA (Balancer)", symbol: "fbsUSD-sTSLA", underlying: susdStslaBalancerPoolToken }
    ]) {
      assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
    }
  });

  describe('#getUnderlyingPrice()', function() {
    it('should check token prices', async function() {
      for (const symbol of Object.keys(assetAddresses)) {
        var underlying = symbol === "fETH" ? null : await (new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[symbol])).methods.underlying().call();
        var oraclePrice = (await masterPriceOracle.methods.getUnderlyingPrice(assetAddresses[symbol]).call()) / (10 ** (36 - (symbol === "fETH" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call()))));
        var expectedPrice = symbol === "fETH" || underlying.toLowerCase() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase() ? 1 : (await getBalancerLpTokenPrice(underlying));
        // console.log(symbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
        assert(oraclePrice >= expectedPrice * 0.9 && oraclePrice <= expectedPrice * 1.1);
      }
    });
  });
});

async function getBalancerLpTokenPrice(lpToken) {
  var data = (
    await axios.post(
      "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
      {
        query: `{
          pool(id: "` + lpToken.toLowerCase() + `") {
            liquidity
            totalShares
          }
        }`,
      }
    )
  ).data;
  return parseFloat(data.data.pool.liquidity) / parseFloat(data.data.pool.totalShares) * (await getTokenPrice("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"));
}

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
  if (conf.initialExchangeRateMantissa === undefined) conf.initialExchangeRateMantissa = Fuse.Web3.utils.toBN(1e18);
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
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, uniswapView;

  before(async function() {
    this.timeout(20000);
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
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, uniswapView;

  before(async function() {
    this.timeout(20000);
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
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, uniswapAnchoredView;

  before(async function() {
    this.timeout(20000);
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
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, chainlinkPriceOracle;

  before(async function() {
    this.timeout(20000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "ChainlinkPriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(comptrollerAbi, poolAddress);
    chainlinkPriceOracle = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle"].abi), priceOracleAddress);

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse WETH", symbol: "fWETH", underlying: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse USDT", symbol: "fUSDT", underlying: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" },
      { name: "Fuse MLN", symbol: "fMLN", underlying: "0xec67005c4e498ec7f55e092bd1d35cbc47c91892" }
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
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, preferredPriceOracle;

  before(async function() {
    this.timeout(20000);
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
    preferredPriceOracle = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/PreferredPriceOracle.sol:PreferredPriceOracle"].abi), priceOracleAddress);
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

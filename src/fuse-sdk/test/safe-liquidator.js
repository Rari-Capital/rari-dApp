var assert = require("assert");
var Big = require("big.js");

const Fuse = require("../dist/fuse.node.commonjs2.js");

assert(process.env.TESTING_WEB3_PROVIDER_URL, "Web3 provider URL required");
var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

var erc20Abi = JSON.parse(
  fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi
);
var cErc20Abi = JSON.parse(
  fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
);
var cEtherAbi = JSON.parse(
  fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi
);

// Snapshot + revert + dry run wrapper function
var snapshotId = null;

function snapshot() {
  return new Promise(function (resolve, reject) {
    fuse.web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_snapshot",
        id: 1,
      },
      function (err, result) {
        if (err) return reject(err);
        snapshotId = result.result;
        resolve();
      }
    );
  });
}

function revert() {
  return new Promise(function (resolve, reject) {
    assert(snapshotId !== null);
    fuse.web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_revert",
        params: [snapshotId],
        id: new Date().getTime(),
      },
      function (err, result) {
        if (err) return reject(err);
        assert(result.result);
        resolve();
      }
    );
  });
}

function dryRun(promise) {
  return async function () {
    await snapshot();
    var error = null;

    try {
      await promise();
    } catch (_error) {
      error = _error;
    }

    await revert();
    if (error !== null) throw error;
  };
}

// Deploy pool + assets
async function deployPool(conf, options) {
  if (conf.closeFactor === undefined)
    conf.poolName = "Example Fuse Pool " + new Date().getTime();
  if (conf.closeFactor === undefined)
    conf.closeFactor = Fuse.Web3.utils.toBN(0.5e18);
  else
    conf.closeFactor = Fuse.Web3.utils.toBN(
      new Big(conf.closeFactor).mul(new Big(10).pow(18)).toFixed(0)
    );
  if (conf.maxAssets === undefined) conf.maxAssets = 20;
  if (conf.liquidationIncentive === undefined)
    conf.liquidationIncentive = Fuse.Web3.utils.toBN(1.08e18);
  else
    conf.liquidationIncentive = Fuse.Web3.utils.toBN(
      new Big(conf.liquidationIncentive).mul(new Big(10).pow(18)).toFixed(0)
    );

  var [
    poolAddress,
    implementationAddress,
    priceOracleAddress,
  ] = await fuse.deployPool(
    conf.poolName,
    conf.isPrivate,
    conf.closeFactor,
    conf.maxAssets,
    conf.liquidationIncentive,
    conf.priceOracle,
    conf.priceOracleConf,
    options
  );
  return [poolAddress, priceOracleAddress];
}

async function deployAsset(
  conf,
  collateralFactor,
  reserveFactor,
  adminFee,
  options,
  bypassPriceFeedCheck
) {
  if (conf.interestRateModel === undefined)
    conf.interestRateModel = "0x6bc8fe27d0c7207733656595e73c0d5cf7afae36";
  if (conf.decimals === undefined) conf.decimals = 8;
  if (conf.admin === undefined) conf.admin = options.from;
  if (collateralFactor === undefined)
    collateralFactor = Fuse.Web3.utils.toBN(0.75e18);
  if (reserveFactor === undefined) reserveFactor = Fuse.Web3.utils.toBN(0.2e18);
  if (adminFee === undefined) adminFee = Fuse.Web3.utils.toBN(0.05e18);

  var [
    assetAddress,
    implementationAddress,
    interestRateModel,
  ] = await fuse.deployAsset(
    conf,
    collateralFactor,
    reserveFactor,
    adminFee,
    options,
    bypassPriceFeedCheck
  );
  return assetAddress;
}

// LiquidationStrategy enum
const LiquidationStrategy = {
  None: 0,
  AlphaHomoraV2SafeBox: 1,
  AlphaHomoraV2SafeBoxETH: 2,
  BalancerPoolToken: 3,
  CErc20: 4,
  CEther: 5,
  CurveLpToken: 6,
  CurveLiquidityGaugeV2: 7,
  SynthetixSynth: 8,
  UniswapLpToken: 9,
  YearnYVaultV1: 10,
  YearnYVaultV2: 11
};

// Supported Uniswap V2 protocols
const UNISWAP_V2_PROTOCOLS = {
  "Uniswap": {
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
  },
  "SushiSwap": {
    router: "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
    factory: "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac"
  }
}

// Liquidation strategy functions
async function getUniswapV2RouterByBestWethLiquidity(token) {
  // Get best Uniswap market for this token
  var bestUniswapV2RouterForToken, bestUniswapLiquidityForToken = Fuse.Web3.utils.toBN(0);
  var uniswapV2FactoryAbi = [{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
  var uniswapV2PairAbi = [{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
  for (const uniswapV2 of Object.values(UNISWAP_V2_PROTOCOLS)) {
    var uniswapV2Factory = new fuse.web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2.factory);
    var uniswapV2Pair = await uniswapV2Factory.methods.getPair(token, Fuse.WETH_ADDRESS).call();
    if (uniswapV2Pair == "0x0000000000000000000000000000000000000000") continue;
    uniswapV2Pair = new fuse.web3.eth.Contract(uniswapV2PairAbi, uniswapV2Pair);
    var reserves = await uniswapV2Pair.methods.getReserves().call();
    var wethLiquidity = Fuse.Web3.utils.toBN(reserves[(await uniswapV2Pair.methods.token0().call()).toLowerCase() == Fuse.WETH_ADDRESS.toLowerCase() ? "0" : "1"])
    if (wethLiquidity.gt(bestUniswapLiquidityForToken)) {
      bestUniswapV2RouterForToken = uniswapV2.router;
      bestUniswapLiquidityForToken = wethLiquidity;
    }
  }
  return [bestUniswapV2RouterForToken, bestUniswapLiquidityForToken];
}

async function getLiquidationStrategyData(token, strategy) {
  if (strategy == LiquidationStrategy.CurveLiquidityGaugeV2) {
    // Get coins underlying LP token underling gauge
    var gaugeAbi = [{"name":"lp_token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871}];
    var gauge = new fuse.web3.eth.Contract(gaugeAbi, token);
    token = await gauge.methods.lp_token().call();
    strategy = LiquidationStrategy.CurveLpToken;
  }

  if (strategy == LiquidationStrategy.CurveLpToken) {
    // Get Curve pool coins
    var registryAbi = [{"name":"get_coins","outputs":[{"type":"address[8]","name":""}],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"view","type":"function","gas":12285},{"name":"get_pool_from_lp_token","outputs":[{"type":"address","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2446}];
    var registry = new fuse.web3.eth.Contract(registryAbi, "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c");
    var pool = await registry.methods.get_pool_from_lp_token(token).call();
    var coins = await registry.methods.get_coins(pool).call();

    // Get ideal output coin and Uniswap market by best swap liquidity
    var bestCurveCoinIndex, bestUnderlying, bestUniswapV2Router, bestUniswapLiquidity = 0;

    for (var i = 0; i < coins.length; i++) {
      // Break if we have iterated through all coins
      if (coins[i] == "0x0000000000000000000000000000000000000000") break;

      // Break if coin is WETH
      if (coins[i].toLowerCase() == Fuse.WETH_ADDRESS.toLowerCase()) {
        bestUniswapV2Router = UNISWAP_V2_PROTOCOLS.Uniswap.router;
        bestCurveCoinIndex = i;
        bestUnderlying = coins[i];
        break;
      }

      // Get best Uniswap market for this token
      var [bestUniswapV2RouterForToken, bestUniswapLiquidityForToken] = await getUniswapV2RouterByBestWethLiquidity(coins[i]);

      // If this token's best Uniswap liquidity is better than the rest, use it
      if (bestUniswapLiquidityForToken > bestUniswapLiquidity) {
        bestCurveCoinIndex = i;
        bestUnderlying = coins[i];
        bestUniswapV2Router = bestUniswapV2RouterForToken;
        bestUniswapLiquidity = bestUniswapLiquidityForToken;
      }
    }

    // Return strategy data and Uniswap V2 router
    return [fuse.web3.eth.abi.encodeParameters(['uint8', 'address'], [bestCurveCoinIndex, bestUnderlying]), bestUniswapV2Router];
  }
}

// Assets to be added to pool
const testAssetFixtures = [
  { name: "Fuse ETH", symbol: "fETH", underlying: "0x0000000000000000000000000000000000000000", price: Fuse.Web3.utils.toBN(1e18) },
  { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", price: "421407501053518000000000000" },
  { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", price: "421407501053518" },
  { name: "Fuse linkCRV", symbol: "flinkCRV", underlying: "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", price: "14810827631962988" },
  { name: "Fuse linkCRV-gauge", symbol: "flinkCRV-gauge", underlying: "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", price: "14810827631962988" }
];

describe('FuseSafeLiquidator', function() {
  this.timeout(30000);
  var accounts, assetAddresses, comptroller, simplePriceOracle;

  before(async function() {
    this.timeout(60000);
    accounts = ["0x45D54B22582c79c8Fb8f4c4F2663ef54944f397a", "0x1Eeb75CFad36EDb6C996f7809f30952B0CA0B5B9"];

    // _setPoolLimits
    // TODO: Make this work without having to fork from block 12085726
    await fuse.contracts.FuseFeeDistributor.methods._setPoolLimits(Fuse.Web3.utils.toBN(0), Fuse.Web3.utils.toBN(2).pow(Fuse.Web3.utils.toBN(256)).subn(1), Fuse.Web3.utils.toBN(2).pow(Fuse.Web3.utils.toBN(256)).subn(1)).send({ from: "0x10dB6Bce3F2AE1589ec91A872213DAE59697967a" });

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "SimplePriceOracle" }, { from: accounts[0], gasPrice: "0", gas: 10e6 });
    comptroller = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi), poolAddress);

    // Set initial token prices
    simplePriceOracle = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/SimplePriceOracle.sol:SimplePriceOracle"].abi), priceOracleAddress);
    for (const conf of testAssetFixtures) await simplePriceOracle.methods.setDirectPrice(conf.underlying, conf.price).send({ from: accounts[0], gasPrice: "0", gas: 10e6 }); 

    // Deploy assets
    assetAddresses = {};
    for (const conf of testAssetFixtures) assetAddresses[conf.underlying.toLowerCase()] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0", gas: 10e6 }, true);
  });

  async function setupUnhealthyEthBorrowWithTokenCollateral(tokenCollateral) {
    // Default token collateral to DAI
    if (tokenCollateral === undefined) tokenCollateral = "0x6b175474e89094c44da98b954eedeac495271d0f";
    var originalPrice = testAssetFixtures.find(item => tokenCollateral.toLowerCase() === item.underlying.toLowerCase()).price;

    // Supply token collateral
    var token = new fuse.web3.eth.Contract(erc20Abi, tokenCollateral);
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[tokenCollateral.toLowerCase()]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(2).pow(Fuse.Web3.utils.toBN(256)).subn(1)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(3e14).mul(Fuse.Web3.utils.toBN(1e18)).div(Fuse.Web3.utils.toBN(originalPrice))).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });

    // Supply 0.001 ETH from other account
    var cToken = new fuse.web3.eth.Contract(cEtherAbi, assetAddresses["0x0000000000000000000000000000000000000000"]);
    await cToken.methods.mint().send({ from: accounts[1], gas: 5e6, gasPrice: "0", value: Fuse.Web3.utils.toBN(1e15) });

    // Borrow 0.0001 ETH using token collateral
    await comptroller.methods.enterMarkets([assetAddresses[tokenCollateral.toLowerCase()]]).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e14)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });

    // Set price of token collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice(tokenCollateral, Fuse.Web3.utils.toBN(originalPrice).divn(10)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
  }

  async function setupUnhealthyTokenBorrowWithEthCollateral() {
    // Supply ETH collateral
    var cToken = new fuse.web3.eth.Contract(cEtherAbi, assetAddresses["0x0000000000000000000000000000000000000000"]);
    await cToken.methods.mint().send({ from: accounts[0], gasPrice: "0", gas: 10e6, value: Fuse.Web3.utils.toBN(1e14) });

    // Supply DAI from other account
    var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["0x6b175474e89094c44da98b954eedeac495271d0f"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[1], gas: 5e6, gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[1], gas: 5e6, gasPrice: "0" });

    // Borrow DAI using ETH as collateral
    await comptroller.methods.enterMarkets([assetAddresses["0x0000000000000000000000000000000000000000"]]).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e17)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });

    // Set price of ETH collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice("0x0000000000000000000000000000000000000000", Fuse.Web3.utils.toBN(1e17)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
  }

  async function setupUnhealthyTokenBorrowWithTokenCollateral(tokenCollateral) {
    // Default token collateral to DAI
    if (tokenCollateral === undefined) tokenCollateral = "0x6b175474e89094c44da98b954eedeac495271d0f";

    // Get token collateral price
    var originalPrice = testAssetFixtures.find(item => tokenCollateral.toLowerCase() === item.underlying.toLowerCase()).price;

    // Supply token collateral
    var token = new fuse.web3.eth.Contract(erc20Abi, tokenCollateral);
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses[tokenCollateral.toLowerCase()]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(2).pow(Fuse.Web3.utils.toBN(256)).subn(1)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(1e14).mul(Fuse.Web3.utils.toBN(1e18)).div(Fuse.Web3.utils.toBN(originalPrice))).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });

    // Supply USDC from other account
    var token = new fuse.web3.eth.Contract(erc20Abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(1e6)).send({ from: accounts[1], gas: 5e6, gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(1e6)).send({ from: accounts[1], gas: 5e6, gasPrice: "0" });

    // Borrow USDC using token collateral
    await comptroller.methods.enterMarkets([assetAddresses[tokenCollateral.toLowerCase()]]).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e5)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });

    // Set price of DAI collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice(tokenCollateral, Fuse.Web3.utils.toBN(originalPrice).divn(10)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
  }

  async function setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral(exchangeTo, flashLoan, tokenCollateral, liquidationStrategy, strategyData, uniswapV2RouterForCollateral) {
    // Default token collateral to DAI
    if (tokenCollateral === undefined) tokenCollateral = "0x6b175474e89094c44da98b954eedeac495271d0f";

    // Setup unhealthy ETH borrow with token collateral
    await setupUnhealthyEthBorrowWithTokenCollateral(tokenCollateral);

    // Defaults
    if (exchangeTo === undefined || exchangeTo === null) exchangeTo = tokenCollateral;
    if (liquidationStrategy === undefined) liquidationStrategy = LiquidationStrategy.None;
    if (strategyData === undefined) strategyData = "0x0";
    if (uniswapV2RouterForCollateral === undefined) uniswapV2RouterForCollateral = UNISWAP_V2_PROTOCOLS.Uniswap.router;

    // Check balance before liquidation
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());

    // Liquidate borrow
    var repayAmount = Fuse.Web3.utils.toBN(1e13);
    await (flashLoan ? fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToEthWithFlashLoan(accounts[0], repayAmount, assetAddresses["0x0000000000000000000000000000000000000000"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6 }) : fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], assetAddresses["0x0000000000000000000000000000000000000000"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6, value: repayAmount }));

    // Assert balance after liquidation > balance before liquidation
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(!flashLoan && exchangeTo === "0x0000000000000000000000000000000000000000" ? liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation.sub(repayAmount)) : liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation)); // Factor in repaid ETH if not supplying own capital
  }

  async function setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral(exchangeTo, flashLoan) {
    // Setup unhealthy token borrow with ETH collateral
    await setupUnhealthyTokenBorrowWithEthCollateral();

    // Default profit target
    if (exchangeTo === undefined || exchangeTo === null) exchangeTo = "0x0000000000000000000000000000000000000000";

    // Check balance before liquidation
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());

    // Liquidate borrow
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["0x6b175474e89094c44da98b954eedeac495271d0f"], assetAddresses["0x0000000000000000000000000000000000000000"], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, UNISWAP_V2_PROTOCOLS.Uniswap.router, LiquidationStrategy.None, "0x0").send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e16)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["0x6b175474e89094c44da98b954eedeac495271d0f"], assetAddresses["0x0000000000000000000000000000000000000000"], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, LiquidationStrategy.None, "0x0").send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    }

    // Assert balance after liquidation > balance before liquidation
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  }

  async function setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral(exchangeTo, flashLoan, tokenCollateral, liquidationStrategy, strategyData, uniswapV2RouterForCollateral) {
    // Default token collateral to DAI
    if (tokenCollateral === undefined) tokenCollateral = "0x6b175474e89094c44da98b954eedeac495271d0f";

    // Setup unhealthy ETH borrow with token collateral
    await setupUnhealthyTokenBorrowWithTokenCollateral(tokenCollateral);

    // Defaults
    if (exchangeTo === undefined || exchangeTo === null) exchangeTo = tokenCollateral;
    if (liquidationStrategy === undefined) liquidationStrategy = LiquidationStrategy.None;
    if (strategyData === undefined) strategyData = "0x0";
    if (uniswapV2RouterForCollateral === undefined) uniswapV2RouterForCollateral = UNISWAP_V2_PROTOCOLS.Uniswap.router;

    // Check balance before liquidation
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());

    // Liquidate borrow
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e4)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    }

    // Assert balance after liquidation > balance before liquidation
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  }

  describe("#safeLiquidate()", function () {
    // Safe liquidate ETH borrow
    it(
      "should liquidate an ETH borrow for token collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral();
      })
    );

    // Safe liquidate token borrows
    it(
      "should liquidate a token borrow for ETH collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral();
      })
    );
    it(
      "should liquidate a token borrow for token collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral();
      })
    );

    // Safe liquidate ETH borrow + exchange seized collateral
    it('should liquidate an ETH borrow for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000") }));
    it('should liquidate an ETH borrow for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));

    // Safe liquidate token borrow + exchange seized collateral
    it('should liquidate a token borrow for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));
    it('should liquidate a token borrow for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000") }));
    it('should liquidate a token borrow for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));

    // Safe liquidate ETH borrow using Curve LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));
    it('should liquidate an ETH borrow for Curve LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));

    // Safe liquidate token borrow using Curve LP token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));
    it('should liquidate a token borrow for Curve LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));

    // Safe liquidate ETH borrow using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
    it('should liquidate an ETH borrow for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
    
    // Safe liquidate token borrow using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
    it('should liquidate a token borrow for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
  });

  describe("#safeLiquidateToEthWithFlashLoan()", function () {
    // Safe liquidate ETH borrow with flashloan
    it(
      "should liquidate an ETH borrow (using a flash swap) for token collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral(
          undefined,
          true
        );
      })
    );

    // Safe liquidate ETH borrow with flashloan + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    
    // Safe liquidate ETH borrow with flashloan + exchange seized collateral (using SushiSwap for exchanging collateral)
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate ETH borrow with flashloan using Curve LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve LP collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve LP collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));

    // Safe liquidate ETH borrow with flashloan using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
  });

  describe("#safeLiquidateToTokensWithFlashLoan()", function () {
    // Safe liquidate token borrow with flashloan
    it(
      "should liquidate a token borrow (using a flash swap) for ETH collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral(
          undefined,
          true
        );
      })
    );
    it(
      "should liquidate a token borrow (using a flash swap) for token collateral",
      dryRun(async () => {
        await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral(
          undefined,
          true
        );
      })
    );

    // Safe liquidate token borrow with flashloan + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    
    // Safe liquidate token borrow with flashloan + exchange seized collateral (using SushiSwap for exchanging collateral)
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate token borrow with flashloan using Curve LP token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve LP collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));
    it('should liquidate a token borrow (using a flash swap) for Curve LP collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken, ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", LiquidationStrategy.CurveLpToken)) }));

    // Safe liquidate token borrow with flashloan using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
    it('should liquidate a token borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2, ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", LiquidationStrategy.CurveLiquidityGaugeV2)) }));
  });
});

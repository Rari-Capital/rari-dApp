var assert = require('assert');
var Big = require('big.js');
var hre = require('hardhat');

const Fuse = require("../dist/fuse.node.commonjs2.js");

assert(process.env.TESTING_WEB3_PROVIDER_URL, "Web3 provider URL required");
var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL, hre);
hre.ethers.provider = new hre.ethers.providers.Web3Provider(fuse.web3.currentProvider);

var erc20Abi = JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi);
var cErc20Abi = JSON.parse(fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi);
var cEtherAbi = JSON.parse(fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi);

// Snapshot + revert + dry run wrapper function
var snapshotId = null;

function snapshot() {
  return new Promise(function(resolve, reject) {
    fuse.web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_snapshot",
      id: 1
    }, function(err, result) {
      if (err) return reject(err);
      snapshotId = result.result;
      resolve();
    });
  });
}

function revert() {
  return new Promise(function(resolve, reject) {
    assert(snapshotId !== null);
    fuse.web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_revert",
      params: [snapshotId],
      id: new Date().getTime()
    }, function(err, result) {
      if (err) return reject(err);
      assert(result.result);
      resolve();
    });
  });
}

function dryRun(promise) {
  return async function() {
    await snapshot();
    var error = null;

    try {
      await promise();
    } catch (_error) {
      error = _error;
    }

    await revert();
    if (error !== null) throw error;
  }
}

// hardhat_impersonateAccount
function impersonateAccount(account) {
  return new Promise(function(resolve, reject) {
    fuse.web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "hardhat_impersonateAccount",
      params: [account],
      id: new Date().getTime()
    }, function(err, result) {
      if (err) return reject(err);
      assert(result.result);
      resolve();
    });
  });
}

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

// Set CERC20_DELEGATE_CONTRACT_ADDRESS
Fuse.CERC20_DELEGATE_CONTRACT_ADDRESS = "0x2b3dd0ae288c13a730f6c422e2262a9d3da79ed1";

// LiquidationStrategy enum
const LIQUIDATION_STRATEGIES = {
  CurveLpToken: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
  CurveLiquidityGaugeV2: "0x59b670e9fA9D0A427751Af201D676719a970857b",
  UniswapLpToken: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
  YearnYVaultV1: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
  YearnYVaultV2: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
  BalancerPoolToken: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
  SynthetixSynth: "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8",
  PoolTogether: "0x82e01223d51Eb87e16A03E24687EDF0F294da6f1",
  CurveSwap: "0x4c5859f0F772848b2D91F1D83E2Fe57935348029",
  UniswapV1: "0x1291Be112d480055DaFd8a610b7d1e203891C274",
  UniswapV2: "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154",
  SOhm: "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
  WSTEth: "0xCD8a1C3ba11CF5ECfa6267617243239504a98d90",
  SushiBar: "0x82e01223d51Eb87e16A03E24687EDF0F294da6f1",
  UniswapV3: "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3"
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
  if (strategy == "CurveLiquidityGaugeV2") {
    // Get coins underlying LP token underling gauge
    var gaugeAbi = [{"name":"lp_token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871}];
    var gauge = new fuse.web3.eth.Contract(gaugeAbi, token);
    token = await gauge.methods.lp_token().call();
    strategy = "CurveLpToken";
  }

  if (strategy == "CurveLpToken") {
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

      // Break if coin is ETH or WETH
      if (coins[i].toLowerCase() == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" || coins[i].toLowerCase() == Fuse.WETH_ADDRESS.toLowerCase()) {
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

  if (strategy == "CurveSwap") {
    // Get Curve pool for token => WETH
    var registryAbi = [{"name":"find_pool_for_coins","outputs":[{"type":"address","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"}],"stateMutability":"view","type":"function"},{"name":"get_coin_indices","outputs":[{"type":"int128","name":""},{"type":"int128","name":""},{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_pool"},{"type":"address","name":"_from"},{"type":"address","name":"_to"}],"stateMutability":"view","type":"function","gas":27456}];
    var registry = new fuse.web3.eth.Contract(registryAbi, "0x7D86446dDb609eD0F5f8684AcF30380a356b2B4c");
    var pool = await registry.methods.find_pool_for_coins(token, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE").call();
    var indices = await registry.methods.get_coin_indices(pool, token, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE").call();

    // Return strategy data and Uniswap V2 router
    return [fuse.web3.eth.abi.encodeParameters(['address', 'int128', 'int128', 'address'], [pool, indices["0"], indices["1"], "0x0000000000000000000000000000000000000000"]), UNISWAP_V2_PROTOCOLS.Uniswap.router];
  }
}

// Assets to be added to pool
const testAssetFixtures = [
  { name: "Fuse ETH", symbol: "f123-ETH", underlying: "0x0000000000000000000000000000000000000000", price: Fuse.Web3.utils.toBN(1e18) },
  { name: "Fuse USDC", symbol: "f123-USDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", price: "421407501053518000000000000" },
  { name: "Fuse DAI", symbol: "f123-DAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", price: "421407501053518" },
  { name: "Fuse linkCRV", symbol: "f123-linkCRV", underlying: "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", price: "14810827631962988" },
  { name: "Fuse linkCRV-gauge", symbol: "f123-linkCRV-gauge", underlying: "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", price: "14810827631962988" },
  { name: "Fuse yUSDC", symbol: "f123-yUSDC", underlying: "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", price: "461407501053518000000000000" }, // yVault V1
  { name: "Fuse yvDAI", symbol: "f123-yvDAI", underlying: "0x19D3364A399d251E894aC732651be8B0E4e85001", price: "421407501053518" }, // yVault V2
  { name: "Fuse Uniswap DAI-ETH", symbol: "f123u-DAI-ETH", underlying: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", price: "42140750105351800" },
  { name: "Fuse Balancer WETH-50-WBTC-50", symbol: "f123b-WETH-50-WBTC-50", underlying: "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", price: "100000000000000000000" }, // BPT WETH-WBTC
  { name: "Fuse yvlinkCRV", symbol: "f123-yvlinkCRV", underlying: "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", price: "14810827631962988" }, // crvLINK yVault V1
  { name: "Fuse yvCurve-sETH", symbol: "f123-yvCurve-sETH", underlying: "0x986b4AFF588a109c09B50A03f42E4110E29D353F", price: "1879096400000000000" }, // eCRV yVault V2
  { name: "Fuse sEUR", symbol: "f123-sEUR", underlying: "0xd71ecff9342a5ced620049e616c5035f1db98620", price: "421407501053518" },
  { name: "Fuse PcUSDC", symbol: "f123-PcUSDC", underlying: "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", price: "421407501053518000000000000" },
  { name: "Fuse stETH", symbol: "f123-stETH", underlying: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", price: "1000000000000000000" },
  { name: "Fuse sOHM", symbol: "f123-sOHM", underlying: "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", price: "100000000000000000000000000" },
  { name: "Fuse wstETH", symbol: "f123-wstETH", underlying: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", price: "920000000000000000" },
  { name: "Fuse SOCKS", symbol: "f123-SOCKS", underlying: "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", price: "16000000000000000000" },
  { name: "Fuse xSUSHI", symbol: "f123-xSUSHI", underlying: "0x8798249c2e607446efb7ad49ec89dd1865ff4272", price: "4500000000000000" }
];

describe('FuseSafeLiquidator', function() {
  this.timeout(30000);
  var accounts, assetAddresses, comptroller, simplePriceOracle;

  before(async function() {
    this.timeout(60000);
    accounts = ["0x45D54B22582c79c8Fb8f4c4F2663ef54944f397a", "0x1Eeb75CFad36EDb6C996f7809f30952B0CA0B5B9", "0x10dB6Bce3F2AE1589ec91A872213DAE59697967a"];

    // Impersonate accounts
    if (process.env.HARDHAT_IMPERSONATE) for (const account of accounts) await impersonateAccount(account);

    // Whitelist accounts[0] as deployer
    await fuse.contracts.FusePoolDirectory.methods._whitelistDeployers([accounts[0]]).send({ from: "0x10dB6Bce3F2AE1589ec91A872213DAE59697967a" });

    // Deploy liquidation strategies
    if (process.env.HARDHAT_IMPERSONATE) for (const strategy of Object.keys(LIQUIDATION_STRATEGIES)) {
      const contractFactory = await fuse.hre.ethers.getContractFactory(strategy + "Liquidator");
      const contract = await contractFactory.deploy();
      LIQUIDATION_STRATEGIES[strategy] = contract.address;
    }

    // Send tokens to accounts[0]
    // Block 12680852
    var tokensNeeded = [
      [
        "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a",
        "0xee1f07f88934c2811e3dcabdf438d975c3d62cd3",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d",
        "0xd47ca06c4866318ff9680695e39aa3a5bd337fbd",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "0xe19b0990735b625920972b0743403fbaf08ef8b2",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e6))
      ],
      [
        "0x19D3364A399d251E894aC732651be8B0E4e85001", "0xe8e8f41ed29e46f34e206d7d2a7d6f735a3ff2cb",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", "0x31d9377e7500ebc345b821a9740005e280c904fd",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x986b4AFF588a109c09B50A03f42E4110E29D353F", "0x577ebc5de943e35cdf9ecb5bbe1f7d7cb6c7c647",
        Fuse.Web3.utils.toBN(100).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "0xd916127b40e3383fcc09ab8feaae0f2a6a1300c1",
        Fuse.Web3.utils.toBN(100).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "0x438fd34eab0e80814a231a983d8bfaf507ae16d4",
        Fuse.Web3.utils.toBN(10).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0xd71ecff9342a5ced620049e616c5035f1db98620", "0xe896e539e557bc751860a7763c8dd589af1698ce",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", "0xb0b0f6f13a5158eb67724282f586a552e75b5728",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e6))
      ],
      [
        "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "0x62e41b1185023bcc14a465d350e1dde341557925",
        Fuse.Web3.utils.toBN(100).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", "0x1512c7c4a4266dc9a56b1f21c8cb19e13410e684",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e9))
      ],
      [
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", "0xf9ce182b0fbe597773ab9bb5159b7479047de8fe",
        Fuse.Web3.utils.toBN(10).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "0xb9fddbd225b6c8cc24ce193e5fb95db76d783f2d",
        Fuse.Web3.utils.toBN(1).mul(Fuse.Web3.utils.toBN(1e18))
      ],
      [
        "0x8798249c2e607446efb7ad49ec89dd1865ff4272", "0xf977814e90da44bfa03b6295a0616a897441acec",
        Fuse.Web3.utils.toBN(1000).mul(Fuse.Web3.utils.toBN(1e18))
      ],
    ];

    for (const [tokenAddress, sender, amount] of tokensNeeded) {
      if (process.env.HARDHAT_IMPERSONATE) await impersonateAccount(sender);
      var token = new fuse.web3.eth.Contract(erc20Abi, tokenAddress);
      if (Fuse.Web3.utils.toBN(await token.methods.balanceOf(accounts[0]).call()).lt(amount)) await token.methods.transfer(accounts[0], amount).send({ from: sender });
    }

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
    if (liquidationStrategy === undefined) liquidationStrategy = [];
    else if (typeof liquidationStrategy == "string") liquidationStrategy = [LIQUIDATION_STRATEGIES[liquidationStrategy]];
    else for (var i = 0; i < liquidationStrategy.length; i++) liquidationStrategy[i] = LIQUIDATION_STRATEGIES[liquidationStrategy[i]];
    if (strategyData === undefined || strategyData === "0x0") strategyData = Array(liquidationStrategy.length).fill("0x0");
    else if (typeof strategyData == "string") strategyData = [strategyData];
    if (uniswapV2RouterForCollateral === undefined) uniswapV2RouterForCollateral = UNISWAP_V2_PROTOCOLS.Uniswap.router;

    // Check balance before liquidation
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());

    // Liquidate borrow
    var repayAmount = Fuse.Web3.utils.toBN(1e13);
    await (flashLoan ? fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToEthWithFlashLoan(accounts[0], repayAmount, assetAddresses["0x0000000000000000000000000000000000000000"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData, 0).send({ from: accounts[0], gasPrice: "0", gas: 10e6 }) : fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], assetAddresses["0x0000000000000000000000000000000000000000"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6, value: repayAmount }));

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
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["0x6b175474e89094c44da98b954eedeac495271d0f"], assetAddresses["0x0000000000000000000000000000000000000000"], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x0000000000000000000000000000000000000000"], ["0x0"], 0).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e16)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["0x6b175474e89094c44da98b954eedeac495271d0f"], assetAddresses["0x0000000000000000000000000000000000000000"], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x0000000000000000000000000000000000000000"], ["0x0"]).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
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
    if (liquidationStrategy === undefined) liquidationStrategy = [];
    else if (typeof liquidationStrategy == "string") liquidationStrategy = [LIQUIDATION_STRATEGIES[liquidationStrategy]];
    else for (var i = 0; i < liquidationStrategy.length; i++) liquidationStrategy[i] = LIQUIDATION_STRATEGIES[liquidationStrategy[i]];
    if (strategyData === undefined || strategyData === "0x0") strategyData = Array(liquidationStrategy.length).fill("0x0");
    else if (typeof strategyData == "string") strategyData = [strategyData];
    if (uniswapV2RouterForCollateral === undefined) uniswapV2RouterForCollateral = UNISWAP_V2_PROTOCOLS.Uniswap.router;

    // Check balance before liquidation
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());

    // Liquidate borrow
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, UNISWAP_V2_PROTOCOLS.Uniswap.router, uniswapV2RouterForCollateral, liquidationStrategy, strategyData, 0).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e4)).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"], assetAddresses[tokenCollateral.toLowerCase()], 0, exchangeTo, uniswapV2RouterForCollateral, liquidationStrategy, strategyData).send({ from: accounts[0], gasPrice: "0", gas: 10e6 });
    }

    // Assert balance after liquidation > balance before liquidation
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  }

  describe('#safeLiquidate()', function() {
    // Safe liquidate ETH borrow
    it('should liquidate an ETH borrow for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral() }));
    
    // Safe liquidate token borrows
    it('should liquidate a token borrow for ETH collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral() }));
    it('should liquidate a token borrow for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral() }));
    
    // Safe liquidate ETH borrow + exchange seized collateral
    it('should liquidate an ETH borrow for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000") }));
    it('should liquidate an ETH borrow for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));

    // Safe liquidate token borrow + exchange seized collateral
    it('should liquidate a token borrow for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));
    it('should liquidate a token borrow for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000") }));
    it('should liquidate a token borrow for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));

    // Safe liquidate ETH borrow using Curve LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));
    it('should liquidate an ETH borrow for Curve LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));

    // Safe liquidate token borrow using Curve LP token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));
    it('should liquidate a token borrow for Curve LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));

    // Safe liquidate ETH borrow using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));
    it('should liquidate an ETH borrow for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));
    
    // Safe liquidate token borrow using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));
    it('should liquidate a token borrow for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));

    // Safe liquidate ETH borrow using yVault V1 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for yVault V1 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow for yVault V1 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow using yVault V1 token collateral + exchange seized collateral
    it('should liquidate a token borrow for yVault V1 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow for yVault V1 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", false, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow using yVault V2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for yVault V2 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow for yVault V2 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow using yVault V2 token collateral + exchange seized collateral
    it('should liquidate a token borrow for yVault V2 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow for yVault V2 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow using Curve yVault V1 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve yVault V1 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate an ETH borrow for Curve yVault V1 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate token borrow using Curve yVault V1 token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve yVault V1 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate a token borrow for Curve yVault V1 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate ETH borrow using Curve yVault V2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Curve yVault V2 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate an ETH borrow for Curve yVault V2 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate token borrow using Curve yVault V2 token collateral + exchange seized collateral
    it('should liquidate a token borrow for Curve yVault V2 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate a token borrow for Curve yVault V2 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate ETH borrow using Uniswap LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Uniswap LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow for Uniswap LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow using Uniswap LP token collateral + exchange seized collateral
    it('should liquidate a token borrow for Uniswap LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow for Uniswap LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow using Balancer Pool Token (BPT) collateral + exchange seized collateral
    it('should liquidate an ETH borrow for Balancer Pool Token (BPT) collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow for Balancer Pool Token (BPT) collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow using Balancer Pool Token (BPT) collateral + exchange seized collateral
    it('should liquidate a token borrow for Balancer Pool Token (BPT) collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", false, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow for Balancer Pool Token (BPT) collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", false, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
  });

  describe('#safeLiquidateToEthWithFlashLoan()', function() {
    // Safe liquidate ETH borrow with flashloan
    it('should liquidate an ETH borrow (using a flash swap) for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral(undefined, true) }));
    
    // Safe liquidate ETH borrow with flashloan + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    
    // Safe liquidate ETH borrow with flashloan + exchange seized collateral (using SushiSwap for exchanging collateral)
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate ETH borrow with flashloan using Curve LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve LP collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve LP collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));

    // Safe liquidate ETH borrow with flashloan using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));

    // Safe liquidate ETH borrow with flashloan using yVault V1 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for yVault V1 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for yVault V1 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using yVault V2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for yVault V2 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for yVault V2 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using Curve yVault V1 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve yVault V1 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve yVault V1 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate ETH borrow with flashloan using Curve yVault V2 token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Curve yVault V2 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate an ETH borrow (using a flash swap) for Curve yVault V2 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate ETH borrow with flashloan using Uniswap LP token collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Uniswap LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for Uniswap LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using Balancer Pool Token (BPT) collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for Balancer Pool Token (BPT) collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for Balancer Pool Token (BPT) collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using Synthetix sEUR collateral + exchange seized collateral
    // TODO: Doesn't work because of fee reclamation right now but may work in the future due to SIP-120: https://github.com/Synthetixio/SIPs/blob/master/sips/sip-120.md
    /* it('should liquidate an ETH borrow (using a flash swap) for Synthetix sEUR collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xd71ecff9342a5ced620049e616c5035f1db98620", "SynthetixSynth", fuse.web3.eth.abi.encodeParameters(["address"], ["0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb"]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for Synthetix sEUR collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xd71ecff9342a5ced620049e616c5035f1db98620", "SynthetixSynth", fuse.web3.eth.abi.encodeParameters(["address"], ["0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb"]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); */

    // Safe liquidate ETH borrow with flashloan using PoolTogether PcUSDC collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for PoolTogether PcUSDC collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", "PoolTogether", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for PoolTogether PcUSDC collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", "PoolTogether", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using token collateral (via 0x) + exchange seized collateral
    // TODO: Going to have to calculate the input amount (i.e. collateral seized)
    /* function get0xQuote(sellToken) {
      var decoded = (await axios.get('https://api.0x.org/swap/v1/quote?sellToken=' + sellToken + '&buyToken=WETH&sellAmount=1000000000000000000', {
        params: {
          vs_currencies: "eth",
          sellAmount: tokenAddress
        }
      })).data;
      if (!decoded || !decoded[tokenAddress]) throw "Failed to decode price of " + tokenAddress + " from CoinGecko";
      return [res.to, res.data];
    }
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via 0x) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "ZeroEx", fuse.web3.eth.abi.encodeParameters(["address"], [Fuse.WETH_ADDRESS]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via 0x) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "ZeroEx", fuse.web3.eth.abi.encodeParameters(["address"], [Fuse.WETH_ADDRESS]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); */

    // Safe liquidate ETH borrow with flashloan using token collateral (via Curve) + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Curve) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap", ...await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap")) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Curve) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap", ...await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap")) }));

    // Safe liquidate ETH borrow with flashloan using sOHM collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for sOHM collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", ["SOhm", "UniswapV2"], ["0x0", fuse.web3.eth.abi.encodeParameters(["address", "address[]"], [UNISWAP_V2_PROTOCOLS.SushiSwap.router, ["0x383518188c0c6d7730d91b2c03a03c837814a899", "0x6b175474e89094c44da98b954eedeac495271d0f"]])], UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for sOHM collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", ["SOhm", "UniswapV2"], ["0x0", fuse.web3.eth.abi.encodeParameters(["address", "address[]"], [UNISWAP_V2_PROTOCOLS.SushiSwap.router, ["0x383518188c0c6d7730d91b2c03a03c837814a899", "0x6b175474e89094c44da98b954eedeac495271d0f"]])], UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate ETH borrow with flashloan using wstETH collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for wstETH collateral and exchange to ETH', dryRun(async () => { var [strategyData, bestUniswapV2Router] = await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap"); await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", ["WSTEth", "CurveSwap"], ["0x0", strategyData], bestUniswapV2Router) }));
    it('should liquidate an ETH borrow (using a flash swap) for wstETH collateral and exchange to another token', dryRun(async () => { var [strategyData, bestUniswapV2Router] = await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap"); await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", ["WSTEth", "CurveSwap"], ["0x0", strategyData], bestUniswapV2Router) }));

    // Safe liquidate ETH borrow with flashloan using token collateral (via Uniswap V1 liquidator) + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Uniswap V1 liquidator) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Uniswap V1 liquidator) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example

    // Safe liquidate ETH borrow with flashloan using xSUSHI collateral + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for xSUSHI collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x8798249c2e607446efb7ad49ec89dd1865ff4272", "SushiBar", undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for xSUSHI collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x8798249c2e607446efb7ad49ec89dd1865ff4272", "SushiBar", undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate ETH borrow with flashloan using token collateral (via Uniswap V3 liquidator) + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Uniswap V3 liquidator) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV3", fuse.web3.eth.abi.encodeParameters(["address", "address", "uint24"], ["0xe592427a0aece92de3edee1f18e0157c05861564", Fuse.WETH_ADDRESS, 10000]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
    it('should liquidate an ETH borrow (using a flash swap) for token collateral (via Uniswap V3 liquidator) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV3", fuse.web3.eth.abi.encodeParameters(["address", "address", "uint24"], ["0xe592427a0aece92de3edee1f18e0157c05861564", Fuse.WETH_ADDRESS, 10000]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
  });

  describe('#safeLiquidateToTokensWithFlashLoan()', function() {
    // Safe liquidate token borrow with flashloan
    it('should liquidate a token borrow (using a flash swap) for ETH collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral(undefined, true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral(undefined, true) }));
    
    // Safe liquidate token borrow with flashloan + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    
    // Safe liquidate token borrow with flashloan + exchange seized collateral (using SushiSwap for exchanging collateral)
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token (using SushiSwap for exchanging collateral)', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x6b175474e89094c44da98b954eedeac495271d0f", undefined, undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate token borrow with flashloan using Curve LP token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve LP collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));
    it('should liquidate a token borrow (using a flash swap) for Curve LP collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken", ...await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken")) }));

    // Safe liquidate token borrow with flashloan using Curve LiquidityGaugeV2 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));
    it('should liquidate a token borrow (using a flash swap) for Curve LiquidityGaugeV2 token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2", ...await getLiquidationStrategyData("0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d", "CurveLiquidityGaugeV2")) }));

    // Safe liquidate token borrow with flashloan using yVault V1 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for yVault V1 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for yVault V1 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x6b175474e89094c44da98b954eedeac495271d0f", true, "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e", "YearnYVaultV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using yVault V2 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for yVault V2 collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for yVault V2 collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x19D3364A399d251E894aC732651be8B0E4e85001", "YearnYVaultV2", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using Curve yVault V1 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve yVault V1 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate a token borrow (using a flash swap) for Curve yVault V1 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a", "CurveLpToken"); // Underlying linkCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6", ["YearnYVaultV1", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate token borrow with flashloan using Curve yVault V2 token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Curve yVault V2 collateral and exchange to ETH', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));
    it('should liquidate a token borrow (using a flash swap) for Curve yVault V2 collateral and exchange to another token', dryRun(async () => {
      var [curveLpTokenStrategyData, uniswapV2Router] = await getLiquidationStrategyData("0xa3d87fffce63b53e0d54faa1cc983b7eb0b74a9c", "CurveLpToken"); // Underlying eCRV token
      await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x986b4AFF588a109c09B50A03f42E4110E29D353F", ["YearnYVaultV2", "CurveLpToken"], ["0x0", curveLpTokenStrategyData], uniswapV2Router);
    }));

    // Safe liquidate token borrow with flashloan using Uniswap LP token collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Uniswap LP token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for Uniswap LP token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "UniswapLpToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[]', 'address[]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], []]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using Balancer Pool Token (BPT) collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for Balancer Pool Token (BPT) collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for Balancer Pool Token (BPT) collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5", "BalancerPoolToken", fuse.web3.eth.abi.encodeParameters(['address', 'address[][]'], [UNISWAP_V2_PROTOCOLS.Uniswap.router, [[], ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]]]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using Synthetix sEUR collateral + exchange seized collateral
    // TODO: Doesn't work because of fee reclamation right now but may work in the future due to SIP-120: https://github.com/Synthetixio/SIPs/blob/master/sips/sip-120.md
    /* it('should liquidate a token borrow (using a flash swap) for Synthetix sEUR collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xd71ecff9342a5ced620049e616c5035f1db98620", "SynthetixSynth", fuse.web3.eth.abi.encodeParameters(["address"], ["0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb"]), UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for Synthetix sEUR collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xd71ecff9342a5ced620049e616c5035f1db98620", "SynthetixSynth", fuse.web3.eth.abi.encodeParameters(["address"], ["0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb"]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); */

    // Safe liquidate token borrow with flashloan using PoolTogether PcUSDC collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for PoolTogether PcUSDC collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", "PoolTogether", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for PoolTogether PcUSDC collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xd81b1a8b1ad00baa2d6609e0bae28a38713872f7", "PoolTogether", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using token collateral (via Curve) + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Curve) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap", ...await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap")) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Curve) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap", ...await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap")) }));

    // Safe liquidate token borrow with flashloan using sOHM collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for sOHM collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", ["SOhm", "UniswapV2"], ["0x0", fuse.web3.eth.abi.encodeParameters(["address", "address[]"], [UNISWAP_V2_PROTOCOLS.SushiSwap.router, ["0x383518188c0c6d7730d91b2c03a03c837814a899", "0x6b175474e89094c44da98b954eedeac495271d0f"]])], UNISWAP_V2_PROTOCOLS.Uniswap.router) }));
    it('should liquidate a token borrow (using a flash swap) for sOHM collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", ["SOhm", "UniswapV2"], ["0x0", fuse.web3.eth.abi.encodeParameters(["address", "address[]"], [UNISWAP_V2_PROTOCOLS.SushiSwap.router, ["0x383518188c0c6d7730d91b2c03a03c837814a899", "0x6b175474e89094c44da98b954eedeac495271d0f"]])], UNISWAP_V2_PROTOCOLS.Uniswap.router) }));

    // Safe liquidate token borrow with flashloan using wstETH collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for wstETH collateral and exchange to ETH', dryRun(async () => { var [strategyData, bestUniswapV2Router] = await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap"); await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", ["WSTEth", "CurveSwap"], ["0x0", strategyData], bestUniswapV2Router) }));
    it('should liquidate a token borrow (using a flash swap) for wstETH collateral and exchange to another token', dryRun(async () => { var [strategyData, bestUniswapV2Router] = await getLiquidationStrategyData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84", "CurveSwap"); await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", ["WSTEth", "CurveSwap"], ["0x0", strategyData], bestUniswapV2Router) }));

    // Safe liquidate token borrow with flashloan using token collateral (via Uniswap V1 liquidator) + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Uniswap V1 liquidator) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Uniswap V1 liquidator) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV1", undefined, UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example

    // Safe liquidate token borrow with flashloan using xSUSHI collateral + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for xSUSHI collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x8798249c2e607446efb7ad49ec89dd1865ff4272", "SushiBar", undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));
    it('should liquidate a token borrow (using a flash swap) for xSUSHI collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x8798249c2e607446efb7ad49ec89dd1865ff4272", "SushiBar", undefined, UNISWAP_V2_PROTOCOLS.SushiSwap.router) }));

    // Safe liquidate token borrow with flashloan using token collateral (via Uniswap V3 liquidator) + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Uniswap V3 liquidator) and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV3", fuse.web3.eth.abi.encodeParameters(["address", "address", "uint24"], ["0xe592427a0aece92de3edee1f18e0157c05861564", Fuse.WETH_ADDRESS, 10000]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
    it('should liquidate a token borrow (using a flash swap) for token collateral (via Uniswap V3 liquidator) and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true, "0x23b608675a2b2fb1890d3abbd85c5775c51691d5", "UniswapV3", fuse.web3.eth.abi.encodeParameters(["address", "address", "uint24"], ["0xe592427a0aece92de3edee1f18e0157c05861564", Fuse.WETH_ADDRESS, 10000]), UNISWAP_V2_PROTOCOLS.Uniswap.router) })); // SOCKS as an example
  });
});

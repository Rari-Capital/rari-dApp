var assert = require('assert');
var Big = require('big.js');

const Fuse = require("../dist/fuse.node.commonjs2.js");

assert(process.env.TESTING_WEB3_PROVIDER_URL, "Web3 provider URL required");
var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

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

describe('FuseSafeLiquidator', function() {
  this.timeout(10000);
  var accounts, assetAddresses, comptroller, simplePriceOracle;

  before(async function() {
    this.timeout(20000);
    accounts = await fuse.web3.eth.getAccounts();

    // Deploy pool
    var [poolAddress, priceOracleAddress] = await deployPool({ priceOracle: "SimplePriceOracle" }, { from: accounts[0], gasPrice: "0" });
    comptroller = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi), poolAddress);

    // Set initial token prices
    simplePriceOracle = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/SimplePriceOracle.sol:SimplePriceOracle"].abi), priceOracleAddress);
    await simplePriceOracle.methods.setDirectPrice("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "1544553534389820000000000000").send({ from: accounts[0], gasPrice: "0" });
    await simplePriceOracle.methods.setDirectPrice("0x6b175474e89094c44da98b954eedeac495271d0f", "1544553534389820").send({ from: accounts[0], gasPrice: "0" });
    await simplePriceOracle.methods.setDirectPrice("0x0000000000000000000000000000000000000000", Fuse.Web3.utils.toBN(1e18)).send({ from: accounts[0], gasPrice: "0" });

    // Deploy assets
    assetAddresses = {};
    for (const conf of [
      { name: "Fuse ETH", symbol: "fETH" },
      { name: "Fuse USDC", symbol: "fUSDC", underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { name: "Fuse DAI", symbol: "fDAI", underlying: "0x6b175474e89094c44da98b954eedeac495271d0f" }
    ]) assetAddresses[conf.symbol] = await deployAsset({ comptroller: poolAddress, ...conf }, undefined, undefined, undefined, { from: accounts[0], gasPrice: "0" }, true);
  });

  async function setupUnhealthyEthBorrowWithTokenCollateral() {
    // Supply DAI
    var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["fDAI"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(1e18)).send({ from: accounts[0], gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(1e18)).send({ from: accounts[0], gasPrice: "0" });

    // Supply ETH from other account
    var cToken = new fuse.web3.eth.Contract(cEtherAbi, assetAddresses["fETH"]);
    await cToken.methods.mint().send({ from: accounts[1], gasPrice: "0", value: Fuse.Web3.utils.toBN(1e16) });

    // Borrow ETH using DAI as collateral
    await comptroller.methods.enterMarkets([assetAddresses["fDAI"]]).send({ from: accounts[0], gasPrice: "0" });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e15)).send({ from: accounts[0], gasPrice: "0" });

    // Set price of DAI collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice("0x6b175474e89094c44da98b954eedeac495271d0f", "154455353438982").send({ from: accounts[0], gasPrice: "0" });
  }

  async function setupUnhealthyTokenBorrowWithEthCollateral() {
    // Supply ETH
    var cToken = new fuse.web3.eth.Contract(cEtherAbi, assetAddresses["fETH"]);
    await cToken.methods.mint().send({ from: accounts[0], gasPrice: "0", value: Fuse.Web3.utils.toBN(1e15) });

    // Supply DAI from other account
    var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["fDAI"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[1], gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[1], gasPrice: "0" });

    // Borrow DAI using ETH as collateral
    await comptroller.methods.enterMarkets([assetAddresses["fETH"]]).send({ from: accounts[0], gasPrice: "0" });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e17)).send({ from: accounts[0], gasPrice: "0" });

    // Set price of ETH collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice("0x0000000000000000000000000000000000000000", Fuse.Web3.utils.toBN(1e17)).send({ from: accounts[0], gasPrice: "0" });
  }

  async function setupUnhealthyTokenBorrowWithTokenCollateral() {
    // Supply DAI
    var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["fDAI"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[0], gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(5e17)).send({ from: accounts[0], gasPrice: "0" });

    // Supply USDC from other account
    var token = new fuse.web3.eth.Contract(erc20Abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    var cToken = new fuse.web3.eth.Contract(cErc20Abi, assetAddresses["fUSDC"]);
    await token.methods.approve(cToken.options.address, Fuse.Web3.utils.toBN(1e6)).send({ from: accounts[1], gasPrice: "0" });
    await cToken.methods.mint(Fuse.Web3.utils.toBN(1e6)).send({ from: accounts[1], gasPrice: "0" });

    // Borrow USDC using DAI as collateral
    await comptroller.methods.enterMarkets([assetAddresses["fDAI"]]).send({ from: accounts[0], gasPrice: "0" });
    await cToken.methods.borrow(Fuse.Web3.utils.toBN(1e5)).send({ from: accounts[0], gasPrice: "0" });

    // Set price of DAI collateral to 1/10th of what it was
    await simplePriceOracle.methods.setDirectPrice("0x6b175474e89094c44da98b954eedeac495271d0f", "154455353438982").send({ from: accounts[0], gasPrice: "0" });
  }

  async function setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral(exchangeTo, flashLoan) {
    await setupUnhealthyEthBorrowWithTokenCollateral();
    if (exchangeTo === undefined) exchangeTo = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    await (flashLoan ? fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToEthWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e14), assetAddresses["fETH"], assetAddresses["fDAI"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0" }) : fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], assetAddresses["fETH"], assetAddresses["fDAI"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0", value: Fuse.Web3.utils.toBN(1e14) }));
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  }

  async function setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral(exchangeTo, flashLoan) {
    await setupUnhealthyTokenBorrowWithEthCollateral();
    if (exchangeTo === undefined) exchangeTo = "0x0000000000000000000000000000000000000000";
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["fDAI"], assetAddresses["fETH"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0" });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0x6b175474e89094c44da98b954eedeac495271d0f");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e16)).send({ from: accounts[0], gasPrice: "0" });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e16), assetAddresses["fDAI"], assetAddresses["fETH"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0" });
    }
    const liquidatorBalanceAfterLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    assert(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  }

  async function setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral(exchangeTo, flashLoan) {
    await setupUnhealthyTokenBorrowWithTokenCollateral();
    if (exchangeTo === undefined) exchangeTo = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const liquidatorBalanceBeforeLiquidation = exchangeTo === "0x0000000000000000000000000000000000000000" ? Fuse.Web3.utils.toBN(await fuse.web3.eth.getBalance(accounts[0])) : Fuse.Web3.utils.toBN(await (new fuse.web3.eth.Contract(erc20Abi, exchangeTo)).methods.balanceOf(accounts[0]).call());
    if (flashLoan) await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidateToTokensWithFlashLoan(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["fUSDC"], assetAddresses["fDAI"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0" });
    else {
      var token = new fuse.web3.eth.Contract(erc20Abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      await token.methods.approve(fuse.contracts.FuseSafeLiquidator.options.address, Fuse.Web3.utils.toBN(1e4)).send({ from: accounts[0], gasPrice: "0" });
      await fuse.contracts.FuseSafeLiquidator.methods.safeLiquidate(accounts[0], Fuse.Web3.utils.toBN(1e4), assetAddresses["fUSDC"], assetAddresses["fDAI"], 0, exchangeTo).send({ from: accounts[0], gasPrice: "0" });
    }
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
    it('should liquidate a token borrow for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));

    // Safe liquidate token borrow + exchange seized collateral
    it('should liquidate a token borrow for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000") }));
    it('should liquidate a token borrow for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623") }));
  });

  describe('#safeLiquidateToEthWithFlashLoan()', function() {
    // Safe liquidate ETH borrow with flashloan
    it('should liquidate an ETH borrow (using a flash swap) for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral(undefined, true) }));
    
    // Safe liquidate ETH borrow with flashloan + exchange seized collateral
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate an ETH borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyEthBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
  });

  describe('#safeLiquidateToTokensWithFlashLoan()', function() {
    // Safe liquidate token borrow with flashloan
    it('should liquidate a token borrow (using a flash swap) for ETH collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral(undefined, true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral(undefined, true) }));
    
    // Safe liquidate token borrow with flashloan + exchange seized collateral
    it('should liquidate a token borrow (using a flash swap) for ETH collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithEthCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to ETH', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0x0000000000000000000000000000000000000000", true) }));
    it('should liquidate a token borrow (using a flash swap) for token collateral and exchange to another token', dryRun(async () => { await setupAndLiquidateUnhealthyTokenBorrowWithTokenCollateral("0xD291E7a03283640FDc51b121aC401383A46cC623", true) }));
  });
});
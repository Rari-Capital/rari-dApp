const fs = require('fs');

var compoundContracts = require(__dirname + "/../src/contracts/compound-protocol.json").contracts;
var openOracleContracts = require(__dirname + "/../src/contracts/open-oracle.json").contracts;

var minContracts = {};
var usedContractAbiKeys = [
  "contracts/Comptroller.sol:Comptroller",
  "contracts/Unitroller.sol:Unitroller",
  "contracts/PreferredPriceOracle.sol:PreferredPriceOracle",
  "contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle",
  "contracts/SimplePriceOracle.sol:SimplePriceOracle",
  "contracts/Keep3rPriceOracle.sol:Keep3rPriceOracle",
  "contracts/MasterPriceOracle.sol:MasterPriceOracle",
  "contracts/RecursivePriceOracle.sol:RecursivePriceOracle",
  "contracts/YVaultPriceOracle.sol:YVaultPriceOracle",
  "contracts/AlphaHomoraV1PriceOracle.sol:AlphaHomoraV1PriceOracle",
  "contracts/CEtherDelegate.sol:CEtherDelegate",
  "contracts/CEtherDelegator.sol:CEtherDelegator",
  "contracts/EIP20Interface.sol:EIP20Interface",
  "contracts/CErc20Delegate.sol:CErc20Delegate",
  "contracts/CErc20Delegator.sol:CErc20Delegator",
  "contracts/CTokenInterfaces.sol:CTokenInterface",
  "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel",
  "contracts/JumpRateModel.sol:JumpRateModel",
  "contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2",
];
for (const contractKey of usedContractAbiKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].abi = compoundContracts[contractKey].abi;
}
var usedContractBinKeys = [
  "contracts/Comptroller.sol:Comptroller",
  "contracts/Unitroller.sol:Unitroller",
  "contracts/PreferredPriceOracle.sol:PreferredPriceOracle",
  "contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle",
  "contracts/SimplePriceOracle.sol:SimplePriceOracle",
  "contracts/Keep3rPriceOracle.sol:Keep3rPriceOracle",
  "contracts/MasterPriceOracle.sol:MasterPriceOracle",
  "contracts/RecursivePriceOracle.sol:RecursivePriceOracle",
  "contracts/YVaultPriceOracle.sol:YVaultPriceOracle",
  "contracts/AlphaHomoraV1PriceOracle.sol:AlphaHomoraV1PriceOracle",
  "contracts/CEtherDelegate.sol:CEtherDelegate",
  "contracts/CEtherDelegator.sol:CEtherDelegator",
  "contracts/CErc20Delegate.sol:CErc20Delegate",
  "contracts/CErc20Delegator.sol:CErc20Delegator",
  "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel",
  "contracts/JumpRateModel.sol:JumpRateModel",
  "contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2",
];
for (const contractKey of usedContractBinKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].bin = compoundContracts[contractKey].bin;
}
fs.writeFileSync(__dirname + "/../src/contracts/compound-protocol.min.json", JSON.stringify({ contracts: minContracts }));

minContracts = {};
var usedContractAbiKeys = [
  "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView",
  "contracts/OpenOraclePriceData.sol:OpenOraclePriceData",
  "contracts/Uniswap/UniswapView.sol:UniswapView",
  "contracts/Uniswap/UniswapLpTokenView.sol:UniswapLpTokenView",
];
for (const contractKey of usedContractAbiKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].abi = openOracleContracts[contractKey].abi;
}
var usedContractBinKeys = [
  "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView",
  "contracts/Uniswap/UniswapView.sol:UniswapView",
  "contracts/Uniswap/UniswapLpTokenView.sol:UniswapLpTokenView",
];
for (const contractKey of usedContractBinKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].bin = openOracleContracts[contractKey].bin;
}
fs.writeFileSync(__dirname + "/../src/contracts/open-oracle.min.json", JSON.stringify({ contracts: minContracts }));

const fs = require("fs");

var compoundContracts = require(__dirname +
  "/../src/contracts/compound-protocol.json").contracts;
/* var openOracleContracts = require(__dirname +
  "/../src/contracts/open-oracle.json").contracts; */

var minContracts = {};
var usedContractAbiKeys = [
  "contracts/Comptroller.sol:Comptroller",
  "contracts/Unitroller.sol:Unitroller",
  "contracts/CEtherDelegate.sol:CEtherDelegate",
  "contracts/CEtherDelegator.sol:CEtherDelegator",
  "contracts/EIP20Interface.sol:EIP20Interface",
  "contracts/CErc20Delegate.sol:CErc20Delegate",
  "contracts/CErc20Delegator.sol:CErc20Delegator",
  "contracts/CTokenInterfaces.sol:CTokenInterface",
  "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel",
  "contracts/JumpRateModel.sol:JumpRateModel",
  "contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2", // DAIInterestRateModelV2 NOT IN USE
  "contracts/RewardsDistributor.sol:RewardsDistributor",
  "contracts/JumpRateModelV2.sol:JumpRateModelV2",
  "contracts/ReactiveJumpRateModelV2.sol:ReactiveJumpRateModelV2",
];
if (process.env.NODE_ENV === "development") usedContractAbiKeys.push("contracts/SimplePriceOracle.sol:SimplePriceOracle");
for (const contractKey of usedContractAbiKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].abi = compoundContracts[contractKey].abi;
}
var usedContractBinKeys = [
  "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel",
  "contracts/JumpRateModel.sol:JumpRateModel",
  "contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2", // DAIInterestRateModelV2 NOT IN USE
  "contracts/RewardsDistributor.sol:RewardsDistributor",
  "contracts/JumpRateModelV2.sol:JumpRateModelV2",
  "contracts/ReactiveJumpRateModelV2.sol:ReactiveJumpRateModelV2",
];
if (process.env.NODE_ENV === "development") usedContractBinKeys = usedContractBinKeys.concat([
  "contracts/Comptroller.sol:Comptroller",
  "contracts/Unitroller.sol:Unitroller",
  "contracts/CEtherDelegate.sol:CEtherDelegate",
  "contracts/CEtherDelegator.sol:CEtherDelegator",
  "contracts/CErc20Delegate.sol:CErc20Delegate",
  "contracts/CErc20Delegator.sol:CErc20Delegator",
  "contracts/SimplePriceOracle.sol:SimplePriceOracle",
]);
for (const contractKey of usedContractBinKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].bin = compoundContracts[contractKey].bin;
}
fs.writeFileSync(
  __dirname + "/../src/contracts/compound-protocol.min.json",
  JSON.stringify({ contracts: minContracts })
);

/* minContracts = {};
var usedContractAbiKeys = [
  "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView",
  "contracts/OpenOraclePriceData.sol:OpenOraclePriceData",
  "contracts/Uniswap/UniswapView.sol:UniswapView",
];
for (const contractKey of usedContractAbiKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].abi = openOracleContracts[contractKey].abi;
}
var usedContractBinKeys = [
  "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView",
  "contracts/Uniswap/UniswapView.sol:UniswapView",
];
for (const contractKey of usedContractBinKeys) {
  if (!minContracts[contractKey]) minContracts[contractKey] = {};
  minContracts[contractKey].bin = openOracleContracts[contractKey].bin;
}
fs.writeFileSync(
  __dirname + "/../src/contracts/open-oracle.min.json",
  JSON.stringify({ contracts: minContracts })
);
 */
minContracts = {};
fs.readdirSync(__dirname + "/../src/contracts/oracles/").forEach((file) => {
  var contract = JSON.parse(
    fs.readFileSync(__dirname + "/../src/contracts/oracles/" + file)
  );
  minContracts[contract.contractName] = {
    abi: contract.abi
  };
  if (contract.contractName === "MasterPriceOracle" || process.env.NODE_ENV === "development") minContracts[contract.contractName].bin = contract.bytecode;
});
fs.writeFileSync(
  __dirname + "/../src/contracts/oracles.min.json",
  JSON.stringify({ contracts: minContracts })
);

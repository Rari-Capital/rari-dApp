const Fuse = require("../dist/fuse.node.commonjs2.js");

var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

console.log(
  "ChainlinkPriceOracle:",
  await fuse.deployPriceOracle(
    "ChainlinkPriceOracle",
    { maxSecondsBeforePriceIsStale: 0 },
    { from: accounts[0] }
  )
);

var comptroller = new App.web3.eth.Contract(
  JSON.parse(
    fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
  )
);
comptroller = await comptroller
  .deploy({
    data:
      "0x" +
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].bin,
  })
  .send({ from: accounts[0] });
console.log("Comptroller:", comptroller.options.address);

var cToken = new App.web3.eth.Contract(
  JSON.parse(
    fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
  )
);
cToken = await cToken
  .deploy({
    data:
      "0x" +
      fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].bin,
  })
  .send({ from: accounts[0] });
console.log("CErc20Delegate:", cToken.options.address);

var cToken = new App.web3.eth.Contract(
  JSON.parse(
    fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi
  )
);
cToken = await cToken
  .deploy({
    data:
      "0x" +
      fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].bin,
  })
  .send({ from: accounts[0] });
console.log("CEtherDelegate:", cToken.options.address);

Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_Cream_StablesMajors = await fuse.deployInterestRateModel(
  "JumpRateModel",
  {
    baseRatePerYear: Web3.utils.toBN(2e16).muln(125).divn(100),
    multiplierPerYear: Web3.utils.toBN(2.5e17).muln(125).divn(100),
    jumpMultiplierPerYear: Web3.utils.toBN(5e18).muln(125).divn(100),
    kink: Web3.utils.toBN(8e17),
  },
  { from: accounts[0] }
);
console.log(
  "JumpRateModel (Stables + Majors):",
  Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_StablesMajors
);
Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_Cream_GovSeeds = await fuse.deployInterestRateModel(
  "JumpRateModel",
  {
    baseRatePerYear: Web3.utils.toBN(2e16).muln(125).divn(100),
    multiplierPerYear: Web3.utils.toBN(3.5e17).muln(125).divn(100),
    jumpMultiplierPerYear: Web3.utils.toBN(7.5e18).muln(125).divn(100),
    kink: Web3.utils.toBN(8e17),
  },
  { from: accounts[0] }
);
console.log(
  "JumpRateModel (Gov + Seeds):",
  Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds
);

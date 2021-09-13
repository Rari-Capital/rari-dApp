
(async () => {

const assert = require('assert');
const Big = require('big.js');
const axios = require('axios');

const Fuse = require("../dist/fuse.node.commonjs2.js");

const TESTING_WEB3_PROVIDER_URL = "http://api.rari.capital:21918/"

assert(TESTING_WEB3_PROVIDER_URL, "Web3 provider URL required");
const fuse = new Fuse(TESTING_WEB3_PROVIDER_URL);

const erc20Abi = JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi);
const cErc20Abi = JSON.parse(fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi);
const comptrollerAbi = JSON.parse(fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi);

// Addresses
const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const RGT_TOKEN_ADDRESS = "0xD291E7a03283640FDc51b121aC401383A46cC623"

// 1.) Deploy pool
var [comptrollerAddress] = await fuse.deployPool(
  "BOGGEDD",
  false,
  Fuse.Web3.utils.toBN(0.5e18),
  10,
  Fuse.Web3.utils.toBN(1.1e18),
  "0x1887118e49e0f4a78bd71b792a49de03504a764d",
  {},
  { from: deployer },
  [])


// 1b.) Get Comptroller
const comptroller = new fuse.web3.eth.Contract(
  JSON.parse(
    fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
  ), comptrollerAddress)

// 1c.) Make sure its working
await comptroller.methods.admin().call()

// 2.) Deploy asset
const [cTokenAddress] = await fuse.deployAsset({ name: "Fuse-6 ETH", symbol: "f6-ETH", decimals: 8, comptroller: comptrollerAddress, interestRateModel: "0xb579d2761470bba14018959d6dffcc681c09c04b" }, Fuse.Web3.utils.toBN(0.85e18), "100000000000000000", Fuse.Web3.utils.toBN(0), { from: deployer }, true)

// 2b.) Get cToken
const cToken = new fuse.web3.eth.Contract(
  JSON.parse(
    fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi
  ),
cTokenAddress
);

// 3.) Mint!
await cToken.methods.mint().send({ from: deployer, value: 1e16 })

// 4.) Deploy distributor (this part will become fuseSdk.deployRewardsDistributor)
const distributorInterface = new fuse.web3.eth.Contract(
  JSON.parse(fuse.compoundContracts["contracts/RewardsDistributor.sol:RewardsDistributor"].abi)
);

const distributor = await distributorInterface.deploy({
  data: "0x" + fuse.compoundContracts["contracts/RewardsDistributor.sol:RewardsDistributor"].bin,
  arguments: [RGT_TOKEN_ADDRESS]
}).send({ from: deployer });

// Get RGT (reward token) contract
const rgt = new fuse.web3.eth.Contract(
  JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi),
  RGT_TOKEN_ADDRESS
);

// Add distributor to pool Comptroller
await comptroller.methods._addRewardsDistributors([distributor.options.address]).send({ from: deployer });

// Transfer RGT into distributor for distribution
await rgt.methods.transfer(distributor.options.address, Fuse.Web3.utils.toBN(1e18)).send({ from: "0x45d54b22582c79c8fb8f4c4f2663ef54944f397a", gasPrice: "0" });

// Set supply speed
await distributor.methods._setCompSupplySpeed(cTokenAddress, Fuse.Web3.utils.toBN(0.001e18)).send({ from: deployer });

// Mine blocks to pass "time"
for (var i = 0; i <= 100; i++) await evm_mine();

function evm_mine() {
  return new Promise(function(resolve, reject) {
    fuse.web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: new Date().getTime()
    }, function(err, result) {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Check balance before claim
console.log(await rgt.methods.balanceOf(deployer).call());

// Claim
await distributor.methods.claimRewards(deployer).send({ from: deployer });

// Check balance after claim
console.log(await rgt.methods.balanceOf(deployer).call());
})()

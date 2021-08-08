import Web3 from "web3";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json")
  .contracts;

export default class JumpRateModelV2 {
  static RUNTIME_BYTECODE_HASH =
    "0xc6df64d77d18236fa0e3a1bb939e979d14453af5c8287891decfb67710972c3c";

  initialized;

  baseRatePerBlock;
  multiplierPerBlock;
  jumpMultiplierPerBlock;
  kink;

  reserveFactorMantissa;

  async init(web3, interestRateModelAddress, assetAddress) {
    var contract = new web3.eth.Contract(
      JSON.parse(contracts["contracts/JumpRateModel.sol:JumpRateModel"].abi),
      interestRateModelAddress
    );
    this.baseRatePerBlock = Web3.utils.toBN(
      await contract.methods.baseRatePerBlock().call()
    );
    this.multiplierPerBlock = Web3.utils.toBN(
      await contract.methods.multiplierPerBlock().call()
    );
    this.jumpMultiplierPerBlock = Web3.utils.toBN(
      await contract.methods.jumpMultiplierPerBlock().call()
    );
    this.kink = Web3.utils.toBN(await contract.methods.kink().call());

    contract = new web3.eth.Contract(
      JSON.parse(
        contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi
      ),
      assetAddress
    );
    this.reserveFactorMantissa = Web3.utils.toBN(
      await contract.methods.reserveFactorMantissa().call()
    );
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(await contract.methods.adminFeeMantissa().call())
    );
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(await contract.methods.fuseFeeMantissa().call())
    );

    this.initialized = true;
  }

  async _init(
    web3,
    interestRateModelAddress,
    reserveFactorMantissa,
    adminFeeMantissa,
    fuseFeeMantissa
  ) {
    var contract = new web3.eth.Contract(
      JSON.parse(contracts["contracts/JumpRateModel.sol:JumpRateModel"].abi),
      interestRateModelAddress
    );
    this.baseRatePerBlock = Web3.utils.toBN(
      await contract.methods.baseRatePerBlock().call()
    );
    this.multiplierPerBlock = Web3.utils.toBN(
      await contract.methods.multiplierPerBlock().call()
    );
    this.jumpMultiplierPerBlock = Web3.utils.toBN(
      await contract.methods.jumpMultiplierPerBlock().call()
    );
    this.kink = Web3.utils.toBN(await contract.methods.kink().call());

    this.reserveFactorMantissa = Web3.utils.toBN(reserveFactorMantissa);
    this.reserveFactorMantissa.iadd(Web3.utils.toBN(adminFeeMantissa));
    this.reserveFactorMantissa.iadd(Web3.utils.toBN(fuseFeeMantissa));

    this.initialized = true;
  }

  async __init(
    baseRatePerBlock,
    multiplierPerBlock,
    jumpMultiplierPerBlock,
    kink,
    reserveFactorMantissa,
    adminFeeMantissa,
    fuseFeeMantissa
  ) {
    this.baseRatePerBlock = Web3.utils.toBN(baseRatePerBlock);
    this.multiplierPerBlock = Web3.utils.toBN(multiplierPerBlock);
    this.jumpMultiplierPerBlock = Web3.utils.toBN(jumpMultiplierPerBlock);
    this.kink = Web3.utils.toBN(kink);

    this.reserveFactorMantissa = Web3.utils.toBN(reserveFactorMantissa);
    this.reserveFactorMantissa.iadd(Web3.utils.toBN(adminFeeMantissa));
    this.reserveFactorMantissa.iadd(Web3.utils.toBN(fuseFeeMantissa));

    this.initialized = true;
  }

  getBorrowRate(utilizationRate) {
    if (!this.initialized)
      throw new Error("Interest rate model class not initialized.");

    if (utilizationRate.lte(this.kink)) {
      return utilizationRate
        .mul(this.multiplierPerBlock)
        .div(Web3.utils.toBN(1e18))
        .add(this.baseRatePerBlock);
    } else {
      const normalRate = this.kink
        .mul(this.multiplierPerBlock)
        .div(Web3.utils.toBN(1e18))
        .add(this.baseRatePerBlock);
      const excessUtil = utilizationRate.sub(this.kink);
      return excessUtil
        .mul(this.jumpMultiplierPerBlock)
        .div(Web3.utils.toBN(1e18))
        .add(normalRate);
    }
  }

  getSupplyRate(utilizationRate) {
    if (!this.initialized)
      throw new Error("Interest rate model class not initialized.");

    const oneMinusReserveFactor = Web3.utils
      .toBN(1e18)
      .sub(this.reserveFactorMantissa);
    const borrowRate = this.getBorrowRate(utilizationRate);
    const rateToPool = borrowRate
      .mul(oneMinusReserveFactor)
      .div(Web3.utils.toBN(1e18));
    return utilizationRate.mul(rateToPool).div(Web3.utils.toBN(1e18));
  }
}

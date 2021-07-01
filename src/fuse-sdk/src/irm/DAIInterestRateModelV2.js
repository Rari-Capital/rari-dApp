import Web3 from "web3";

import JumpRateModel from "./JumpRateModel.js";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json")
  .contracts;

export default class DAIInterestRateModelV2 extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH =
    "0x4b4c4f6386fd72d3f041a03e9eee3945189457fcf4299e99098d360a9f619539";

  initialized;

  dsrPerBlock;

  cash;
  borrows;
  reserves;

  async init(web3, interestRateModelAddress, assetAddress) {
    await super.init(web3, interestRateModelAddress, assetAddress);

    var contract = new web3.eth.Contract(
      JSON.parse(
        contracts["contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2"]
          .abi
      ),
      interestRateModelAddress
    );
    this.dsrPerBlock = Web3.utils.toBN(
      await contract.methods.dsrPerBlock().call()
    );

    contract = new web3.eth.Contract(
      JSON.parse(
        contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi
      ),
      assetAddress
    );
    this.cash = Web3.utils.toBN(await contract.methods.getCash().call());
    this.borrows = Web3.utils.toBN(
      await contract.methods.totalBorrowsCurrent().call()
    );
    this.reserves = Web3.utils.toBN(
      await contract.methods.totalReserves().call()
    );
  }

  async _init(
    web3,
    interestRateModelAddress,
    reserveFactorMantissa,
    adminFeeMantissa,
    fuseFeeMantissa
  ) {
    await super._init(
      web3,
      interestRateModelAddress,
      reserveFactorMantissa,
      adminFeeMantissa,
      fuseFeeMantissa
    );

    var contract = new web3.eth.Contract(
      JSON.parse(
        contracts["contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2"]
          .abi
      ),
      interestRateModelAddress
    );
    this.dsrPerBlock = Web3.utils.toBN(
      await contract.methods.dsrPerBlock().call()
    );

    this.cash = Web3.utils.toBN(0);
    this.borrows = Web3.utils.toBN(0);
    this.reserves = Web3.utils.toBN(0);
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
    await super.__init(
      baseRatePerBlock,
      multiplierPerBlock,
      jumpMultiplierPerBlock,
      kink,
      reserveFactorMantissa,
      adminFeeMantissa,
      fuseFeeMantissa
    );
    this.dsrPerBlock = Web3.utils.toBN(0); // TODO: Make this work if DSR ever goes positive again
    this.cash = Web3.utils.toBN(0);
    this.borrows = Web3.utils.toBN(0);
    this.reserves = Web3.utils.toBN(0);
  }

  getSupplyRate(utilizationRate) {
    if (!this.initialized)
      throw new Error("Interest rate model class not initialized.");

    const protocolRate = super.getSupplyRate(
      utilizationRate,
      this.reserveFactorMantissa
    );
    const underlying = this.cash.add(this.borrows).sub(this.reserves);

    if (underlying.isZero()) {
      return protocolRate;
    } else {
      const cashRate = this.cash.mul(this.dsrPerBlock).div(underlying);
      return cashRate.add(protocolRate);
    }
  }
}

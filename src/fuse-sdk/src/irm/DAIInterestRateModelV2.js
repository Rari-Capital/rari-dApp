import Web3 from "web3";

import JumpRateModel from "./JumpRateModel.js";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json")
  .contracts;

export default class DAIInterestRateModelV2 extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH =
    "0x44c31017cf8acb973002a343d9fdcf660da0b1ac0e3b56a360aadbf7ceefebd5";

  initialized;

  dsrPerBlock;

  cash;
  borrows;
  reserves;

  async init(web3, interestRateModelAddress, assetAddress) {
    await super.init(interestRateModelAddress, assetAddress);

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

    this.initialized = true;
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

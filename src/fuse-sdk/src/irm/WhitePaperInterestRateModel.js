import Web3 from "web3";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json")
  .contracts;

export default class WhitePaperInterestRateModel {
  static RUNTIME_BYTECODE_HASH =
    "0xe3164248fb86cce0eb8037c9a5c8d05aac2b2ebdb46741939be466a7b17d0b83";

  initialized;

  baseRatePerBlock;
  multiplierPerBlock;

  reserveFactorMantissa;

  async init(web3, interestRateModelAddress, assetAddress) {
    var contract = new web3.eth.Contract(
      JSON.parse(
        contracts[
          "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel"
        ].abi
      ),
      interestRateModelAddress
    );
    this.baseRatePerBlock = Web3.utils.toBN(
      await contract.methods.baseRatePerBlock().call()
    );
    this.multiplierPerBlock = Web3.utils.toBN(
      await contract.methods.multiplierPerBlock().call()
    );

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

  async _init(web3, interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
    var contract = new web3.eth.Contract(
      JSON.parse(
        contracts[
          "contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel"
        ].abi
      ),
      interestRateModelAddress
    );
    this.baseRatePerBlock = Web3.utils.toBN(
      await contract.methods.baseRatePerBlock().call()
    );
    this.multiplierPerBlock = Web3.utils.toBN(
      await contract.methods.multiplierPerBlock().call()
    );

    this.reserveFactorMantissa = Web3.utils.toBN(reserveFactorMantissa);
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(adminFeeMantissa)
    );
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(fuseFeeMantissa)
    );

    this.initialized = true;
  }

  async __init(baseRatePerBlock, multiplierPerBlock, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
    this.baseRatePerBlock = Web3.utils.toBN(baseRatePerBlock);
    this.multiplierPerBlock = Web3.utils.toBN(multiplierPerBlock);

    this.reserveFactorMantissa = Web3.utils.toBN(reserveFactorMantissa);
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(adminFeeMantissa)
    );
    this.reserveFactorMantissa.iadd(
      Web3.utils.toBN(fuseFeeMantissa)
    );

    this.initialized = true;
  }

  getBorrowRate(utilizationRate) {
    if (!this.initialized)
      throw new Error("Interest rate model class not initialized.");
    return utilizationRate
      .mul(this.multiplierPerBlock)
      .div(Web3.utils.toBN(1e18))
      .add(this.baseRatePerBlock);
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

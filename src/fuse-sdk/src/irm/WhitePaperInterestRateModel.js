import Web3 from "web3";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json").contracts;

export default class WhitePaperInterestRateModel {
    static RUNTIME_BYTECODE_HASH = "0x63d79af1b5e0b2cc00b5658d0c1456c1b6ccc205ba831fb1ddf39de43e21ade6";

    initialized;

    baseRatePerBlock;
    multiplierPerBlock;
    
    reserveFactorMantissa;

    async init(web3, interestRateModelAddress, assetAddress) {
        var contract = new web3.eth.Contract(JSON.parse(contracts["contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel"].abi), interestRateModelAddress);
        this.baseRatePerBlock = Web3.utils.toBN(await contract.methods.baseRatePerBlock().call());
        this.multiplierPerBlock = Web3.utils.toBN(await contract.methods.multiplierPerBlock().call());
        
        contract = new web3.eth.Contract(JSON.parse(contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi), assetAddress);
        this.reserveFactorMantissa = Web3.utils.toBN(await contract.methods.reserveFactorMantissa().call());
        this.reserveFactorMantissa.iadd(Web3.utils.toBN(await contract.methods.adminFeeMantissa().call()));
        this.reserveFactorMantissa.iadd(Web3.utils.toBN(await contract.methods.fuseFeeMantissa().call()));

        this.initialized = true;
    }

    getBorrowRate(utilizationRate) {
        if (!this.initialized) throw "Interest rate model class not initialized.";
        return utilizationRate.mul(this.multiplierPerBlock).div(Web3.utils.toBN(1e18)).add(this.baseRatePerBlock);
    }

    getSupplyRate(utilizationRate) {
        if (!this.initialized) throw "Interest rate model class not initialized.";

        const oneMinusReserveFactor = Web3.utils.toBN(1e18).sub(this.reserveFactorMantissa);
        const borrowRate = this.getBorrowRate(utilizationRate);
        const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(Web3.utils.toBN(1e18));
        return utilizationRate.mul(rateToPool).div(Web3.utils.toBN(1e18));
    }
}

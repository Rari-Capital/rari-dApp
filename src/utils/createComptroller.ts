import Fuse from "../fuse-sdk";

export const createComptroller = (comptrollerAddress: string, fuse: Fuse) => {
  const comptroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    ),
    comptrollerAddress
  );

  return comptroller;
};

export const createUnitroller = (unitrollerAddress: string, fuse: Fuse) => {
  const unitroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Unitroller.sol:Unitroller"].abi
    ),
    unitrollerAddress
  );

  return unitroller;
};

export const createOracle = (oracleAddress: string, fuse: Fuse) => {
  const oracle = new fuse.web3.eth.Contract(
      fuse.oracleContracts.MasterPriceOracle.abi,
      oracleAddress,
  )

  return oracle
}

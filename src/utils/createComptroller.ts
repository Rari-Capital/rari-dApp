// Fuse
import Fuse from "../fuse-sdk";

// Web3
import { Contract } from "web3-eth-contract"

export const createComptroller = (comptrollerAddress: string, fuse: Fuse): Contract => {
  const comptroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    ),
    comptrollerAddress
  );

  return comptroller;
};

export const createUnitroller = (unitrollerAddress: string, fuse: Fuse): Contract => {
  const unitroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Unitroller.sol:Unitroller"].abi
    ),
    unitrollerAddress
  );

  return unitroller;
};

export const createOracle = (oracleAddress: string, fuse: Fuse, type: string): Contract => {

  const oracle = new fuse.web3.eth.Contract(
      fuse.oracleContracts[type].abi,
      oracleAddress,
  )

  return oracle
}

export const createCToken = (fuse: Fuse, cTokenAddress: string) => {
  const cErc20Delegate = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
    ),
    cTokenAddress
  );

  return cErc20Delegate;
};

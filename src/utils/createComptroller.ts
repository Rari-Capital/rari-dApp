// Fuse
import Fuse from "../fuse-sdk";
import ERC20ABI from "../rari-sdk/abi/ERC20.json";

// Web3
import { Contract } from "web3-eth-contract";
import Web3 from "web3";
import { alchemyURL } from "./web3Providers";

export const createComptroller = (
  comptrollerAddress: string,
  fuse: Fuse
): Contract => {
  
  const comptroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    ),
    comptrollerAddress
  );
// @ts-ignore
  return comptroller;
};

export const createUnitroller = (
  unitrollerAddress: string,
  fuse: Fuse
): Contract => {
  
  const unitroller = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Unitroller.sol:Unitroller"].abi
    ),
    unitrollerAddress
  );
// @ts-ignore
  return unitroller;
};

export const createRewardsDistributor = (
  distributorAddress: string,
  fuse: Fuse
) => {
  //   Create instance of contract
  
  const rewardsDistributorInstance = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts[
        "contracts/RewardsDistributorDelegate.sol:RewardsDistributorDelegate"
      ].abi
    ),
    distributorAddress
  );

  return rewardsDistributorInstance;
};

export const createOracle = (
  oracleAddress: string,
  fuse: Fuse,
  type: string
): Contract => {

  
  const oracle = new fuse.web3.eth.Contract(
    fuse.oracleContracts[type].abi,
    oracleAddress
  );
// @ts-ignore
  return oracle;
};

export const createCToken = (fuse: Fuse, cTokenAddress: string) => {
  
  const cErc20Delegate = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
    ),
    cTokenAddress
  );

  return cErc20Delegate;
};

export const createERC20 = (fuse: Fuse, cTokenAddress: string) => {
  
  const erc20 = new fuse.web3.eth.Contract(ERC20ABI as any, cTokenAddress);
  return erc20;
};

export const createMasterPriceOracle = (fuse: Fuse) => {
  
  const masterPriceOracle = new fuse.web3.eth.Contract(
    fuse.oracleContracts["MasterPriceOracle"].abi,
    Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES.MasterPriceOracle
  );
  return masterPriceOracle;
};

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

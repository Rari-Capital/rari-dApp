import { Fuse } from "rari-sdk-sharad-v2";
import { createContract } from "./ethersUtils";

export const createComptroller = (comptrollerAddress: string, fuse: Fuse) => {
  const comptroller = createContract(
    comptrollerAddress,
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    )
  );

  return comptroller;
};

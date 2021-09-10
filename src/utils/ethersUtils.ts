import { Contract, BigNumberish, constants, BigNumber, utils } from "ethers";

export const createContract = (address: string, abi: any) =>
  new Contract(address, abi);

export const toBN = (input: BigNumberish) => {
  if (input === 0 || input === "0") return constants.Zero;
  if (input === 1e18) return constants.WeiPerEther;
  else return BigNumber.from(input);
};

export const fromWei = (bn: BigNumber) => utils.formatEther(bn);

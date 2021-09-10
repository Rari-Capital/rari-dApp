import Web3 from "web3";
import { Contract } from "ethers";

// Converts block Number to Unix Timestamp
export const blockNumberToTimeStamp = async (
  web3: Web3,
  blockNumber?: number
): Promise<number> => {
  if (!blockNumber) return new Date().getTime();
  const { timestamp } = await web3.eth.getBlock(blockNumber);
  return timestamp as number;
};

export const createContract = (address: string, abi: any) =>
  new Contract(address, abi);

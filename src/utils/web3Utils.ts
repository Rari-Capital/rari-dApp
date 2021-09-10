import Web3 from "web3";

// Converts block Number to Unix Timestamp
export const blockNumberToTimeStamp = async (
  web3: Web3,
  blockNumber?: number
): Promise<number> => {
  if (!blockNumber) return new Date().getTime();
  const { timestamp } = await web3.eth.getBlock(blockNumber);
  return timestamp as number;
};

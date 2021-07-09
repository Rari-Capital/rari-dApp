// Types
import { AbiItem } from "web3-utils";

// LendingPool contract ABI
const abi: AbiItem[] =
  require("@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json").abi;

// Contract address
const address = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

const LendingPool = { abi, address };

export default LendingPool;

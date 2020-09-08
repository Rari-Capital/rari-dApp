import Web3 from "web3";

import RARI_FUND_MANAGER_ABI from "../static/contracts/RariFundManager.json";

import { RariFundManager } from "../static/contracts/compiled/RariFundManager";

import { ALL_RARI_FUND_MANAGER_ADDRESSES } from "../context/ContractsContext";

function createAllXContracts<ContractType>(
  web3: Web3,
  abi: any,
  addresses: string[]
) {
  return addresses.map(
    (address) => (new web3.eth.Contract(abi, address) as any) as ContractType
  );
}

export const createAllFundManagerContracts = (web3: Web3) => {
  return createAllXContracts<RariFundManager>(
    web3,
    RARI_FUND_MANAGER_ABI,
    ALL_RARI_FUND_MANAGER_ADDRESSES
  );
};

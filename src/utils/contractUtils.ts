import { AbiItem } from "web3-utils";

import Web3 from "web3";

import RARI_FUND_MANAGER_ABI from "../static/contracts/RariFundManager.json";

import { RariFundManager } from "../static/contracts/compiled/RariFundManager";

import { ALL_RARI_FUND_MANAGER_ADDRESSES } from "../context/ContractsContext";

export const createAllFundManagerContracts = (web3: Web3) => {
  const contracts: RariFundManager[] = [];

  for (const address of ALL_RARI_FUND_MANAGER_ADDRESSES) {
    contracts.push(
      (new web3.eth.Contract(
        RARI_FUND_MANAGER_ABI as AbiItem[],
        address
      ) as any) as RariFundManager
    );
  }

  return contracts;
};

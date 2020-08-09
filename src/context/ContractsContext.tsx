import React, { useState, useEffect } from "react";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import { useWeb3 } from "./Web3Context";
import { RARI_FUND_CONTROLLER_ABI } from "../static/contracts/RariFundController";
import {
  RARI_FUND_MANAGER_ABI,
  RARI_FUND_MANAGER_ADDRESS,
} from "../static/contracts/RariFundManager";
import {
  RARI_FUND_TOKEN_ABI,
  RARI_FUND_TOKEN_ADDRESS,
} from "../static/contracts/RariFundToken";
import {
  RARI_FUND_PROXY_ABI,
  RARI_FUND_PROXY_ADDRESS,
} from "../static/contracts/RariFundProxy";

export interface ContractsContextData {
  RariFundController: Contract;
  RariFundManager: Contract;
  RariFundToken: Contract;
  RariFundProxy: Contract;

  tokens: Token[];
}

// TODO
export interface Token {}

export const ContractsContext = React.createContext<
  ContractsContextData | undefined
>(undefined);

export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { web3Authed, web3Network, isAuthed } = useWeb3();

  const [contractData, setContractData] = useState<
    ContractsContextData | undefined
  >(undefined);

  useEffect(() => {
    let web3;

    if (isAuthed) {
      web3 = web3Authed!;
    } else {
      web3 = web3Network;
    }

    setContractData({
      RariFundController: new web3.eth.Contract(
        RARI_FUND_CONTROLLER_ABI as AbiItem[],
        RARI_FUND_MANAGER_ADDRESS
      ),
      RariFundManager: new web3.eth.Contract(
        RARI_FUND_MANAGER_ABI as AbiItem[],
        RARI_FUND_MANAGER_ADDRESS
      ),
      RariFundToken: new web3.eth.Contract(
        RARI_FUND_TOKEN_ABI as AbiItem[],
        RARI_FUND_TOKEN_ADDRESS
      ),
      RariFundProxy: new web3.eth.Contract(
        RARI_FUND_PROXY_ABI as AbiItem[],
        RARI_FUND_PROXY_ADDRESS
      ),
      tokens: [],
    });
  }, [isAuthed, web3Authed, web3Network]);

  return (
    <ContractsContext.Provider value={contractData}>
      {children}
    </ContractsContext.Provider>
  );
};

export function useContracts() {
  const context = React.useContext(ContractsContext);

  if (context === undefined) {
    throw new Error(`useContracts must be used within a ContractsProvider`);
  }

  return context;
}

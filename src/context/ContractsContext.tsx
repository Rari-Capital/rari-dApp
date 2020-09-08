import React, { useState, useEffect } from "react";
import { AbiItem } from "web3-utils";

import { useWeb3 } from "./Web3Context";

import FullPageSpinner from "../components/shared/FullPageSpinner";
import Web3 from "web3";

import RARI_FUND_MANAGER_ABI from "../static/contracts/RariFundManager.json";
import { RariFundManager } from "../static/contracts/compiled/RariFundManager";

// import RARI_FUND_CONTROLLER_ABI from "../static/contracts/RariFundController.json";
// import RARI_FUND_TOKEN_ABI from "../static/contracts/RariFundToken.json";

// import { RariFundController } from "../static/contracts/compiled/RariFundController";
// import { RariFundToken } from "../static/contracts/compiled/RariFundToken";

// export const RARI_FUND_CONTROLLER_ADDRESS =
//   "0x15c4ae284fbb3a6ceb41fa8eb5f3408ac485fabb";

// export const RARI_FUND_TOKEN_ADDRESS =
//   "0x9366B7C00894c3555c7590b0384e5F6a9D55659f";

export const RARI_FUND_MANAGER_ADDRESS =
  "0x6bdaf490c5b6bb58564b3e79c8d18e8dfd270464";

export const ALL_RARI_FUND_MANAGER_ADDRESSES = [
  RARI_FUND_MANAGER_ADDRESS,
  "0x686ac9d046418416d3ed9ea9206f3dace4943027",
];

export interface ContractsContextData {
  // RariFundController: RariFundController;
  // RariFundToken: RariFundToken;
  RariFundManager: RariFundManager;
}

export const ContractsContext = React.createContext<
  ContractsContextData | undefined
>(undefined);

export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { web3Authed, web3Network, isAuthed } = useWeb3();

  const [contractData, setContractData] = useState<
    ContractsContextData | undefined
  >(undefined);

  useEffect(() => {
    let web3: Web3;

    if (isAuthed) {
      web3 = web3Authed!;
    } else {
      web3 = web3Network;
    }

    setContractData({
      // RariFundController: new web3.eth.Contract(
      //   RARI_FUND_CONTROLLER_ABI as AbiItem[],
      //   RARI_FUND_CONTROLLER_ADDRESS
      // ) as any,
      // RariFundToken: new web3.eth.Contract(
      //   RARI_FUND_TOKEN_ABI as AbiItem[],
      //   RARI_FUND_TOKEN_ADDRESS
      // ) as any,
      RariFundManager: new web3.eth.Contract(
        RARI_FUND_MANAGER_ABI as AbiItem[],
        RARI_FUND_MANAGER_ADDRESS
      ) as any,
    });
  }, [isAuthed, web3Authed, web3Network]);

  // Don't render children who depend on contracts until they are loaded.
  if (contractData === undefined) {
    return <FullPageSpinner />;
  }

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

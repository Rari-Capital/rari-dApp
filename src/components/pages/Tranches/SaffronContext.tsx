import React, { useState, useEffect } from "react";
import { useRari } from "../../../context/RariContext";
import { Contract } from "web3-eth-contract";
import SaffronPoolABI from "./SaffronPoolABI.json";
import SaffronStrategyABI from "./SaffronStrategyABI.json";

interface SaffronContextType {
  saffronStrategy: Contract;
  saffronPool: Contract;
}

export const SaffronContext = React.createContext<
  SaffronContextType | undefined
>(undefined);

const SaffronStrategyAddress = "0xC7a70b08c826da7509E48c3E555574292915bd21";
const SaffronPoolAddress = "0x7F50321f11576714Dc0BdD5ef9e77De52bF73C05";

export const SaffronProvider = React.memo(({ children }) => {
  const { rari } = useRari();

  const [saffronStrategy, setSaffronStrategy] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronStrategyABI as any,
      SaffronStrategyAddress
    );
  });

  const [saffronPool, setSaffronPool] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronPoolABI as any,
      SaffronPoolAddress
    );
  });

  useEffect(() => {
    setSaffronStrategy(
      new rari.web3.eth.Contract(
        SaffronStrategyABI as any,
        SaffronStrategyAddress
      )
    );

    setSaffronPool(
      new rari.web3.eth.Contract(SaffronPoolABI as any, SaffronPoolAddress)
    );
  }, [rari]);

  return (
    <SaffronContext.Provider value={{ saffronStrategy, saffronPool }}>
      {children}
    </SaffronContext.Provider>
  );
});

export const useSaffronContracts = () => {
  const context = React.useContext(SaffronContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
};

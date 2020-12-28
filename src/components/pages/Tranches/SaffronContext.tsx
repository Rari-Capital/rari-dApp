import React, { useState, useEffect, useMemo } from "react";
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

const SaffronStrategyAddress = "0x9e0278646fD72318909338Ad87deC7f3464BC434";
const SaffronPoolAddress = "0xbafA231AAac12CE8ba0b23b86669f54a05fC23b5";

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

  const value = useMemo(() => {
    return { saffronStrategy, saffronPool };
  }, [saffronStrategy, saffronPool]);

  return (
    <SaffronContext.Provider value={value}>{children}</SaffronContext.Provider>
  );
});

export const useSaffronContracts = () => {
  const context = React.useContext(SaffronContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
};

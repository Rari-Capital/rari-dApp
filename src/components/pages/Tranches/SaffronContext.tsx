import { createContext, memo, useContext, useState, useEffect } from "react";
import { useRari } from "../../../context/RariContext";
import SaffronPoolABI from "./SaffronPoolABI.json";
import SaffronStrategyABI from "./SaffronStrategyABI.json";
import { SaffronStrategyAddress, SaffronPoolAddress } from "constants/saffron";
import { createContract } from "utils/web3Utils";
import { Contract } from "@ethersproject/contracts";

interface SaffronContextType {
  saffronStrategy: Contract;
  saffronPool: Contract;
}

export const SaffronContext = createContext<SaffronContextType | undefined>(
  undefined
);

export const SaffronProvider = memo(({ children }) => {
  const { rari } = useRari();

  const [saffronStrategy, setSaffronStrategy] = useState(() => {
    return createContract(SaffronStrategyAddress, SaffronStrategyABI);
  });

  const [saffronPool, setSaffronPool] = useState(() => {
    return createContract(SaffronPoolAddress, SaffronPoolABI as any);
  });

  useEffect(() => {
    setSaffronStrategy(
      createContract(SaffronStrategyAddress, SaffronStrategyABI)
    );

    setSaffronPool(createContract(SaffronPoolAddress, SaffronPoolABI));
  }, [rari]);

  return (
    <SaffronContext.Provider value={{ saffronStrategy, saffronPool }}>
      {children}
    </SaffronContext.Provider>
  );
});

export const useSaffronContracts = () => {
  const context = useContext(SaffronContext);

  if (context === undefined) {
    throw new Error(
      `useSaffronContracts must be used within a SaffronProvider`
    );
  }

  return context;
};

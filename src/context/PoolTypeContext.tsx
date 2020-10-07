import React, { ReactNode } from "react";
import { Pool } from "../components/App";

export const PoolTypeContext = React.createContext<Pool | undefined>(undefined);

export const PoolTypeProvider = ({
  pool,
  children,
}: {
  pool: Pool;
  children: ReactNode;
}) => {
  return (
    <PoolTypeContext.Provider value={pool}>{children}</PoolTypeContext.Provider>
  );
};

export const usePoolType = () => {
  const context = React.useContext(PoolTypeContext);

  if (context === undefined) {
    throw new Error(`usePoolType must be used within a PoolTypeProvider`);
  }

  return context;
};

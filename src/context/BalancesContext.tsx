import { useClaimable, UseClaimableReturn } from "hooks/rewards/useClaimable";
import { createContext, useContext, ReactNode } from "react";

export const BalancesContext = createContext<any | undefined>(undefined);

export const BalancesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    unclaimedRGT,
    privateUnclaimedRGT,
    pool2UnclaimedRGT,
    unclaimedFuseRewards,
    hasClaimableRewards,
  } = useClaimable();


  return (
    <BalancesContext.Provider
      value={{
        unclaimedRGT,
        privateUnclaimedRGT,
        pool2UnclaimedRGT,
        unclaimedFuseRewards,
        hasClaimableRewards,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
};

export function useBalances(): UseClaimableReturn {
  const context = useContext(BalancesContext);

  if (context === undefined) {
    throw new Error(`useBalances must be used within a BalancesContext`);
  }

  return context;
}

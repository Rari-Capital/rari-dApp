import { useTokenBalances } from "hooks/useTokenBalance";
import { SubgraphUnderlyingAsset } from "pages/api/explore";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { queryAllUnderlyingAssets } from "services/gql";
import useSWR from "swr";
import { UnderlyingAsset } from "types/tokens";
import { useRari } from "./RariContext";

export const BalancesContext = createContext<any | undefined>(undefined);

// Fetchers
const allTokensFetcher = async (): Promise<SubgraphUnderlyingAsset[]> => {
  return await queryAllUnderlyingAssets();
};

export const BalancesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthed } = useRari();

  const { data: underlyingAssets } = useSWR([isAuthed], allTokensFetcher, {
    dedupingInterval: 3600000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const tokenAddresses = useMemo(
    () =>
      underlyingAssets?.length ? underlyingAssets.map((asset) => asset.id) : [],
    [underlyingAssets]
  );

  const tokenBalances = useTokenBalances(tokenAddresses);

  const balances: {
    [address: string]: number;
  } = useMemo(() => {
    let ret: { [address: string]: number } = {};
    if (!isAuthed) return ret;

    for (let i = 0; i < tokenBalances.length; i++) {
      const asset = underlyingAssets![i];

      const balance = tokenBalances[i];
      if (!!balance) {
        ret[asset.id] = balance / 10 ** (asset.decimals ?? 18);
      }
    }

    return ret;
  }, [tokenBalances, isAuthed]);

  return (
    <BalancesContext.Provider value={balances}>
      {children}
    </BalancesContext.Provider>
  );
};

export const useAccountBalances = (): [any, string[]] => {
  const balances = useContext(BalancesContext);

  const significantTokens: string[] = useMemo(
    () =>
      Object.keys(balances)
        .filter((address) => balances[address] >= .2)
        .sort(function (a, b) {
          return balances[b] - balances[a];
        }),
    [balances]
  );

  if (balances === undefined) {
    throw new Error(
      `useBalances must be used within a BalancesContext Provider`
    );
  }

  return [balances, significantTokens];
};

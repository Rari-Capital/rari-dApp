import { GET_ALL_UNDERLYING_ASSETS } from "gql/getAllUnderlyingAssets";
import { useTokenBalances } from "hooks/useTokenBalance";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import useSWR from "swr";
import { UnderlyingAsset } from "types/tokens";
import { makeGqlRequest } from "utils/gql";
import { useRari } from "./RariContext";

export const BalancesContext = createContext<any | undefined>(undefined);

const allTokensFetcher = async (
  isAuthenticated: boolean
): Promise<UnderlyingAsset[]> => {
  if (isAuthenticated) {
    const { underlyingAssets } = await makeGqlRequest(
      GET_ALL_UNDERLYING_ASSETS
    );
    return underlyingAssets;
  }
  return [];
};

export const BalancesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthed } = useRari();

  const { data: underlyingAssets, error } = useSWR(
    [isAuthed],
    allTokensFetcher,
    {
      dedupingInterval: 3600000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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

    for (let i = 0; i < tokenBalances.length; i++) {
      const asset = underlyingAssets![i];

      const balance = tokenBalances[i];
      if (!!balance) {
        ret[asset.id] = balance / 10 ** (asset.decimals ?? 18);
      }
    }

    return ret;
  }, [tokenBalances]);

  return (
    <BalancesContext.Provider value={balances}>
      {children}
    </BalancesContext.Provider>
  );
};

export const useAccountBalances = () => {
  const balances = useContext(BalancesContext);

  if (balances === undefined) {
    throw new Error(`useBalances must be used within a PoolTypeProvider`);
  }

  return balances;
};

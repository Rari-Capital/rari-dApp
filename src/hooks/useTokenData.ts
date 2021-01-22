import { useMemo } from "react";

import { useQuery } from "react-query";
import ERC20ABI from "../../src/rari-sdk/abi/ERC20.json";
import { useRari } from "../context/RariContext";

export const useTokenDataWithContract = (address: string) => {
  const { rari } = useRari();

  const tokenData = useTokenData(address);

  const contract = useMemo(
    () => new rari.web3.eth.Contract(ERC20ABI as any, address),
    [address, rari.web3.eth.Contract]
  );

  return { tokenData, contract };
};

export const useTokenData = (address: string) => {
  const { data: tokenData } = useQuery(
    address + " tokenData",
    async () => {
      let data;
      try {
        data = await fetch("/api/tokenData?address=" + address).then((res) =>
          res.json()
        );
      } catch (e) {
        data = {
          name: null,
          symbol: null,
          decimals: null,
          color: null,
          overlayTextColor: null,
          logoURL: null,
        };
      }

      return data as {
        name: string | null;
        symbol: string | null;
        decimals: number | null;
        color: string | null;
        overlayTextColor: string | null;
        logoURL: string | null;
      };
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return tokenData;
};

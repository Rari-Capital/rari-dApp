import { useMemo } from "react";

import { useQuery, useQueries } from "react-query";
import ERC20ABI from "lib/rari-sdk/abi/ERC20.json";
import { useRari } from "../context/RariContext";

export const ETH_TOKEN_DATA = {
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  name: "Ethereum",
  decimals: 18,
  color: "#627EEA",
  overlayTextColor: "#fff",
  logoURL:
    "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/64/Ethereum-ETH-icon.png",
};

export interface TokenData {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  logoURL: string;
}

export const useTokenDataWithContract = (address: string) => {
  const { rari } = useRari();

  const tokenData = useTokenData(address);

  const contract = useMemo(
    () => new rari.web3.eth.Contract(ERC20ABI as any, address),
    [address, rari.web3.eth.Contract]
  );

  return { tokenData, contract };
};

export const fetchTokenData = async (address: string): Promise<TokenData> => {
  let data;

  if (address !== ETH_TOKEN_DATA.address) {
    console.log("saerching address", address);
    try {
      data = {
        ...(await fetch(
          // Since running the vercel functions requires a Vercel account and is super slow,
          // just fetch this data from the live site in development:
          (process.env.NODE_ENV === "development"
            ? "https://app.rari.capital"
            : "") +
            "/api/tokenData?address=" +
            address
        ).then((res) => res.json())),
        address: address,
      };
    } catch (e) {
      data = {
        name: null,
        address: null,
        symbol: null,
        decimals: null,
        color: null,
        overlayTextColor: null,
        logoURL: null,
      };
    }
  } else {
    console.log("eth2 address", address);
    data = ETH_TOKEN_DATA;
  }

  return data as TokenData;
};

export const useTokenData = (address: string): TokenData | undefined => {
  const { data: tokenData } = useQuery(
    address + " tokenData",
    async () => await fetchTokenData(address)
  );
  return tokenData;
};

export const useTokensData = (addresses: string[]): TokenData[] | null => {
  const tokensData = useQueries(
    addresses.map((address: string) => {
      return {
        queryKey: address + " tokenData",
        queryFn: async () => await fetchTokenData(address),
      };
    })
  );

  return useMemo(() => {
    const ret: any[] = [];

    if (!tokensData.length) return null;

    // Return null altogether
    tokensData.forEach(({ data }) => {
      if (!data) return null;
      ret.push(data);
    });

    if (!ret.length) return null;

    return ret;
  }, [tokensData]);
};

import { useMemo } from "react";

import { useQuery } from "react-query";
import ERC20ABI from "../../src/rari-sdk/abi/ERC20.json";
import { useRari } from "../context/RariContext";

export const ETH_TOKEN_DATA = {
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  name: "Ethereum Network Token",
  decimals: 18,
  color: "#7b7b83",
  overlayTextColor: "#fff",
  logoURL:
    "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/64/Ethereum-ETH-icon.png",
};

export interface TokenData {
  name: string | null;
  symbol: string | null;
  address: string | null;
  decimals: number | null;
  color: string | null;
  overlayTextColor: string | null;
  logoURL: string | null;
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

export const useTokenData = (address: string) => {
  const { data: tokenData } = useQuery(
    address + " tokenData",
    async () => {
      let data;

      if (address !== ETH_TOKEN_DATA.address) {
        try {
          data = {
            ...(await fetch("/api/tokenData?address=" + address).then((res) =>
              res.json()
            )),
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
        data = ETH_TOKEN_DATA;
      }

      return data as TokenData;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return tokenData;
};

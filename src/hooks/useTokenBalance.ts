import { useQueries, useQuery } from "react-query";

import { useRari } from "context/RariContext";
import ERC20ABI from "lib/rari-sdk/abi/ERC20.json";
import { ETH_TOKEN_DATA } from "./useTokenData";
import Web3 from "web3";
import { useMemo } from "react";
import BigNumber from "bignumber.js";

export const fetchTokenBalance = async (
  tokenAddress: string,
  web3: Web3,
  address?: string
) => {
  let stringBalance;

  if (!address || address === ETH_TOKEN_DATA.address) {
    stringBalance = "0";
  } else if (
    tokenAddress === ETH_TOKEN_DATA.address ||
    tokenAddress === "NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS"
  ) {
    stringBalance = await web3.eth.getBalance(address);
  } else {
    const contract = new web3.eth.Contract(ERC20ABI as any, tokenAddress);
    stringBalance = await contract.methods.balanceOf(address).call();
  }

  return web3.utils.toBN(stringBalance);
};

export function useTokenBalance(tokenAddress: string) {
  const { rari, address } = useRari();

  const { data, isLoading } = useQuery(
    tokenAddress + " balanceOf " + address,
    () => fetchTokenBalance(tokenAddress, rari.web3, address)
  );

  return { data, isLoading };
}

export function useTokenBalances(tokenAddresses: string[]): number[] {
  const { rari, address } = useRari();

  const balances = useQueries(
    tokenAddresses.map((tokenAddress: string) => {
      return {
        queryKey: tokenAddress + " balance",
        queryFn: () => {
          return fetchTokenBalance(tokenAddress, rari.web3, address);
        },
      };
    })
  );

  return useMemo(() => {
    return balances.map((bal) => {
      return bal.data ? parseFloat((bal.data as BigNumber).toString()) : 0;
    });
  }, [balances]);
}

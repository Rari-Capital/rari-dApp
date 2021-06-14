import { useQuery } from "react-query";

import { useRari } from "../context/RariContext";
import ERC20ABI from "../rari-sdk/abi/ERC20.json";
import { ETH_TOKEN_DATA } from "./useTokenData";
import Web3 from "web3";

export const fetchTokenBalance = async (
  tokenAddress: string,
  web3: Web3,
  address: string
) => {
  let stringBalance;

  if (
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

export function useTokenBalances(tokenAddresses: string[]) {
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

  console.log({ balances });

  return balances;
}

const AssetOpportunities = {
  DAI_ADDR: {
    fuse: [
      {
        poolId: 6,
        borrowAPR: 12,
        lendAPR: 3,
      },
      {
        poolId: 2,
        borrowAPR: 25,
        lendAPR: 20,
      },
    ],
    vaults: [
      {
        vaultId: "DAI",
        APR: 12
      }
    ],
    tranches: [...trancheData],
    tanks: [...tanksData]
  },
  WBTC_ADDR: { ...wbtcData}
};

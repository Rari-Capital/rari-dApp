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

  if (tokenAddress === ETH_TOKEN_DATA.address) {
    stringBalance = await web3.eth.getBalance(address);
  } else {
    const contract = new web3.eth.Contract(ERC20ABI as any, tokenAddress);

    stringBalance = await contract.methods.balanceOf(address).call();
  }

  return web3.utils.toBN(stringBalance);
};

export function useTokenBalance(tokenAddress: string) {
  const { rari, address } = useRari();

  return useQuery(tokenAddress + " balanceOf " + address, () =>
    fetchTokenBalance(tokenAddress, rari.web3, address)
  );
}

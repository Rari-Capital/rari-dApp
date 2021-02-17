import { useQuery } from "react-query";

import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";
import ERC20ABI from "../rari-sdk/abi/ERC20.json";
import { ETH_TOKEN_DATA } from "./useTokenData";

export const fetchTokenBalance = async (
  tokenAddress: string,
  rari: Rari,
  address: string
) => {
  let stringBalance;

  if (tokenAddress === ETH_TOKEN_DATA.address) {
    stringBalance = await rari.web3.eth.getBalance(address);
  } else {
    const contract = new rari.web3.eth.Contract(ERC20ABI as any, tokenAddress);

    stringBalance = await contract.methods.balanceOf(address).call();
  }

  return rari.web3.utils.toBN(stringBalance);
};

export function useTokenBalance(tokenAddress: string) {
  const { rari, address } = useRari();

  return useQuery(tokenAddress + " balanceOf " + address, () =>
    fetchTokenBalance(tokenAddress, rari, address)
  );
}

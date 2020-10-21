import { useQuery } from "react-query";
import { Token } from "rari-tokens-generator";

import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";

export const getTokenBalance = async (
  token: Token,
  rari: Rari,
  address: string
) => {
  let stringBalance;

  const allTokens = await rari.getAllTokens();

  if (token.symbol !== "ETH") {
    stringBalance = await allTokens[token.symbol].contract.methods
      .balanceOf(address)
      .call();
  } else {
    stringBalance = await rari.web3.eth.getBalance(address);
  }

  return rari.web3.utils.toBN(stringBalance);
};

export function useTokenBalance(token: Token) {
  const { rari, address } = useRari();

  return useQuery(address + " balanceOf " + token.symbol, () =>
    getTokenBalance(token, rari, address)
  );
}

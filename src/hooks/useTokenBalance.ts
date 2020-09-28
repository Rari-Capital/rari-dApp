import { useQuery } from "react-query";
import { Token } from "rari-tokens-generator";
import { createTokenContract } from "../utils/tokenUtils";
import { toBig } from "../utils/bigUtils";

import Web3 from "web3";
import { useWeb3 } from "../context/Web3Context";

export const getTokenBalance = async (
  token: Token,
  web3: Web3,
  address: string
) => {
  let stringBalance;

  if (token.symbol !== "ETH") {
    stringBalance = await createTokenContract(token, web3)
      .methods.balanceOf(address)
      .call();
  } else {
    stringBalance = await web3.eth.getBalance(address);
  }

  return toBig(stringBalance).div(10 ** token.decimals);
};

export function useTokenBalance(token: Token) {
  const { web3, address } = useWeb3();

  return useQuery(address + " balanceOf " + token.symbol, () =>
    getTokenBalance(token, web3, address)
  );
}

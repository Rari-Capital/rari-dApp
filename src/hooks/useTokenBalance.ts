import { useQuery } from "react-query";
import { Token } from "rari-tokens-generator";
import { createTokenContract } from "../utils/tokenUtils";
import { toBig } from "../utils/bigUtils";
import { useAuthedWeb3 } from "../context/Web3Context";
import Web3 from "web3";

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
    console.log(stringBalance);
  }

  return toBig(stringBalance).div(10 ** token.decimals);
};

export function useTokenBalance(token: Token) {
  const { web3, address } = useAuthedWeb3();

  return useQuery(address + " balanceOf " + token.symbol, () =>
    getTokenBalance(token, web3, address)
  );
}

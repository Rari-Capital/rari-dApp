import { useQuery } from "react-query";
import Big from "big.js";
import { Token } from "rari-tokens-generator";
import { createTokenContract } from "../utils/tokenUtils";
import { toBig } from "../utils/bigUtils";
import { useAuthedWeb3 } from "../context/Web3Context";

export function useTokenBalance(token: Token) {
  const { web3, address } = useAuthedWeb3();

  return useQuery<Big, any>(address + "balanceOf" + token.symbol, async () => {
    const stringBalance = await createTokenContract(token, web3)
      .methods.balanceOf(address)
      .call();

    return toBig(stringBalance).div(10 ** token.decimals);
  });
}

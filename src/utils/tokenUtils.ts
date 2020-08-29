import { Token, AllTokens } from "rari-tokens-generator";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ERC20_ABI from "../static/contracts/ERC20.json";
import { Erc20 } from "../static/contracts/compiled/ERC20";
import Tokens from "../static/compiled/tokens.json";
export const tokens = Tokens as AllTokens;

export function createTokenContract(token: Token, web3: Web3): Erc20 {
  return new web3.eth.Contract(ERC20_ABI as AbiItem[], token.address) as any;
}

import React, { useState, useEffect } from "react";
import FullPageSpinner from "../components/shared/FullPageSpinner";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ERC20_ABI from "../static/contracts/ERC20.json";
import { Erc20 } from "../static/contracts/compiled/ERC20";

export interface TokensContextData {
  [symbol: string]: Token;
}

export interface Token {
  address: string;
  decimals: number;
}

interface ZeroXTokenResponse {
  records: {
    symbol: string;
    address: string;
    decimals: number;
  }[];
}

export function createTokenContract(token: Token, web3: Web3): Erc20 {
  return new web3.eth.Contract(ERC20_ABI as AbiItem[], token.address) as any;
}

export const TokensContext = React.createContext<TokensContextData | undefined>(
  undefined
);

export const TokensProvider = ({ children }: { children: JSX.Element }) => {
  const [tokenData, setTokenData] = useState<TokensContextData | undefined>(
    undefined
  );

  useEffect(() => {
    fetch("https://api.0x.org/swap/v0/tokens")
      .then((response) => response.json())
      .then((tokenData: ZeroXTokenResponse) => {
        let tokens: TokensContextData = {};

        for (const token of tokenData.records) {
          tokens[token.symbol] = {
            address: token.address,
            decimals: token.decimals,
          };
        }

        setTokenData(tokens);
      });
  }, [setTokenData]);

  // Don't render children who depend on token data until they are loaded.
  if (tokenData === undefined) {
    return <FullPageSpinner />;
  }

  return (
    <TokensContext.Provider value={tokenData}>
      {children}
    </TokensContext.Provider>
  );
};

export function useTokens() {
  const context = React.useContext(TokensContext);

  if (context === undefined) {
    throw new Error(`useTokens must be used within a TokensProvider`);
  }

  return context;
}

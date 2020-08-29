import React, { useState, useEffect } from "react";
import FullPageSpinner from "../components/shared/FullPageSpinner";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ERC20_ABI from "../static/contracts/ERC20.json";
import { Erc20 } from "../static/contracts/compiled/ERC20";
//@ts-ignore
import analyze from "rgbaster";

export interface TokensContextData {
  [symbol: string]: Token;
}

export interface Token {
  address: string;
  decimals: number;
  logoURL: string;
  color: string;
}

interface ZeroExTokenResponse {
  records: {
    symbol: string;
    address: string;
    decimals: number;
  }[];
}

interface UniswapTokenResponse {
  tokens: {
    address: string;
    logoURI: string;
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
    Promise.all([
      fetch("https://api.0x.org/swap/v0/tokens").then((response) =>
        response.json()
      ),
      fetch("https://tokens.uniswap.org").then((response) => response.json()),
    ]).then(([_zeroExResponse, _uniswapResponse]) => {
      const tokenData = _zeroExResponse as ZeroExTokenResponse;
      const uniTokenData = _uniswapResponse as UniswapTokenResponse;

      let tokens: TokensContextData = {};

      for (const token of tokenData.records) {
        const logoURL =
          uniTokenData.tokens.find(
            (unitoken) =>
              unitoken.address.toLowerCase() === token.address.toLowerCase()
          )?.logoURI ??
          "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT-WSqNCkcKAYlmZ0oxrJM2IX81yp3B87VH1VAMOKmVKk0edwVHVHmdQNOxZvKcMOakVJ6JFQBcs7SHLMWoNgBA0_SH1ltbBQCErA&usqp=CAU&ec=45695924";

        analyze(logoURL, {
          ignore: ["rgb(255,255,255)", "rgb(0,0,0)"],
          scale: 0.5,
        }).then(
          (result: any) =>
            (tokens[token.symbol] = {
              address: token.address,
              decimals: token.decimals,
              color: result[0].color,
              logoURL,
            })
        );
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

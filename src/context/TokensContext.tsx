import React, { useState, useEffect } from "react";
import FullPageSpinner from "../components/shared/FullPageSpinner";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ERC20_ABI from "../static/contracts/ERC20.json";
import { Erc20 } from "../static/contracts/compiled/ERC20";
//@ts-ignore
import analyze from "rgbaster";

function isBalancedColor(color: string) {
  let adjustedColor;

  let r: number;
  let g: number;
  let b: number;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    adjustedColor = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    )!;

    r = parseFloat(adjustedColor[1]);
    g = parseFloat(adjustedColor[2]);
    b = parseFloat(adjustedColor[3]);
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    adjustedColor = +("0x" + color.slice(1).replace(/./g, "$&$&"));

    r = adjustedColor >> 16;
    g = (adjustedColor >> 8) & 255;
    b = adjustedColor & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is too bright or dark
  return {
    isBalanced: hsp > 107.5 && hsp < 220,
    isBright: hsp > 205,
  };
}

export interface TokensContextData {
  [symbol: string]: Token;
}

export interface Token {
  address: string;
  decimals: number;
  logoURL: string;
  color: string;
  isBright: boolean;
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
    const fetchData = async () => {
      const _zeroExResponse = await fetch(
        "https://api.0x.org/swap/v0/tokens"
      ).then((response) => response.json());

      const tokenData = _zeroExResponse as ZeroExTokenResponse;

      let tokens: TokensContextData = {};

      for (const token of tokenData.records) {
        const logoURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3.utils.toChecksumAddress(
          token.address
        )}/logo.png`;

        let colors;
        try {
          colors = await analyze(logoURL, {
            ignore: ["rgb(255,255,255)", "rgb(0,0,0)"],
            scale: 0.5,
          });
        } catch (error) {
          tokens[token.symbol] = {
            address: token.address,
            decimals: token.decimals,
            color: "#FFFFFF",
            isBright: true,
            logoURL:
              "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg",
          };

          continue;
        }

        let selectedColor = { color: "#FFFFFF", isBright: true };

        for (const color of colors) {
          if (color.color.startsWith("rgba(")) {
            continue;
          }

          const colorReport = isBalancedColor(color.color);
          if (colorReport.isBalanced) {
            selectedColor = {
              color: color.color,
              isBright: colorReport.isBright,
            };
            break;
          }
        }

        tokens[token.symbol] = {
          address: token.address,
          decimals: token.decimals,
          color: selectedColor.color,
          isBright: selectedColor.isBright,
          logoURL,
        };
      }

      setTokenData(tokens);
    };

    fetchData();
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

import Vibrant from "node-vibrant";
import { Palette } from "node-vibrant/lib/color";
import fetch from "node-fetch";
import Web3 from "web3";
import ERC20ABI from "../src/rari-sdk/abi/ERC20.json";
import { TokenDataOverrides } from "../src/constants/tokenData";
import {
  ChainID,
  isSupportedChainId,
  coingeckoNetworkPath,
  networkData,
} from "../src/constants/networks";

import { VercelRequest, VercelResponse } from "@vercel/node";

type tokenData = {
  color;
  overlayTextColor;
  address;
  chainId;
};

/**
 * Ok so coingecko has minimal data on tokens not on Ethereum
 * For L2, we must rely on projects maintaining L2 tokenLists
 *
 */

// params: address (required), chainId (optional) (default 1)
export default async (request: VercelRequest, response: VercelResponse) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "max-age=3600, s-maxage=3600");

  const { address: _address, chainId: _chainId = "1" } = request.query;

  let chainId: number;
  // Validate ChainID
  try {
    chainId = parseInt(_chainId as string);
    if (!isSupportedChainId(chainId)) {
      throw "Unsupported ChainID";
    }
  } catch {
    return response.status(500).send(`Unsupported Chain ID: ${_chainId}`);
  }

  const netData = networkData[chainId];
  if (!netData) {
    return response
      .status(500)
      .send(
        `Network supported but Could not find network data for chain ID: ${chainId}`
      );
  }

  // Instiantate variables
  let name: string;
  let symbol: string;
  let logoURL: string =
    "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg";

  // Instantiate Token Contract on proper chain
  const web3 = new Web3(netData.rpc);
  const address = web3.utils.toChecksumAddress(_address as string);
  const tokenContract = new web3.eth.Contract(ERC20ABI as any, address);

  // L1/L2 URLS
  const rariURL = `https://raw.githubusercontent.com/sharad-s/rari-token-list/main/tokens/${chainId}/${address}/info.json`;
  const coingeckoURL = `https://api.coingecko.com/api/v3/coins/${coingeckoNetworkPath[chainId]}/contract/${address}`;

  // L1 URLS
  const trustWalletURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  const yearnLogoURL = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${address}/logo-128.png`;

  let decimals = 18;
  try {
    // Fetch data from rari token data first
    const [_decimals, rariTokenData] = await Promise.all([
      tokenContract.methods
        .decimals()
        .call()
        .then((res) => parseFloat(res)),
      // 18,
      fetch(rariURL).then((res) => {
        if (res.ok) {
          return res.json();
        }
      }),
    ]);

    decimals = _decimals;

    let method: "RARI" | "COINGECKO" | "CONTRACT";

    console.log({ rariTokenData, rariURL });

    //1.) Try Rari Token list 2.) Try Coingecko 3.) Try contracts
    if (!!rariTokenData) {
      // We got data from rari token list
      let { symbol: _symbol, name: _name, logoURI } = rariTokenData;
      symbol =
        _symbol == _symbol.toLowerCase() ? _symbol.toUpperCase() : _symbol;
      name = _name;
      logoURL = logoURI;

      method = "RARI";
    } else {
      // We could not get data from rari token list. Try Coingecko
      const coingeckoData = await fetch(coingeckoURL).then((res) => {
        if (res.ok) {
          return res.json();
        }
      });

      if (!!coingeckoData) {
        // We got data from Coingecko
        let {
          symbol: _symbol,
          name: _name,
          image: { small },
        } = coingeckoData;

        symbol =
          _symbol == _symbol.toLowerCase() ? _symbol.toUpperCase() : _symbol;
        name = _name;
        // Prefer the logo from trustwallet if possible!
        const trustWalletLogoResponse = await fetch(trustWalletURL);
        if (trustWalletLogoResponse.ok) {
          logoURL = trustWalletURL;
        } else {
          logoURL = small;
        }
        method = "COINGECKO";
      } else {
        // We could not get data from coingecko. Use the contract data
        name = await tokenContract.methods.name().call();
        symbol = await tokenContract.methods.symbol().call();

        // We can't get the logo data from literally anywhere else so try one last time from yearn
        const yearnLogoResponse = await fetch(yearnLogoURL);
        if (yearnLogoResponse.ok) {
          // A lot of the yearn tokens are curve tokens with long names,
          // so we flatten them here and just remove the Curve part
          symbol = symbol.replace("Curve-", "");
          logoURL = yearnLogoURL;
        }
        method = "CONTRACT";
      }
    }
  } catch (err) {
    // If it errored we should return 404
    return response.status(404).send("Nope");
  }

  // Assign any overides if any specified
  let overrides = {};
  if (!!TokenDataOverrides[chainId]) {
    overrides = TokenDataOverrides[chainId][address] ?? {};
  }
  const basicTokenInfo = Object.assign(
    {},
    {
      symbol,
      name,
      decimals,
      logoURL,
    },
    overrides
  );

  // console.log({ overrides, basicTokenInfo, method });

  // Get the color
  let color: Palette;
  try {
    if (basicTokenInfo.logoURL === undefined) {
      // If we have no logo no need to try to get the color
      // just go to the catch block and return the default logo.
      throw "Go to the catch block";
    }

    color = await Vibrant.from(basicTokenInfo.logoURL).getPalette();
  } catch (error) {
    return response.json({
      ...basicTokenInfo,
      color: "#FFFFFF",
      overlayTextColor: "#000",
      address,
    });
  }

  if (!color.Vibrant) {
    response.json({
      ...basicTokenInfo,
      color: "#FFFFFF",
      overlayTextColor: "#000",
      address,
    });

    return;
  }

  response.json({
    ...basicTokenInfo,
    color: color.Vibrant.getHex(),
    overlayTextColor: color.Vibrant.getTitleTextColor(),
    address,
  });
};

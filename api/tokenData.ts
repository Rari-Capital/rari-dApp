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

<<<<<<< Updated upstream
// params: address (required), chainId (optional) (default 1)
export default async (request: VercelRequest, response: VercelResponse) => {
=======
export default async function handler(request: VercelRequest, response: VercelResponse) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
  }

  // On the dapp, we use 0x0 to denote raw ETH
  if (address === "0x0000000000000000000000000000000000000000") {
    symbol = "ETH"
    name = "Ether"
  }

  if (
    address ===
    web3.utils.toChecksumAddress("0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9")
  ) {
    // FTX swapped the name and symbol so we will correct for that.
    symbol = "FTT";
    name = "FTX Token";
  }

  // OT-aUSDC
  if (
    address ===
    web3.utils.toChecksumAddress("0x8fcb1783bf4b71a51f702af0c266729c4592204a")
  ) {
    // OT token names are too long.
    symbol = "OT-aUSDC22";
    name = "OT-aUSDC DEC22-20";
  }

  // OT-cDAI22
  if (
    address ===
    web3.utils.toChecksumAddress("0x3d4e7f52efafb9e0c70179b688fc3965a75bcfea")
  ) {
    // OT token names are too long.
    symbol = "OT-cDAI22";
    name = "OT-cDAI DEC22-20";
  }

  // xSDT
  if (
    address ===
    web3.utils.toChecksumAddress("0xaC14864ce5A98aF3248Ffbf549441b04421247D3")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/xSDT.png";
  }

  // sd3Crv
  if (
    address ===
    web3.utils.toChecksumAddress("0xB17640796e4c27a39AF51887aff3F8DC0daF9567")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sd3Crv.png";
  }

  // sdeursCRV
  if (
    address ===
    web3.utils.toChecksumAddress("0xCD6997334867728ba14d7922f72c893fcee70e84")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sdeursCRV.png";
  }

  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0xFD4D8a17df4C27c1dD245d153ccf4499e806C87D")
  ) {
    name = "linkCRV Gauge Deposit";
    symbol = "[G]linkCRV";
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/crvLINKGauge.png";
  }

  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0")
  ) {
    name = "Wrapped Staked Ether";
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/wstETH.png";
  }

  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/sOHM.png";
  }

  if (symbol === "G-UNI") {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/G-UNI.png";
  }

  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0xe7b982f901b47d6fa21f5d1f3ad4b64c105060bf")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/spacechain/vcred-token/main/bee-256-256.png";
  }

  // Handle Token Logos

  // fxAUD
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x7E141940932E3D13bfa54B224cb4a16510519308")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxAUDDarkLogo.png";
  }

  // fxEUD
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x116172b2482c5dc3e6f445c16ac13367ac3fcd35")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxEURDarkLogo.png";
  }

  // fxPHP
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x3d147cd9ac957b2a5f968de9d1c6b9d0872286a0")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/fxPHPDarkLogo.png";
  }

  // Tokemak
  // tTOKE
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0xa760e26aA76747020171fCF8BdA108dFdE8Eb930")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tTOKE.png";
  }

  // tUSDC
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x04bDA0CF6Ad025948Af830E75228ED420b0e860d")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tUSDC.png";
  }

  // tWETH
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tWETH.png";
  }

  // tUNILP
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x1b429e75369ea5cd84421c1cc182cee5f3192fd3")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/UniV2.png";
  }

  // tSUSHILP
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x8858A739eA1dd3D80FE577EF4e0D03E88561FaA3")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/tSUSHI.png";
  }

  // txJP
  if (
    web3.utils.toChecksumAddress(address) ===
    web3.utils.toChecksumAddress("0x961dd84059505d59f82ce4fb87d3c09bec65301d")
  ) {
    logoURL =
      "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/tokens/TXJP.png";
  }
>>>>>>> Stashed changes

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

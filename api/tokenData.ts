import Vibrant from "node-vibrant";
import { Palette } from "node-vibrant/lib/color";
import fetch from "node-fetch";
import Web3 from "web3";
import ERC20ABI from "../src/rari-sdk/abi/ERC20.json";

import { NowRequest, NowResponse } from "@vercel/node";
import { turboGethURL } from "../src/utils/web3Providers";

const web3 = new Web3(turboGethURL);

export default async (request: NowRequest, response: NowResponse) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "max-age=3600, s-maxage=3600");

  const address = web3.utils.toChecksumAddress(request.query.address as string);

  const tokenContract = new web3.eth.Contract(ERC20ABI as any, address);

  const [decimals, rawData] = await Promise.all([
    tokenContract.methods
      .decimals()
      .call()
      .then((res) => parseFloat(res)),

    fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum/contract/" + address
    ).then((res) => res.json()),
  ]);

  let name: string;
  let symbol: string;
  let logoURL: string | undefined;

  if (rawData.error) {
    name = await tokenContract.methods.name().call();
    symbol = await tokenContract.methods.symbol().call();

    //////////////////
    // Edge cases: //
    /////////////////
    if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xFD4D8a17df4C27c1dD245d153ccf4499e806C87D")
    ) {
      name = "linkCRV Gauge Deposit";
      symbol = "[G]linkCRV";
      logoURL =
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/crvLINKGauge.png";
    }

    if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0")
    ) {
      name = "Wrapped Staked Ether";
      logoURL =
        "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/wstETH.png";
    }

    // Fetch the logo from yearn if possible:
    const yearnLogoURL = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${address}/logo-128.png`;
    const yearnLogoResponse = await fetch(yearnLogoURL);
    if (yearnLogoResponse.ok) {
      // A lot of the yearn tokens are curve tokens with long names,
      // so we flatten them here and just remove the Curve part
      symbol = symbol.replace("Curve-", "");
      logoURL = yearnLogoURL;
    }
  } else {
    let {
      symbol: _symbol,
      name: _name,
      image: { small },
    } = rawData;

    symbol = _symbol == _symbol.toLowerCase() ? _symbol.toUpperCase() : _symbol;
    name = _name;

    // Prefer the logo from trustwallet if possible!
    const trustWalletURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
    const trustWalletLogoResponse = await fetch(trustWalletURL);
    if (trustWalletLogoResponse.ok) {
      logoURL = trustWalletURL;
    } else {
      logoURL = small;
    }
  }

  if (
    address ===
    web3.utils.toChecksumAddress("0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9")
  ) {
    // FTX swapped the name and symbol so we will correct for that.
    symbol = "FTT";
    name = "FTX Token";
  }

  const basicTokenInfo = {
    symbol,
    name,
    decimals,
  };

  let color: Palette;
  try {
    if (logoURL == undefined) {
      // If we have no logo no need to try to get the color
      // just go to the catch block and return the default logo.
      throw "Go to the catch block";
    }

    color = await Vibrant.from(logoURL).getPalette();
  } catch (error) {
    response.json({
      ...basicTokenInfo,
      color: "#FFFFFF",
      overlayTextColor: "#000",
      logoURL:
        "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg",
    });

    return;
  }

  if (!color.Vibrant) {
    response.json({
      ...basicTokenInfo,
      color: "#FFFFFF",
      overlayTextColor: "#000",
      logoURL,
    });

    return;
  }

  response.json({
    ...basicTokenInfo,
    color: color.Vibrant.getHex(),
    overlayTextColor: color.Vibrant.getTitleTextColor(),
    logoURL,
  });
};

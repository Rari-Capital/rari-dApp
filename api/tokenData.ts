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
  let logoURL: string;

  if (rawData.error) {
    name = await tokenContract.methods.name().call();
    symbol = await tokenContract.methods.symbol().call();

    // Edge cases
    if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xB8c77482e45F1F44dE1745F52C74426C631bDD52")
    ) {
      // BNB
      response.json({
        name,
        symbol,
        decimals,
        color: "#E6B93D",
        overlayTextColor: "#FFFFFF",
        logoURL:
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png",
      });

      return;
    } else if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xFD4D8a17df4C27c1dD245d153ccf4499e806C87D")
    ) {
      // crvLINK-gauges
      response.json({
        name: "linkCRV Gauge Deposit",
        symbol: "[G]linkCRV",
        decimals,
        color: "#2A5ADA",
        overlayTextColor: "#FFFFFF",
        logoURL:
          "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/crvLINKGauge.png",
      });

      return;
    } else if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xD81b1A8B1AD00Baa2D6609E0BAE28A38713872f7")
    ) {
      // PcUSDC
      response.json({
        name: "PoolTogether USDC Ticket",
        symbol: "PcUSDC",
        decimals,
        color: "#4C249F",
        overlayTextColor: "#FFFFFF",
        logoURL:
          "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/ptUSDC.png",
      });

      return;
    } else if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xD81b1A8B1AD00Baa2D6609E0BAE28A38713872f7")
    ) {
      // PcUSDC
      response.json({
        name: "PoolTogether USDC Ticket",
        symbol: "PcUSDC",
        decimals,
        color: "#4C249F",
        overlayTextColor: "#FFFFFF",
        logoURL:
          "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/ptUSDC.png",
      });

      return;
    }

    // Fetch the logo from yearn if possible!
    const yearnLogoURL = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${address}/logo-128.png`;
    const yearnLogoResponse = await fetch(yearnLogoURL);
    if (yearnLogoResponse.ok) {
      symbol = symbol.replace("Curve-", "");
      logoURL = yearnLogoURL;
    } else {
      response.json({
        name,
        symbol,
        decimals,
        color: "#FFFFFF",
        overlayTextColor: "#000000",
        logoURL:
          "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg",
      });

      return;
    }
  } else {
    let {
      symbol: _symbol,
      name: _name,
      image: { small },
    } = rawData;

    symbol = _symbol == _symbol.toLowerCase() ? _symbol.toUpperCase() : _symbol;
    name = _name;

    // Fetch the logo from trustwallet if possible!
    const trustWalletURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
    const trustWalletLogoResponse = await fetch(trustWalletURL);
    if (trustWalletLogoResponse.ok) {
      logoURL = trustWalletURL;
    } else {
      logoURL = small;
    }
  }

  // FTX swapped the name and symbol so we will correct for that.
  if (
    address ===
    web3.utils.toChecksumAddress("0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9")
  ) {
    symbol = name;
    name = symbol;
  }

  const basicTokenInfo = {
    symbol,
    name,
    decimals,
  };

  let color: Palette;
  try {
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

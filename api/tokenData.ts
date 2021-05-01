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

  if (rawData.error) {
    const name = await tokenContract.methods.name().call();
    const symbol = await tokenContract.methods.symbol().call();

    // BNB
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
    } else if (
      web3.utils.toChecksumAddress(address) ===
      web3.utils.toChecksumAddress("0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a")
    ) {
      // crvLINK
      response.json({
        name,
        symbol,
        decimals,
        color: "#2A5ADA",
        overlayTextColor: "#FFFFFF",
        logoURL:
          "https://raw.githubusercontent.com/Rari-Capital/rari-dApp/master/src/static/crvLINK.png",
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
    }

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

  let {
    symbol,
    name,
    image: { small },
  } = rawData;

  // FTX swapped the name and symbol so we will correct for that.
  if (
    address ===
    web3.utils.toChecksumAddress("0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9")
  ) {
    symbol = name;
    name = symbol;
  }

  let logoURL;

  // Fetch the logo from trustwallet if possible!
  const trustWalletURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  const trustWalletLogoResponse = await fetch(trustWalletURL);
  if (trustWalletLogoResponse.ok) {
    logoURL = trustWalletURL;
  } else {
    logoURL = small;
  }

  const basicTokenInfo = {
    symbol: symbol.toUpperCase(),
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

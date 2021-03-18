import { NowRequest, NowResponse } from "@vercel/node";

import Rari from "../src/rari-sdk/index";

import { alchemyURL } from "../src/utils/web3Providers";

import { fetchTVL } from "../src/utils/fetchTVL";
import {
  fetchDAIPoolAPY,
  fetchPoolAPY,
  fetchRGTAPR,
} from "../src/utils/fetchPoolAPY";
import { Pool } from "../src/utils/poolUtils";

export default async (request: NowRequest, response: NowResponse) => {
  const rari = new Rari(alchemyURL);

  const [
    rawTVL,
    rawStablePoolAPY,
    rawYieldPoolAPY,
    rawEthPoolAPY,
    rawDaiPoolAPY,
    rawRgtAPR,
  ] = await Promise.all([
    fetchTVL(rari),
    fetchPoolAPY(rari, Pool.STABLE),
    fetchPoolAPY(rari, Pool.YIELD),
    fetchPoolAPY(rari, Pool.ETH),
    fetchDAIPoolAPY(rari),
    fetchRGTAPR(rari),
  ]);

  const tvl = parseFloat(rari.web3.utils.fromWei(rawTVL));

  const stablePoolAPY = parseFloat(rawStablePoolAPY);
  const yieldPoolAPY = parseFloat(rawYieldPoolAPY);
  const ethPoolAPY = parseFloat(rawEthPoolAPY);
  const daiPoolAPY = parseFloat(rawDaiPoolAPY);

  const rgtAPR = parseFloat(rawRgtAPR);

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "s-maxage=600");

  response.json({
    tvl,
    rgtAPR,
    stablePoolAPY,
    ethPoolAPY,
    yieldPoolAPY,
    daiPoolAPY,
  });
};

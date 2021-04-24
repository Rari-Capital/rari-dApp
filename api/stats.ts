import { NowRequest, NowResponse } from "@vercel/node";

import Rari from "../src/rari-sdk/index";

import {
  turboGethURL,
  initFuseWithProviders,
} from "../src/utils/web3Providers";

import { perPoolTVL } from "../src/utils/fetchTVL";
import {
  fetchDAIPoolAPY,
  fetchPoolAPY,
  fetchRGTAPR,
} from "../src/utils/fetchPoolAPY";
import { Pool } from "../src/utils/poolUtils";

const rari = new Rari(turboGethURL);
const fuse = initFuseWithProviders();

const mantissaToFloat = (BN: any) => {
  return parseFloat(rari.web3.utils.fromWei(BN));
};

export default async (request: NowRequest, response: NowResponse) => {
  const [
    tvls,
    rawStablePoolAPY,
    rawYieldPoolAPY,
    rawEthPoolAPY,
    rawDaiPoolAPY,
    rawRgtAPR,
  ] = await Promise.all([
    perPoolTVL(rari, fuse),
    fetchPoolAPY(rari, Pool.STABLE),
    fetchPoolAPY(rari, Pool.YIELD),
    fetchPoolAPY(rari, Pool.ETH),
    fetchDAIPoolAPY(rari),
    fetchRGTAPR(rari),
  ]);

  const stablePoolAPY = parseFloat(rawStablePoolAPY);
  const yieldPoolAPY = parseFloat(rawYieldPoolAPY);
  const ethPoolAPY = parseFloat(rawEthPoolAPY);
  const daiPoolAPY = parseFloat(rawDaiPoolAPY);

  const rgtAPR = parseFloat(rawRgtAPR);

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "s-maxage=600");

  response.json({
    tvl: mantissaToFloat(
      tvls.stableTVL
        .add(tvls.yieldTVL)
        .add(tvls.ethTVL)
        .add(tvls.daiTVL)
        .add(tvls.stakedTVL)
        .add(tvls.fuseTVL)
    ),

    stableTVL: mantissaToFloat(tvls.stableTVL),
    yieldTVL: mantissaToFloat(tvls.yieldTVL),
    ethTVL: mantissaToFloat(tvls.ethTVL),
    daiTVL: mantissaToFloat(tvls.daiTVL),
    stakedTVL: mantissaToFloat(tvls.stakedTVL),
    fuseTVL: mantissaToFloat(tvls.fuseTVL),
    ///////////
    rgtAPR,
    stablePoolAPY,
    ethPoolAPY,
    yieldPoolAPY,
    daiPoolAPY,
  });
};

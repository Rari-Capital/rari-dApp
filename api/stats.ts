import { NowRequest, NowResponse } from "@vercel/node";

import Rari from "../src/rari-sdk/index";
import EthereumPool from "../src/rari-sdk/pools/ethereum";
import StablePool from "../src/rari-sdk/pools/stable";
import YieldPool from "../src/rari-sdk/pools/yield";
import DaiPool from "../src/rari-sdk/pools/dai";

const fetchTVL = async (rari: Rari) => {
  const [
    stableTVL,
    yieldTVL,
    ethTVLInETH,
    daiTVL,
    ethPriceBN,
    stakedTVL,
  ] = await Promise.all([
    rari.pools.stable.balances.getTotalSupply(),
    rari.pools.yield.balances.getTotalSupply(),
    rari.pools.ethereum.balances.getTotalSupply(),
    rari.pools.dai.balances.getTotalSupply(),
    rari.getEthUsdPriceBN(),
    rari.governance.rgt.sushiSwapDistributions.totalStakedUsd(),
  ]);

  const ethTVL = ethTVLInETH.mul(ethPriceBN.div(rari.web3.utils.toBN(1e18)));

  return stableTVL.add(yieldTVL).add(ethTVL).add(daiTVL).add(stakedTVL);
};

const fetchPoolAPY = async (rari: Rari, pool: string) => {
  let sdkPool: StablePool | EthereumPool | YieldPool | DaiPool;

  if (pool === "eth") {
    sdkPool = rari.pools.ethereum;
  } else if (pool === "stable") {
    sdkPool = rari.pools.stable;
  } else if (pool === "yield") {
    sdkPool = rari.pools.yield;
  } else {
    sdkPool = rari.pools.dai;
  }

  const poolRawAPY = await sdkPool.apy.getCurrentRawApy();

  const poolAPY = parseFloat(
    rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
  ).toFixed(2);

  return poolAPY;
};

const fetchRGTAPR = async (rari: Rari) => {
  const blockNumber = await rari.web3.eth.getBlockNumber();

  const tvl = await fetchTVL(rari);

  const rgtRawAPR = await rari.governance.rgt.distributions.getCurrentApr(
    blockNumber,
    tvl
  );

  const rgtAPR = parseFloat(
    rari.web3.utils.fromWei(rgtRawAPR.mul(rari.web3.utils.toBN(100)))
  ).toFixed(0);

  return rgtAPR;
};

export default async (request: NowRequest, response: NowResponse) => {
  const rari = new Rari(
    `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
  );

  const [
    rawTVL,
    rawStablePoolAPY,
    rawYieldPoolAPY,
    rawEthPoolAPY,
    rawDaiPoolAPY,
    rawRgtAPR,
  ] = await Promise.all([
    fetchTVL(rari),
    fetchPoolAPY(rari, "stable"),
    fetchPoolAPY(rari, "yield"),
    fetchPoolAPY(rari, "eth"),
    fetchPoolAPY(rari, "dai"),
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

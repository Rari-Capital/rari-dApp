import { NowRequest, NowResponse } from "@vercel/node";

import Rari from "../src/rari-sdk/index";
import { Pool } from "../src/context/PoolContext";
import { getSDKPool } from "../src/utils/poolUtils";

const fetchTVL = async (rari: Rari) => {
  const [stableTVL, yieldTVL, ethTVLInETH, ethPriceBN] = await Promise.all([
    rari.pools.stable.balances.getTotalSupply(),
    rari.pools.yield.balances.getTotalSupply(),
    rari.pools.ethereum.balances.getTotalSupply(),
    rari.getEthUsdPriceBN(),
  ]);

  const ethTVL = ethTVLInETH.mul(ethPriceBN.div(rari.web3.utils.toBN(1e18)));

  return stableTVL.add(yieldTVL).add(ethTVL);
};

const fetchPoolAPY = async (rari: Rari, pool: Pool) => {
  const poolRawAPY = await getSDKPool({
    rari,
    pool,
  }).apy.getCurrentRawApy();

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
    rawRgtAPR,
  ] = await Promise.all([
    fetchTVL(rari),
    fetchPoolAPY(rari, Pool.STABLE),
    fetchPoolAPY(rari, Pool.YIELD),
    fetchPoolAPY(rari, Pool.ETH),
    fetchRGTAPR(rari),
  ]);

  const tvl = parseFloat(rari.web3.utils.fromWei(rawTVL));

  const stablePoolAPY = parseFloat(rawStablePoolAPY);
  const yieldPoolAPY = parseFloat(rawYieldPoolAPY);
  const ethPoolAPY = parseFloat(rawEthPoolAPY);

  const rgtAPR = parseFloat(rawRgtAPR);

  response.setHeader("Cache-Control", "s-maxage=360, stale-while-revalidate");
  response.json({ tvl, rgtAPR, stablePoolAPY, ethPoolAPY, yieldPoolAPY });
};

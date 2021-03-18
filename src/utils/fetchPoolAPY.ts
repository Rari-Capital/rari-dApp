import Rari from "../rari-sdk/index";

import { getSDKPool, Pool } from "./poolUtils";

export const fetchRGTAPR = async (rari: Rari) => {
  // TODO: Won't work with all the staked and Fuse TVL included
  //   const blockNumber = await rari.web3.eth.getBlockNumber();

  //   const tvl = await fetchTVL(rari);

  //   const rgtRawAPR = await rari.governance.rgt.distributions.getCurrentApr(
  //     blockNumber,
  //     tvl
  //   );

  //   const rgtAPR = parseFloat(
  //     rari.web3.utils.fromWei(rgtRawAPR.mul(rari.web3.utils.toBN(100)))
  //   ).toFixed(0);

  return "0";
};

export const fetchPoolAPY = async (rari: Rari, pool: Pool) => {
  const poolRawAPY = await getSDKPool({
    rari,
    pool,
  }).apy.getCurrentRawApy();

  const poolAPY = parseFloat(
    rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
  ).toFixed(2);

  return poolAPY;
};

// TODO: Don't hardcode this.
export const fetchDAIPoolAPY = async (rari: Rari) => {
  const poolRawAPY = await rari.pools.dai.apy.getCurrentRawApy();

  const poolAPY = parseFloat(
    rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
  ).toFixed(2);

  return poolAPY;
};

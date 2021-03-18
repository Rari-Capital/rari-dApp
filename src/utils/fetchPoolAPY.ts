import { Pool } from "../context/PoolContext";
import Rari from "../rari-sdk/index";
import { fetchTVL } from "./fetchTVL";
import { getSDKPool } from "./poolUtils";

export const fetchRGTAPR = async (rari: Rari) => {
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

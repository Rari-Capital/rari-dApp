import { useQuery } from "react-query";
import { Pool } from "../context/PoolContext";
import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";

import { getSDKPool } from "../utils/poolUtils";
import { fetchTVL } from "./useTVL";

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

export const useRGTAPR = () => {
  const { rari } = useRari();

  const { data: rgtAPR } = useQuery("rgtAPR", async () => fetchRGTAPR(rari));

  return rgtAPR;
};

export const usePoolAPY = (pool: Pool) => {
  const { rari } = useRari();

  const { data: poolAPY } = useQuery(pool + " apy", async () => {
    const poolRawAPY = await getSDKPool({
      rari,
      pool,
    }).apy.getCurrentRawApy();

    const poolAPY = parseFloat(
      rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
    ).toFixed(2);

    return poolAPY;
  });

  return poolAPY;
};

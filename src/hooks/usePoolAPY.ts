import { useQuery } from "react-query";
import { Pool } from "../context/PoolContext";
import { useRari } from "../context/RariContext";
import { getSDKPool } from "../utils/poolUtils";
import { useTVL } from "./useTVL";

export const usePoolAPY = (pool: Pool) => {
  const { rari } = useRari();

  const { getTVL } = useTVL();

  const { data: apy, isLoading: isAPYLoading } = useQuery(
    pool + " apy",
    async () => {
      const poolRawAPYPromise = getSDKPool({
        rari,
        pool,
      }).apy.getCurrentRawApy();

      const [poolRawAPY, blockNumber, tvl] = await Promise.all([
        poolRawAPYPromise,
        rari.web3.eth.getBlockNumber(),
        getTVL(),
      ]);

      const poolAPY = parseFloat(
        rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
      ).toFixed(2);

      const rgtRawAPR = await rari.governance.rgt.distributions.getCurrentApr(
        blockNumber,
        tvl
      );

      const rgtAPR = parseFloat(
        rari.web3.utils.fromWei(rgtRawAPR.mul(rari.web3.utils.toBN(100)))
      ).toFixed(0);

      return { rgtAPR, poolAPY };
    }
  );

  return { apy, isAPYLoading };
};

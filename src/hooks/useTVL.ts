import { useCallback } from "react";
import { useRari } from "../context/RariContext";

export const useTVL = () => {
  const { rari } = useRari();

  const getTVL = useCallback(async () => {
    const [stableTVL, yieldTVL, ethTVLInETH, ethPriceBN] = await Promise.all([
      rari.pools.stable.balances.getTotalSupply(),
      rari.pools.yield.balances.getTotalSupply(),
      rari.pools.ethereum.balances.getTotalSupply(),
      rari.getEthUsdPriceBN(),
    ]);

    const ethTVL = ethTVLInETH.mul(ethPriceBN.div(rari.web3.utils.toBN(1e18)));

    return stableTVL.add(yieldTVL).add(ethTVL);
  }, [rari]);

  const getNumberTVL = useCallback(async () => {
    return parseFloat(rari.web3.utils.fromWei(await getTVL()));
  }, [rari, getTVL]);

  return { getNumberTVL, getTVL };
};

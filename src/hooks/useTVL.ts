import { useCallback } from "react";
import { useRari } from "../context/RariContext";
import Rari from "../rari-sdk/index";

export const fetchTVL = async (rari: Rari) => {
  const [
    stableTVL,
    yieldTVL,
    ethTVLInETH,
    daiTVL,
    ethPriceBN,
  ] = await Promise.all([
    rari.pools.stable.balances.getTotalSupply(),
    rari.pools.yield.balances.getTotalSupply(),
    rari.pools.ethereum.balances.getTotalSupply(),
    rari.pools.dai.balances.getTotalSupply(),
    rari.getEthUsdPriceBN(),
  ]);

  const ethTVL = ethTVLInETH.mul(ethPriceBN.div(rari.web3.utils.toBN(1e18)));

  return stableTVL.add(yieldTVL).add(ethTVL).add(daiTVL);
};

export const useTVLFetchers = () => {
  const { rari } = useRari();

  const getTVL = useCallback(() => fetchTVL(rari), [rari]);

  const getNumberTVL = useCallback(async () => {
    return parseFloat(rari.web3.utils.fromWei(await getTVL()));
  }, [rari, getTVL]);

  return { getNumberTVL, getTVL };
};

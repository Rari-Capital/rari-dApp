import Rari from "../rari-sdk/index";

export const fetchTVL = async (rari: Rari) => {
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

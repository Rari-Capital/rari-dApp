import Rari from "lib/rari-sdk/index";
import Fuse from "lib/fuse-sdk/src";
import BigNumber from "bignumber.js";

export const fetchFuseTVL = async (fuse: Fuse) => {
  const { 2: suppliedETHPerPool } = await fuse.contracts.FusePoolLens.methods
    .getPublicPoolsWithData()
    .call({ gas: 1e18 });

  const totalSuppliedETH = fuse.web3.utils.toBN(
    new BigNumber(
      suppliedETHPerPool
        .reduce((a: number, b: string) => a + parseInt(b), 0)
        .toString()
    ).toFixed(0)
  );

  return totalSuppliedETH;
};

// Todo - delete this and just make `fetchFuseTVL` do this stuff
export const fetchFuseTVLBorrowsAndSupply = async (
  fuse: Fuse,
  blockNum?: number
) => {
  const { 2: suppliedETHPerPool, 3: borrowedETHPerPool } =
    await fuse.contracts.FusePoolLens.methods
      .getPublicPoolsWithData()
      .call({ gas: 1e18 }, blockNum);

  const totalSuppliedETH = fuse.web3.utils.toBN(
    new BigNumber(
      suppliedETHPerPool
        .reduce((a: number, b: string) => a + parseInt(b), 0)
        .toString()
    ).toFixed(0)
  );

  const totalBorrowedETH = fuse.web3.utils.toBN(
    new BigNumber(
      borrowedETHPerPool
        .reduce((a: number, b: string) => a + parseInt(b), 0)
        .toString()
    ).toFixed(0)
  );

  return { totalSuppliedETH, totalBorrowedETH };
};

export const perPoolTVL = async (rari: Rari, fuse: Fuse) => {
  const [
    stableTVL,
    yieldTVL,
    ethTVLInETH,
    daiTVL,
    ethPriceBN,
    stakedTVL,
    fuseTVLInETH,
  ] = await Promise.all([
    rari.pools.stable.balances.getTotalSupply(),
    rari.pools.yield.balances.getTotalSupply(),
    rari.pools.ethereum.balances.getTotalSupply(),
    rari.pools.dai.balances.getTotalSupply(),
    rari.getEthUsdPriceBN(),
    rari.governance.rgt.sushiSwapDistributions.totalStakedUsd(),
    fetchFuseTVL(fuse),
  ]);

  const ethUSDBN = ethPriceBN.div(rari.web3.utils.toBN(1e18));

  const ethTVL = ethTVLInETH.mul(ethUSDBN);
  const fuseTVL = fuseTVLInETH.mul(ethUSDBN);

  return { stableTVL, yieldTVL, ethTVL, daiTVL, fuseTVL, stakedTVL };
};

export const fetchTVL = async (rari: Rari, fuse: Fuse) => {
  const tvls = await perPoolTVL(rari, fuse);

  return tvls.stableTVL
    .add(tvls.yieldTVL)
    .add(tvls.ethTVL)
    .add(tvls.daiTVL)
    .add(tvls.stakedTVL)
    .add(tvls.fuseTVL);
};

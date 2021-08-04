import Rari from "rari-sdk/index";
import { stringUsdFormatter, BN } from "utils/bigUtils";

export const fetchPoolInterestEarned = async (rari: Rari, address: string) => {
  const [
    stableInterest,
    yieldInterest,
    daiInterest,
    ethInterestInETH,
    ethPriceBN,
  ] = await Promise.all([
    rari.pools.stable.balances.interestAccruedBy(address),
    rari.pools.yield.balances.interestAccruedBy(address),
    rari.pools.dai.balances.interestAccruedBy(address),
    rari.pools.ethereum.balances.interestAccruedBy(address),
    rari.getEthUsdPriceBN(),
  ]);

  const ethInterest = ethInterestInETH.mul(
    ethPriceBN.div(rari.web3.utils.toBN(1e18))
  );

  return {
    totalFormattedEarnings: stringUsdFormatter(
      rari.web3.utils.fromWei(
        stableInterest.add(yieldInterest).add(ethInterest).add(daiInterest)
      )
    ),
    totalEarnings: stableInterest
      .add(yieldInterest)
      .add(ethInterest)
      .add(daiInterest),
    yieldPoolInterestEarned: yieldInterest,
    stablePoolInterestEarned: stableInterest,
    daiPoolInterestEarned: daiInterest,
    ethPoolInterestEarned: ethInterest,
    ethPoolInterestEarnedInETH: ethInterestInETH,
  };
};

export type PoolInterestEarned = {
  totalFormattedEarnings: string;
  totalEarnings: BN;
  daiPoolInterestEarned: BN;
  yieldPoolInterestEarned: BN;
  stablePoolInterestEarned: BN;
  ethPoolInterestEarned: BN;
  ethPoolInterestEarnedInETH: BN;
};

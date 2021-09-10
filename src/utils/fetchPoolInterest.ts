import { BigNumber } from "ethers";
import { Vaults } from "rari-sdk-sharad-v2";
import { stringUsdFormatter } from "utils/bigUtils";
import { fromWei, toBN } from "./ethersUtils";

export const fetchPoolInterestEarned = async (
  rari: Vaults,
  address: string
) => {
  const [stableInterest, yieldInterest, ethInterestInETH, ethPriceBN] =
    await Promise.all([
      rari.pools.stable.balances.interestAccruedBy(address),
      rari.pools.yield.balances.interestAccruedBy(address),
      rari.pools.ethereum.balances.interestAccruedBy(address),
      rari.getEthUsdPriceBN(),
    ]);

  const ethInterest = ethInterestInETH.mul(ethPriceBN.div(toBN(1e18)));

  return {
    totalFormattedEarnings: stringUsdFormatter(
      fromWei(stableInterest.add(yieldInterest).add(ethInterest))
    ),
    totalEarnings: stableInterest.add(yieldInterest).add(ethInterest),
    yieldPoolInterestEarned: yieldInterest,
    stablePoolInterestEarned: stableInterest,
    ethPoolInterestEarned: ethInterest,
    ethPoolInterestEarnedInETH: ethInterestInETH,
  };
};

export type PoolInterestEarned = {
  totalFormattedEarnings: string;
  totalEarnings: BigNumber;
  yieldPoolInterestEarned: BigNumber;
  stablePoolInterestEarned: BigNumber;
  ethPoolInterestEarned: BigNumber;
  ethPoolInterestEarnedInETH: BigNumber;
};

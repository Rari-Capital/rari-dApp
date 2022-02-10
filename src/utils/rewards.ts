import Fuse from "fuse-sdk";
import { createRewardsDistributor } from "./createComptroller";
import { sendWithMultiCall } from "./multicall";

export const claimRewardsFromRewardsDistributors = async (
  fuse: Fuse,
  address: string,
  rewardsDistributors: string[]
) => {
  const methods = rewardsDistributors.map((rDAddress: string) =>
    createRewardsDistributor(rDAddress, fuse).methods.claimRewards(address)
  );

  const addrs = rewardsDistributors;

  const encodedCalls = methods.map((m, i) => {
    return [addrs[i], m.encodeABI()];
  });

  const returnDatas = await sendWithMultiCall(fuse, encodedCalls, address);

  console.log("claimAllRewards", { returnDatas });
};

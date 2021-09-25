import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";
import { createRewardsDistributor } from "utils/createComptroller";
import { BN } from "utils/bigUtils";


export function useUnclaimedFuseRewards() {
  const { fuse, address } = useRari();

  // 1. Fetch all Fuse Pools User has supplied to + their Rewards Distribs.
  const { data: _rewardsDistributorsByFusePool, error } = useQuery(
    "unclaimedRewards for " + address,
    async () => {
      // fetchTokenBalance(tokenAddress, rari.web3, addressToCheck)

      const rewardsDistributorsByFusePool =
        await fuse.contracts.FusePoolLens.methods
          .getRewardsDistributorsBySupplier(
            "0x6997060D6bA220d8A0B102e0003Fe12796b874bd"
          )
          .call();

      return rewardsDistributorsByFusePool ?? [];
    }
  );

  const rewardsDistributorsByFusePool = _rewardsDistributorsByFusePool as
    | string[][]
    | undefined;

  // 2. Reduce this 2D array into a single deduped array of RewardsDistributors
  const uniqueRDs: string[] = [
    ...new Set(
      rewardsDistributorsByFusePool?.reduce(function (prev, curr) {
        return prev.concat(curr);
      }) ?? []
    ),
  ];

  console.log({ uniqueRDs });

  // 3. Create map of {[rewardToken: string] : RewardDistributor[] }

  // 3a. Query all individual RewardsDistributors for their rewardTokens
  const { data: _rewardsDistributors, error: _rdError } = useQuery(
    "rewardsDistributor data for " + address,
    async () => {
      const stuff = await Promise.all(
        uniqueRDs.map(async (rewardsDistributorAddress) => {
          const instance = createRewardsDistributor(
            rewardsDistributorAddress,
            fuse
          );
          const rewardToken = await instance.methods.rewardToken().call();
          const _markets = await instance.methods.getAllMarkets().call();

          //   const markets = _markets.length
          //     ? await Promise.all(
          //         _markets.map((cTokenAddr: string) => {
          //           const cTokeninstance = createCToken(fuse, cTokenAddr);
          //         })
          //       )
          //     : [];

          return {
            rewardToken,
            rewardsDistributorAddress,
            markets: _markets,
          };
        })
      );

      return stuff;
    }
  );

  // This is an array of RewardsDistributors we care about for this user
  const rewardsDistributors = _rewardsDistributors as RewardsDistributor[];
  // This is a map of RewardsDistributors {rDaddress: RewardsDistributor}
  const rewardsDistributorsMap: {
    [rewardsDistributorAddr: string]: RewardsDistributor;
  } = {};

  rewardsDistributors?.length &&
    rewardsDistributors.forEach((rD) => {
      rewardsDistributorsMap[rD.rewardsDistributorAddress] = rD;
    });

  //   3b. Construct the map
  const rewardTokensMap: RewardsTokenMap = {};
  rewardsDistributors?.length &&
    rewardsDistributors.forEach((rD) => {
      const key = rD.rewardToken;
      // if value doesnt exist create it as array
      if (!rewardTokensMap[key]) {
        rewardTokensMap[key] = [rD];
      } else {
        // else append to array
        rewardTokensMap[key].push(rD);
      }
    });

  //  4.  Use getUnclaimedRewardsByDistributor
  const { data: _unclaimed, error: unclaimedErr } = useQuery(
    "unclaimed for " + address,
    async () => {
      const unclaimedResults = await fuse.contracts.FusePoolLens.methods
        .getUnclaimedRewardsByDistributors(address, uniqueRDs)
        .call();

      console.log({ address, uniqueRDs, unclaimedResults });

      const rewardTokens = unclaimedResults[0];
      const unclaimedAmounts = unclaimedResults[1];

      const results: { rewardToken: string; unclaimed: BN }[] = [];

      if (rewardTokens.length)
        for (let i = 0; i < rewardTokens.length; i++) {
          const rewardToken = rewardTokens[i];
          const unclaimed = fuse.web3.utils.toBN(unclaimedAmounts[i]);
          const x = {
            rewardToken,
            unclaimed,
          };

          results.push(x);
        }

      return results;
    }
  );

  // Filter by claimable balances greater than 0
  const unclaimed: UnclaimedFuseReward[] =
    _unclaimed?.filter((fuseUnclaimed) => {
      if (parseFloat(fuseUnclaimed.unclaimed.toString()) > 0) {
        return true;
      }
    }) ?? [];

  console.log({ _unclaimed, unclaimed });

  //   console.log("rewards2", {
  //     rewardsDistributorsByFusePool,
  //     uniqueRDs,
  //     rewardsDistributors,
  //     rewardsDistributorsMap,
  //     rewardTokensMap,
  //     unclaimed,
  //   });

  //   handle generic err
  const oopsie = error || _rdError || unclaimedErr;
  if (oopsie) console.log({ oopsie });

  //   return uniqueRDs;

  return { rewardsDistributorsMap, rewardTokensMap, unclaimed };
}

// maps a rewardTtoken to an array of RD addresses
export type RewardsTokenMap = {
  [rewardToken: string]: RewardsDistributor[];
};

export interface RewardsDistributor {
  rewardToken: string;
  rewardsDistributorAddress: string;
  markets: string[];
}

export interface UnclaimedFuseReward {
  rewardToken: string;
  unclaimed: BN;
}
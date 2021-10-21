import { createCToken } from "utils/createComptroller";
import { useRari } from "context/RariContext";
import { TokensDataMap, useTokensDataAsMap } from "hooks/useTokenData";
import { useMemo } from "react";
import { useQuery } from "react-query";
import {
  CTokenRewardsDistributorIncentivesWithRatesMap,
  useIncentivesWithRates,
} from "./useRewardAPY";

export interface CTokenRewardsDistributorIncentives {
  rewardsDistributorAddress: string;
  rewardToken: string;
  borrowSpeed: number;
  supplySpeed: number;
}

export interface CTokenIncentivesMap {
  [cTokenAddress: string]: CTokenRewardsDistributorIncentives[];
}

// Maps a rewardsDistributor to an array of all its ctokenaddresses
export interface RewardsDistributorCTokensMap {
  [rewardsDistributorAddress: string]: string[];
}

export interface IncentivesData {
  hasIncentives: boolean;
  incentives: CTokenRewardsDistributorIncentivesWithRatesMap;
  rewardsDistributorCtokens: RewardsDistributorCTokensMap;
  rewardTokensData: TokensDataMap;
}

export function usePoolIncentives(comptroller?: string): IncentivesData {
  const { fuse } = useRari();

  // 1. Make Call to FusePoolLens
  const { data } = useQuery(
    "Pool incentives for comptroller " + comptroller,
    async () => {
      if (!comptroller) return [];

      const result = await fuse.contracts.FusePoolLensSecondary.methods
        .getRewardSpeedsByPool(comptroller)
        .call();

      return result;
    }
  );

  // 2. Destructure data from Contract call
  const cTokens: string[] = data?.[0] ?? [];
  const rewardsDistributors: string[] = data?.[1] ?? [];
  const rewardTokens: string[] = data?.[2] ?? [];
  const supplySpeeds: string[][] = data?.[3] ?? [];
  const borrowSpeeds: string[][] = data?.[4] ?? [];

  const rewardTokensData = useTokensDataAsMap(rewardTokens);

  // 3. Iterate through data
  ////  rewardsDistributors & rewardTokens are ordered by matching indexes
  ////  supplySpeeds/borrowSpeeds is a 2d array where the first level is ordered by matching indices with `cTokens`, and each nested array has matching indices with `rewardDistributors`;
  const [incentives, rewardsDistributorCtokens]: [
    CTokenIncentivesMap,
    RewardsDistributorCTokensMap
  ] = useMemo(() => {
    const poolIncentives: CTokenIncentivesMap = {};
    const rewardsDistributorCTokensMap: RewardsDistributorCTokensMap = {};

    // Loop through the data and construct the final object
    for (let i = 0; i < cTokens.length; i++) {
      // i contains the index of the current cToken
      const cTokenAddress = cTokens[i];
      const distributorSupplySpeedsForCToken: string[] = supplySpeeds[i]; //this a 1d array of
      const distributorBorrowSpeedsForCToken: string[] = borrowSpeeds[i];

      for (let j = 0; j < distributorBorrowSpeedsForCToken.length; j++) {
        // j contains the index of the current rewardsDistributor.
        // Even if a CToken has no RewardsDistributor assigned to it, there will still be a value in this array for it. We will handle this discrepancy below
        const rewardsDistributorAddress = rewardsDistributors[j];
        const rewardToken = rewardTokens[j];
        const supplySpeed = parseFloat(distributorSupplySpeedsForCToken[j]);
        const borrowSpeed = parseFloat(distributorBorrowSpeedsForCToken[j]);

        const obj: CTokenRewardsDistributorIncentives = {
          supplySpeed,
          borrowSpeed,
          rewardToken,
          rewardsDistributorAddress,
        };

        // if a Ctoken has no supply or borrow speed set, skip adding it
        if (supplySpeed || borrowSpeed) {
          if (!poolIncentives[cTokenAddress]) {
            // Update the Mapping of CToken => CTokenRewardsDistributorIncentives[]
            poolIncentives[cTokenAddress] = [obj];
          } else poolIncentives[cTokenAddress].push(obj);

          //   Update the map of rewardsDistributorAddress => CToken[]
          if (!rewardsDistributorCTokensMap[rewardsDistributorAddress]) {
            rewardsDistributorCTokensMap[rewardsDistributorAddress] = [
              cTokenAddress,
            ];
          } else
            rewardsDistributorCTokensMap[rewardsDistributorAddress].push(
              cTokenAddress
            );
        }
      }
    }

    return [poolIncentives, rewardsDistributorCTokensMap];
  }, [cTokens, rewardsDistributors, rewardTokens, supplySpeeds, borrowSpeeds]);

  const hasIncentives = useMemo(
    () => !!Object.keys(incentives).length,
    [incentives]
  );

  const incentivesWithRates = useIncentivesWithRates(incentives, rewardTokens, comptroller!);
  // const  = useAssetPricesInEth(

  if (hasIncentives) {
    console.log({ incentives });
  }

  return {
    hasIncentives,
    incentives: incentivesWithRates,
    rewardTokensData,
    rewardsDistributorCtokens,
  };
}

export interface CTokensUnderlyingMap {
  [cTokenAddr: string]: string;
}

export const useCTokensUnderlying = (
  cTokenAddrs: string[]
): CTokensUnderlyingMap => {
  const { fuse } = useRari();
  const { data: cTokensUnderlying } = useQuery(
    "CTokens underlying for " + cTokenAddrs?.join(","),
    async () => {
      const _map: CTokensUnderlyingMap = {};

      await Promise.all(
        cTokenAddrs.map(async (cTokenAddr) => {
          const ctokenInstance = createCToken(fuse, cTokenAddr);
          const underlying = await ctokenInstance.methods.underlying().call();
          _map[cTokenAddr] = underlying;
        })
      );

      return _map;
    }
  );

  return cTokensUnderlying ?? {};
};

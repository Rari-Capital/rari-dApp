import { ClaimMode } from "components/shared/ClaimRGTModal";
import { useMemo } from "react";
import { toBN } from "utils/bigUtils";
import Web3 from "web3";
import {
  UnclaimedFuseReward,
  useUnclaimedFuseRewards,
} from "./useUnclaimedFuseRewards";
import { useUnclaimedRGT } from "./useUnclaimedRGT";

export interface UseClaimableReturn {
  unclaimedRGT?: number;
  privateUnclaimedRGT?: number;
  pool2UnclaimedRGT?: number;
  unclaimedFuseRewards?: UnclaimedFuseReward[];
  hasClaimableRewards: boolean;
  allClaimable: GenericClaimableReward[];
}

export interface GenericClaimableReward {
  mode: ClaimMode;
  unclaimed: UnclaimedFuseReward;
}

// 1 type of reward = RGT rewards

// 2nd type of reward = FUse Rewards
export type FuseReward = {
    comptroller: string;
    rewardsDistibutors?:  string[] //addresses of RDs
    unclaimedBalancesForPool: CTokenUnclaimedForPool[]
    
}

interface CTokenUnclaimedForPool {

}

const RGT = "0xd291e7a03283640fdc51b121ac401383a46cc623";

export function useClaimable(showPrivate: boolean = false): UseClaimableReturn {
  const { unclaimed: unclaimedFuseRewards } = useUnclaimedFuseRewards();

  const { unclaimedRGT, privateUnclaimedRGT, pool2UnclaimedRGT } =
    useUnclaimedRGT();

  console.log({ unclaimedFuseRewards });

  const hasClaimableRewards: boolean = useMemo(() => {
    if (
      (!!pool2UnclaimedRGT && pool2UnclaimedRGT > 0) ||
      (!!privateUnclaimedRGT && privateUnclaimedRGT > 0) ||
      (!!unclaimedRGT && unclaimedRGT > 0)
    )
      return true;

    // If any unclaimed value is greater than 0 we have claimables
    if (unclaimedFuseRewards.length) return true;

    return false;
  }, [
    pool2UnclaimedRGT,
    privateUnclaimedRGT,
    unclaimedRGT,
    unclaimedFuseRewards,
  ]);

  // Construct a list of claimable rewards across reward types
  const allClaimable: GenericClaimableReward[] = useMemo(() => {
    // Fuse Rewards
    const fuseRewards: GenericClaimableReward[] =
      unclaimedFuseRewards?.map((unclaimedFuseReward) => ({
        mode: "fuse",
        unclaimed: unclaimedFuseReward,
      })) ?? [];

    console.log({ unclaimedFuseRewards });

    // RGT Rewards
    const rgtRewards: GenericClaimableReward[] = [];

    const constructReward = (mode: ClaimMode, amount: number) => {
      const reward: GenericClaimableReward = {
        mode,
        unclaimed: {
          rewardToken: RGT,
          unclaimed: Web3.utils.toBN(amount),
        },
      };
      return reward;
    };

    if (showPrivate && privateUnclaimedRGT)
      rgtRewards.push(constructReward("private", privateUnclaimedRGT));
    if (unclaimedRGT)
      rgtRewards.push(constructReward("yieldagg", unclaimedRGT));
    if (pool2UnclaimedRGT)
      rgtRewards.push(constructReward("pool2", pool2UnclaimedRGT));

    return [...rgtRewards, ...fuseRewards];
  }, [
    showPrivate,
    unclaimedFuseRewards,
    unclaimedRGT,
    privateUnclaimedRGT,
    pool2UnclaimedRGT,
  ]);

  return {
    unclaimedRGT,
    privateUnclaimedRGT,
    pool2UnclaimedRGT,
    unclaimedFuseRewards,
    hasClaimableRewards,
    allClaimable,
  };
}
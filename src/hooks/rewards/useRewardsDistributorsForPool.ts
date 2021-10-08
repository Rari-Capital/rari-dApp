import { useRari } from "context/RariContext";
import { useQuery } from "react-query";
import { createComptroller } from "utils/createComptroller";

export interface RewardsDistributor {
  address: string;
  rewardToken: string;
  admin: string;
}

export const useRewardsDistributorsForPool = (
  comptrollerAddress?: string
): RewardsDistributor[] => {
  const { fuse } = useRari();

  const { data, error } = useQuery(
    comptrollerAddress + " rewardsDistributors",
    async () => {
      if (!comptrollerAddress) return [];
      const comptroller = createComptroller(comptrollerAddress, fuse);

      const rewardsDistributors: string[] = await comptroller.methods
        .getRewardsDistributors()
        .call();

      console.log({ rewardsDistributors });

      if (!rewardsDistributors.length) return [];

      const distributors: RewardsDistributor[] = await Promise.all(
        rewardsDistributors.map(async (addr) => {
          const distributor = new fuse.web3.eth.Contract(
            JSON.parse(
              fuse.compoundContracts[
                "contracts/RewardsDistributorDelegate.sol:RewardsDistributorDelegate"
              ].abi
            ),
            addr
          );

          const ret = {
            address: addr,
            rewardToken: await distributor.methods.rewardToken().call(),
            admin: await await distributor.methods.admin().call(),
          };
          return ret;
        })
      );

      return distributors;
    }
  );
  return data ?? [];
};

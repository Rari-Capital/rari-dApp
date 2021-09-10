import { useQuery } from "react-query";
import { useSaffronData } from "./useSaffronData";

import { tranchePoolIndex, TranchePool } from "./useSaffronData";
import { fromWei } from "utils/ethersUtils";

export const useSFIDistributions = () => {
  const { saffronStrategy } = useSaffronData();

  const { data: sfiDistributions } = useQuery("sfiDistributions", async () => {
    const DAI = fromWei(
      await saffronStrategy.methods
        .pool_SFI_rewards(tranchePoolIndex(TranchePool.DAI))
        .call()
    );
    const USDC = fromWei(
      await saffronStrategy.methods
        .pool_SFI_rewards(tranchePoolIndex(TranchePool.USDC))
        .call()
    );
    return { DAI, USDC };
  });

  return sfiDistributions;
};

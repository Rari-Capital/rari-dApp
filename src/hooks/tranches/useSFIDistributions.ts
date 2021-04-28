import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { useSaffronData } from "./useSaffronData";

import { tranchePoolIndex, TranchePool } from "./useSaffronData";

export const useSFIDistributions = () => {
  const { rari } = useRari();
  const { saffronStrategy } = useSaffronData();

  const { data: sfiDistributions } = useQuery("sfiDistributions", async () => {
    const DAI = rari.web3.utils.fromWei(
      await saffronStrategy.methods
        .pool_SFI_rewards(tranchePoolIndex(TranchePool.DAI))
        .call()
    );
    const USDC = rari.web3.utils.fromWei(
      await saffronStrategy.methods
        .pool_SFI_rewards(tranchePoolIndex(TranchePool.USDC))
        .call()
    );
    return { DAI, USDC };
  });

  return sfiDistributions;
};


import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { useSaffronData } from "./useSaffronData";

export enum TranchePool {
    DAI = "DAI",
    USDC = "USDC",
  }

export const tranchePoolIndex = (tranchePool: TranchePool) => {
    // TODO: CHANGE USDC TO WHATEVER IT BECOMES LATER
    return tranchePool === TranchePool.DAI ? 9 : 0;
  };

export const useSFIDistributions = () => {

    const { rari } = useRari()
    const { saffronStrategy } = useSaffronData()



    const { data: sfiDistributions } = useQuery(
        "sfiDistributions",
        async () => {
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

    return sfiDistributions
}

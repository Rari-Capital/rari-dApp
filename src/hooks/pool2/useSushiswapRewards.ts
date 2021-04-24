import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

export const useHasSushiswapRewardsStarted = () => {

    const { rari } = useRari();

    const { data: hasStarted } = useQuery(
      "hasSushiswapRewardsStarted",
      async () => {
        const block = await rari.web3.eth.getBlockNumber();
    
        const startingBlock =
          rari.governance.rgt.sushiSwapDistributions.DISTRIBUTION_START_BLOCK;
    
        return block >= startingBlock;
      }
    );

    return hasStarted
}



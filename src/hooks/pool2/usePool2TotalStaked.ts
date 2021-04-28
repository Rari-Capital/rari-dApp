import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

export const usePool2TotalStaked = () => {
  const { rari } = useRari();

  const { data: totalStaked } = useQuery("pool2TotalStaked", async () => {
    return parseFloat(
      rari.web3.utils.fromWei(
        await rari.governance.rgt.sushiSwapDistributions.totalStakedUsd()
      )
    );
  });

  return totalStaked;
};

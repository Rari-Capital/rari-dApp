import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { fromWei } from "utils/ethersUtils";

export const usePool2TotalStaked = () => {
  const { rari } = useRari();

  const { data: totalStaked } = useQuery("pool2TotalStaked", async () => {
    return parseFloat(
      fromWei(await rari.governance.rgt.sushiSwapDistributions.totalStakedUsd())
    );
  });

  return totalStaked;
};

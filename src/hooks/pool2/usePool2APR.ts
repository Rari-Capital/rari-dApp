import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

export const usePool2APR = () => {
  const { rari } = useRari();

  const { data: earned } = useQuery("pool2APR", async () => {
    const blockNumber = await rari.web3.eth.getBlockNumber();
    const tvl = await rari.governance.rgt.sushiSwapDistributions.totalStakedUsd();
    return (
      parseInt(
        (
          await rari.governance.rgt.sushiSwapDistributions.getCurrentApr(
            blockNumber,
            tvl
          )
        ).toString()
      ) / 1e16
    ).toFixed(2);
  });

  return earned;
};

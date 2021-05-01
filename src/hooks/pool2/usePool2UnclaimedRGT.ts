import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "rari-sdk/index";

export const fetchPool2UnclaimedRGT = async ({
  rari,
  address,
}: {
  rari: Rari;
  address: string;
}) => {
  return parseFloat(
    rari.web3.utils.fromWei(
      await rari.governance.rgt.sushiSwapDistributions.getUnclaimed(address)
    )
  );
};

export const usePool2UnclaimedRGT = () => {
  const { rari, address } = useRari();

  const { data: earned } = useQuery(
    address + " pool2Unclaimed RGT",
    async () => await fetchPool2UnclaimedRGT({ rari, address })
  );

  return earned;
};

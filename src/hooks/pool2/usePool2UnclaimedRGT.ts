import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { fromWei } from "utils/ethersUtils";
import { Vaults } from "rari-sdk-sharad-v2";

export const fetchPool2UnclaimedRGT = async ({
  rari,
  address,
}: {
  rari: Vaults;
  address: string;
}) => {
  return parseFloat(
    fromWei(
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

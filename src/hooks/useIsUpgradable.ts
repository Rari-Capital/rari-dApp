import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { createComptroller } from "utils/createComptroller";

export const useIsUpgradeable = (comptrollerAddress: string) => {
    const { fuse } = useRari();
  
    const { data } = useQuery(comptrollerAddress + " isUpgradeable", async () => {
      const comptroller = createComptroller(comptrollerAddress, fuse);
  
      const isUpgradeable: boolean = await comptroller.methods
        .adminHasRights()
        .call();
  
      return isUpgradeable;
    });
  
    return data;
  };
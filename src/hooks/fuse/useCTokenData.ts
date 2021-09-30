import { useRari } from "context/RariContext";
import { useQuery } from "react-query";

import { createComptroller, createCToken } from "utils/createComptroller";

export const useCTokenData = (
    comptrollerAddress?: string,
    cTokenAddress?: string
  ) => {
    const { fuse } = useRari();
  
    const { data } = useQuery(cTokenAddress + " cTokenData", async () => {
      if (comptrollerAddress && cTokenAddress) {
        const comptroller = createComptroller(comptrollerAddress, fuse);
        const cToken = createCToken(fuse, cTokenAddress);
  
        const [
          adminFeeMantissa,
          reserveFactorMantissa,
          interestRateModelAddress,
          { collateralFactorMantissa },
          isPaused,
        ] = await Promise.all([
          cToken.methods.adminFeeMantissa().call(),
          cToken.methods.reserveFactorMantissa().call(),
          cToken.methods.interestRateModel().call(),
          comptroller.methods.markets(cTokenAddress).call(),
          comptroller.methods.borrowGuardianPaused(cTokenAddress).call(),
        ]);
  
        return {
          reserveFactorMantissa,
          adminFeeMantissa,
          collateralFactorMantissa,
          interestRateModelAddress,
          cTokenAddress,
          isPaused,
        };
      } else {
        return null;
      }
    });
  
    return data;
  };
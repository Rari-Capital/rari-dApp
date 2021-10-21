import { useRari } from "context/RariContext";
import { useQuery } from "react-query";

import { createComptroller, createCToken } from "utils/createComptroller";

export interface CTokenData {
  reserveFactorMantissa: any;
  adminFeeMantissa: any;
  collateralFactorMantissa: any;
  interestRateModelAddress: string;
  cTokenAddress: string;
  isPaused: boolean;
}

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string
): CTokenData | undefined => {
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

      const obj = {
        reserveFactorMantissa,
        adminFeeMantissa,
        collateralFactorMantissa,
        interestRateModelAddress,
        cTokenAddress,
        isPaused,
      };

      return obj;
    }
  });

  return data;
};

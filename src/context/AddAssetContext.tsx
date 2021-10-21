import { RETRY_FLAG } from "components/pages/Fuse/Modals/AddAssetModal/AssetSettings";
import { CTokenData } from "hooks/fuse/useCTokenData";
import { OracleDataType } from "hooks/fuse/useOracleData";
import { TokenData } from "hooks/useTokenData";
import { useContext, createContext } from "react";

export type AddAssetContextData = {
  // Initial props from parent
  mode: "Editing" | "Adding";
  cTokenAddress: string | undefined;
  comptrollerAddress: string;
  oracleData: OracleDataType | undefined;
  tokenAddress: string;
  poolOracleAddress: string;
  poolOracleModel: string | undefined;
  tokenData: TokenData;

  // Deploying
  isDeploying: boolean;
  setIsDeploying: (x: boolean) => void;

  // Asset's general configurations.
  adminFee: number;
  setAdminFee: (x: number) => void;
  reserveFactor: number;
  setReserveFactor: (x: number) => void;
  isBorrowPaused: boolean;
  setIsBorrowPaused: (x: boolean) => void;
  collateralFactor: number;
  setCollateralFactor: (x: number) => void;

  // IRM stuff
  interestRateModel: any;
  setInterestRateModel: (x: any) => void;
  curves: any;

  // Oracle Configuration
  oracleTouched: boolean;
  setOracleTouched: (x: boolean) => void;
  activeOracleModel: string;
  setActiveOracleModel: (x: string) => void;
  oracleAddress: string;
  setOracleAddress: (x: string) => void;

  // Univ3 stuff
  feeTier: number;
  setFeeTier: (x: number) => void;
  uniV3BaseTokenAddress: string;
  setUniV3BaseTokenAddress: (x: string) => void;
  uniV3BaseTokenOracle: string;
  setUniV3BaseTokenOracle: (x: string) => void;
  baseTokenActiveOracleName: string;
  setBaseTokenActiveOracleName: (x: string) => void;
  uniV3BaseTokenHasOracle: boolean;
  setUniV3BaseTokenHasOracle: (x: boolean) => void;

  activeUniSwapPair: string;
  setActiveUniSwapPair: (x: string) => void;

  shouldShowUniV3BaseTokenOracleForm: boolean; // show

  // More Oracle stuff
  defaultOracle: string;
  setDefaultOracle: (x: string) => void;
  customOracleForToken: string;
  setCustomOracleForToken: (x: string) => void;
  priceForAsset: number | undefined;
  setPriceForAsset: (x: number) => void;
  hasDefaultOracle: boolean;
  hasCustomOracleForToken: boolean;
  hasPriceForAsset: boolean;

  // UI Flow Stages
  stage: number;
  setStage: (x: number) => void;
  handleSetStage: (x: number) => void;

  // Stepper
  activeStep: number;
  setActiveStep: (x: number) => void;
  increaseActiveStep: (step: string) => void;

  // Retries
  retryFlag: RETRY_FLAG;
  setRetryFlag: (x: RETRY_FLAG) => void;
  needsRetry: boolean;
  setNeedsRetry: (x: boolean) => void;

  // Edit data
  cTokenData: CTokenData | undefined;
};

export const AddAssetContext = createContext<AddAssetContextData | undefined>(
  undefined
);

export function useAddAssetContext() {
  const context = useContext(AddAssetContext);

  if (context === undefined) {
    throw new Error(
      `useAddAssetContext must be used within a AddAssetContextProvider`
    );
  }

  return context;
}

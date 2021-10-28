// Chakra and UI
import { Text, Select, useToast } from "@chakra-ui/react";
import { Column } from "utils/chakraUtils";
import { DASHBOARD_BOX_PROPS } from "../../../../shared/DashboardBox";
import { ModalDivider } from "../../../../shared/Modal";
import { SliderWithLabel } from "../../../../shared/SliderWithLabel";
import {
  ConfigRow,
  SaveButton,
  testForComptrollerErrorAndSend,
} from "../../FusePoolEditPage";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../../shared/SimpleTooltip";

// React
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

// Rari
import { useRari } from "../../../../../context/RariContext";
import Fuse from "../../../../../fuse-sdk";

// Hooks
import useIRMCurves from "hooks/fuse/useIRMCurves";
import { createCToken } from "../../../../../utils/createComptroller";
import { useLiquidationIncentive } from "hooks/fuse/useLiquidationIncentive";

// Utils
import { handleGenericError } from "../../../../../utils/errorHandling";
import { createComptroller } from "../../../../../utils/createComptroller";
import { testForCTokenErrorAndSend } from "../PoolModal/AmountSelect";
import { isTokenETHOrWETH } from "utils/tokenUtils";

// Libraries
import BigNumber from "bignumber.js";
import LogRocket from "logrocket";

// Components
import IRMChart from "./IRMChart";
import OracleConfig from "./OracleConfig/OracleConfig";
import { useAddAssetContext } from "context/AddAssetContext";
import MarketCapConfigurator from "../Edit/MarketCapConfigurator";

const formatPercentage = (value: number) => value.toFixed(1) + "%";

const AssetConfig = () => {
  const queryClient = useQueryClient();
  const { fuse, address } = useRari();
  const { t } = useTranslation();
  const toast = useToast();

  const {
    cTokenData,
    collateralFactor,
    setCollateralFactor,
    cTokenAddress,
    isBorrowPaused,
    adminFee,
    setAdminFee,
    activeOracleModel,
    oracleData,
    tokenAddress,
    mode,
    setInterestRateModel,
    interestRateModel,
    tokenData,
    setReserveFactor,
    reserveFactor,
    comptrollerAddress,
  } = useAddAssetContext();

  const curves = useIRMCurves({ interestRateModel, adminFee, reserveFactor });

  // Liquidation incentive. (This is configured at pool level)
  const liquidationIncentiveMantissa =
    useLiquidationIncentive(comptrollerAddress);

  const scaleCollateralFactor = (_collateralFactor: number) => {
    return _collateralFactor / 1e16;
  };

  const scaleReserveFactor = (_reserveFactor: number) => {
    return _reserveFactor / 1e16;
  };

  const scaleAdminFee = (_adminFee: number) => {
    return _adminFee / 1e16;
  };

  // Updates asset's Interest Rate Model.
  const updateInterestRateModel = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    try {
      await testForCTokenErrorAndSend(
        cToken.methods._setInterestRateModel(interestRateModel),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateInterestRateModel");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  // Determines if users can borrow an asset or not.
  const togglePause = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await comptroller.methods
        ._setBorrowPaused(cTokenAddress, !isBorrowPaused)
        .send({ from: address });

      LogRocket.track("Fuse-PauseToggle");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  // Updates loan to Value ratio.
  const updateCollateralFactor = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = new BigNumber(collateralFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setCollateralFactor(
          cTokenAddress,
          bigCollateralFactor
        ),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateCollateralFactor");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  // Updated portion of accrued reserves that goes into reserves.
  const updateReserveFactor = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = new BigNumber(reserveFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);
    try {
      await testForCTokenErrorAndSend(
        cToken.methods._setReserveFactor(bigReserveFactor),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateReserveFactor");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  // Updates asset's admin fee.
  const updateAdminFee = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    // 5% -> 0.05 * 1e18
    const bigAdminFee = new BigNumber(adminFee)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    try {
      await testForCTokenErrorAndSend(
        cToken.methods._setAdminFee(bigAdminFee),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateAdminFee");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <>
      <Column
        width={mode === "Editing" ? "100%" : "60%"}
        maxWidth={mode === "Editing" ? "100%" : "50%"}
        height="100%"
        overflowY="auto"
        mainAxisAlignment={mode === "Adding" ? "center" : "flex-start"}
        crossAxisAlignment={mode === "Adding" ? "center" : "flex-start"}
      >
        {mode === "Editing" ? (
          <>
            <MarketCapConfigurator
              mode="Borrow"
              tokenSymbol={tokenData.symbol}
              cTokenAddress={cTokenAddress}
              comptrollerAddress={comptrollerAddress}
            />

            <ModalDivider />

            <MarketCapConfigurator
              mode="Supply"
              tokenSymbol={tokenData.symbol}
              cTokenAddress={cTokenAddress}
              comptrollerAddress={comptrollerAddress}
            />
          </>
        ) : null}

        <ModalDivider />

        <ConfigRow height="35px">
          <SimpleTooltip
            label={t(
              "Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset."
            )}
          >
            <Text fontWeight="bold">
              {t("Collateral Factor")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>

          {cTokenData !== undefined &&
          mode === "Editing" &&
          collateralFactor !==
            scaleCollateralFactor(cTokenData?.collateralFactorMantissa) ? (
            <SaveButton ml={3} onClick={updateCollateralFactor} />
          ) : null}

          <SliderWithLabel
            ml="auto"
            value={collateralFactor}
            setValue={setCollateralFactor}
            formatValue={formatPercentage}
            step={0.5}
            max={
              liquidationIncentiveMantissa
                ? // 100% CF - Liquidation Incentive (ie: 8%) - 5% buffer
                  100 -
                  (liquidationIncentiveMantissa.toString() / 1e16 - 100) -
                  5
                : 90
            }
          />
        </ConfigRow>

        <ModalDivider />

        {cTokenAddress ? (
          <ConfigRow>
            <SimpleTooltip
              label={t("If enabled borrowing this asset will be disabled.")}
            >
              <Text fontWeight="bold">
                {t("Pause Borrowing")} <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>

            <SaveButton
              ml="auto"
              onClick={togglePause}
              fontSize="xs"
              altText={
                isBorrowPaused ? t("Enable Borrowing") : t("Pause Borrowing")
              }
            />
          </ConfigRow>
        ) : null}

        <ModalDivider />

        <ConfigRow height="35px">
          <SimpleTooltip
            label={t(
              "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
            )}
          >
            <Text fontWeight="bold">
              {t("Reserve Factor")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>

          {cTokenData &&
          reserveFactor !==
            scaleReserveFactor(cTokenData.reserveFactorMantissa) ? (
            <SaveButton ml={3} onClick={updateReserveFactor} />
          ) : null}

          <SliderWithLabel
            ml="auto"
            value={reserveFactor}
            setValue={setReserveFactor}
            formatValue={formatPercentage}
            max={50}
          />
        </ConfigRow>
        <ModalDivider />

        <ConfigRow height="35px">
          <SimpleTooltip
            label={t(
              "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
            )}
          >
            <Text fontWeight="bold">
              {t("Admin Fee")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>

          {cTokenData &&
          adminFee !== scaleAdminFee(cTokenData.adminFeeMantissa) ? (
            <SaveButton ml={3} onClick={updateAdminFee} />
          ) : null}

          <SliderWithLabel
            ml="auto"
            value={adminFee}
            setValue={setAdminFee}
            formatValue={formatPercentage}
            max={30}
          />
        </ConfigRow>

        <ModalDivider />

        {(activeOracleModel === "MasterPriceOracleV2" ||
          activeOracleModel === "MasterPriceOracleV3") &&
          oracleData !== undefined &&
          !isTokenETHOrWETH(tokenAddress) &&
          mode === "Editing" && (
            <>
              <OracleConfig />

              <ModalDivider />
            </>
          )}

        <ModalDivider />

        <ConfigRow>
          <SimpleTooltip
            label={t(
              "The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels."
            )}
          >
            <Text fontWeight="bold">
              {t("Interest Model")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>

          <Select
            {...DASHBOARD_BOX_PROPS}
            ml="auto"
            borderRadius="7px"
            fontWeight="bold"
            _focus={{ outline: "none" }}
            width="260px"
            value={interestRateModel.toLowerCase()}
            onChange={(event) => setInterestRateModel(event.target.value)}
          >
            {Object.entries(
              Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
            ).map(([key, value]) => {
              return (
                <option
                  className="black-bg-option"
                  value={value.toLowerCase()}
                  key={key}
                >
                  {key}
                </option>
              );
            })}
          </Select>

          {cTokenData &&
          cTokenData.interestRateModelAddress.toLowerCase() !==
            interestRateModel.toLowerCase() ? (
            <SaveButton
              height="40px"
              borderRadius="7px"
              onClick={updateInterestRateModel}
            />
          ) : null}
        </ConfigRow>

        {mode === "Editing" && (
          <IRMChart curves={curves} tokenData={tokenData} />
        )}
      </Column>

      {mode === "Adding" ? (
        <Column
          width="40%"
          height="100%"
          overflowY="auto"
          mainAxisAlignment={mode === "Adding" ? "center" : "flex-start"}
          crossAxisAlignment={mode === "Adding" ? "center" : "flex-start"}
        >
          <IRMChart curves={curves} tokenData={tokenData} />
          <Text textAlign="center">
            {fuse
              .identifyInterestRateModelName(interestRateModel)
              .replace("_", " ")}
          </Text>
        </Column>
      ) : null}
    </>
  );
};

export default AssetConfig;

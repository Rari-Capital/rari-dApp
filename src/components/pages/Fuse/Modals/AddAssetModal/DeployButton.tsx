// Chakra and UI
import { Button } from "@chakra-ui/button";
import { Center } from "@chakra-ui/react";
import { Box } from "@chakra-ui/layout";

// Rari
import { useRari } from "../../../../../context/RariContext";

// Hooks
import { useTranslation } from "react-i18next";

// Components
import TransactionStepper from "components/shared/TransactionStepper";
import { Column } from "utils/chakraUtils";
import { useIsMediumScreen } from "../../FuseTabBar";
import { useAddAssetContext } from "context/AddAssetContext";

const DeployButton = ({ steps, deploy }: { deploy: any; steps: any }) => {
  const { t } = useTranslation();
  const { fuse } = useRari();

  const {
    mode,
    stage,
    tokenData,
    activeStep,
    isDeploying,
    oracleAddress,
    handleSetStage,
    uniV3BaseTokenOracle,
    shouldShowUniV3BaseTokenOracleForm,
    needsRetry,
    // New stuff
    hasPriceForAsset,
    hasDefaultOracle,
    defaultOracle,
  } = useAddAssetContext();

  // If user hasnt edited the form and we have a default oracle price for this asset
  const hasDefaultOraclePriceAndHasntEdited =
    hasDefaultOracle && hasPriceForAsset && oracleAddress === defaultOracle;

  // This checks whether the user can proceed in the Oracle Configuration step.
  const checkUserOracleConfigurationState = (
    oracleAddress: string,
    shouldShowUniV3BaseTokenOracleForm: boolean,
    uniV3BaseTokenOracle: string
  ) => {
    // If the user needs to configure a BaseToken Oracle for their Univ3 Pair, then disable until its set
    if (shouldShowUniV3BaseTokenOracleForm) {
      return fuse.web3.utils.isAddress(uniV3BaseTokenOracle);
    }

    // NEW: If this Fuse pool has a default oracle and price
    // AND if the oracle is not set yet in the UI, let them continue
    console.log("checkUserOracleConfigurationState", {
      hasDefaultOracle,
      hasPriceForAsset,
      oracleAddress,
      hasDefaultOraclePriceAndHasntEdited,
    });

    if (hasDefaultOraclePriceAndHasntEdited) return true;

    // If the oracle address is not set at all, then disable until it is set.
    return fuse.web3.utils.isAddress(oracleAddress);
  };

  const shouldNextButtonBeDisabled = !checkUserOracleConfigurationState(
    oracleAddress,
    shouldShowUniV3BaseTokenOracleForm,
    uniV3BaseTokenOracle
  );

  return (
    <Column
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      px={4}
      width="100%"
      height="100%"
      flexBasis="10%"
      // bg="red"
    >
      {isDeploying ? (
        <TransactionStepper
          activeStep={activeStep}
          tokenData={tokenData}
          steps={steps}
        />
      ) : null}
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        px={4}
        width="100%"
        height="100%"
      >
        <Center w="100%" h="100%">
          {stage !== 1 && !isDeploying && (
            <Button
              width={stage === 3 ? "20%" : "50%"}
              mx={4}
              height="100%"
              // fontSize="2xl"
              onClick={() => handleSetStage(-1)}
              fontWeight="bold"
              borderRadius="10px"
              disabled={isDeploying}
              bg={tokenData.color! ?? "#FFF"}
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
              color={tokenData.overlayTextColor! ?? "#000"}
            >
              {t("Previous")}
            </Button>
          )}

          {stage < 3 && (
            <Button
              width="100%"
              height="100%"
              // height="70px"
              mx={4}
              // fontSize="2xl"
              onClick={() => handleSetStage(1)}
              fontWeight="bold"
              borderRadius="10px"
              disabled={stage === 2 ? shouldNextButtonBeDisabled : false}
              bg={tokenData.color! ?? "#FFF"}
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
              color={tokenData.overlayTextColor! ?? "#000"}
            >
              {t("Next")}
            </Button>
          )}

          {stage === 3 && (
            <Button
              width={needsRetry ? "100%" : "75%"}
              height="70px"
              fontSize={{
                base: "sm",
                sm: "sm",
                md: "md",
                lg: "xl",
              }}
              onClick={() => deploy()}
              fontWeight="bold"
              borderRadius="10px"
              disabled={!needsRetry && isDeploying}
              bg={tokenData.color! ?? "#FFF"}
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
              color={tokenData.overlayTextColor! ?? "#000"}
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
            >
              {needsRetry
                ? `(RETRY) ${steps[activeStep]}`
                : isDeploying
                ? steps[activeStep]
                : t("Confirm")}
            </Button>
          )}
        </Center>
      </Column>
    </Column>
  );
};

export default DeployButton;

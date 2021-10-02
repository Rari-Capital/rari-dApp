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
import { useIsMobile } from "utils/chakraUtils";
import { useIsMediumScreen } from "../../FuseTabBar";

const DeployButton = ({
  mode,
  steps,
  stage,
  deploy,
  tokenData,
  activeStep,
  isDeploying,
  oracleAddress,
  handleSetStage,
  uniV3BaseTokenOracle,
  shouldShowUniV3BaseTokenOracleForm,
  needsRetry,
}: {
  shouldShowUniV3BaseTokenOracleForm: boolean;
  uniV3BaseTokenOracle: string;
  handleSetStage: any;
  oracleAddress: string;
  isDeploying: any;
  activeStep: any;
  tokenData: any;
  deploy: any;
  stage: any;
  steps: any;
  mode: any;
  needsRetry: boolean;
}) => {
  const { t } = useTranslation();
  const { fuse } = useRari();

  const checkUserOracleConfigurationState = (
    oracleAddress: string,
    shouldShowUniV3BaseTokenOracleForm: boolean,
    uniV3BaseTokenOracle: string
  ) => {
    console.log(
      oracleAddress,
      shouldShowUniV3BaseTokenOracleForm,
      uniV3BaseTokenOracle
    );
    if (shouldShowUniV3BaseTokenOracleForm) {
      return fuse.web3.utils.isAddress(uniV3BaseTokenOracle);
    }

    return fuse.web3.utils.isAddress(oracleAddress);
  };

  const shouldNextButtonBeDisabled = !checkUserOracleConfigurationState(
    oracleAddress,
    shouldShowUniV3BaseTokenOracleForm,
    uniV3BaseTokenOracle
  );

  return (
    <>
      {isDeploying ? (
        <TransactionStepper
          activeStep={activeStep}
          tokenData={tokenData}
          steps={steps}
        />
      ) : null}
      <Box
        px={4}
        width="100%"
        height="10%"
        d="flex"
        flexDir="column"
        alignContent="center"
        justifyContent="center"
        flexGrow={1}
        // bg="red"
        ml="auto"
      >
        <Center>
          {stage !== 1 && !isDeploying && (
            <Button
              width={stage === 3 ? "20%" : "45%"}
              mx={4}
              height="70px"
              fontSize="2xl"
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
              width="45%"
              height="70px"
              mx={4}
              fontSize="2xl"
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
      </Box>
    </>
  );
};

export default DeployButton;

// Chakra and UI
import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";

// Hooks
import { useTranslation } from "react-i18next";

// Components
import TransactionStepper from "components/shared/TransactionStepper";

const DeployButton = ({
    mode,
    steps,
    stage,
    deploy,
    tokenData,
    activeStep,
    isDeploying,
    activeOracle,
    handleSetStage,
  }: {
    handleSetStage: any;
    activeOracle: any;
    isDeploying: any;
    activeStep: any;
    tokenData: any;
    deploy: any;
    stage: any;
    steps: any;
    mode: any;
  }) => {
    const { t } = useTranslation();
  
    return (
      <>
        {isDeploying ? (
          <TransactionStepper
            tokenData={tokenData}
            steps={steps}
            activeOracle={activeOracle}
            activeStep={activeStep}
          />
        ) : null}
        <Box
          px={4}
          width="100%"
          height="10%"
          d="flex"
          alignContent="center"
          justifyContent="space-around"
        >
          {stage !== 1 && !isDeploying && (
            <Button
              width={stage === 3 ? "20%" : "45%"}
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
              fontSize="2xl"
              onClick={() => handleSetStage(1)}
              fontWeight="bold"
              borderRadius="10px"
              disabled={activeOracle.length === 0 && stage === 2}
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
              width="75%"
              height="70px"
              fontSize="2xl"
              onClick={() => deploy()}
              fontWeight="bold"
              borderRadius="10px"
              disabled={isDeploying}
              bg={tokenData.color! ?? "#FFF"}
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
              color={tokenData.overlayTextColor! ?? "#000"}
            >
              {isDeploying ? steps[activeStep] : t("Confirm")}
            </Button>
          )}
        </Box>
      </>
    );
  };

export default DeployButton
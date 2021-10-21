// Chakra and UI
import { Column, Row } from "utils/chakraUtils";
import { Alert, Text, AlertIcon } from "@chakra-ui/react";

// Rari
import { useRari } from "../../../../../../context/RariContext";

// Components
import BaseTokenOracleConfig from "../OracleConfig/BaseTokenOracleConfig";
import OracleConfig from "../OracleConfig/OracleConfig";
import { OracleDataType } from "hooks/fuse/useOracleData";
import { useQuery } from "react-query";
import { createOracle } from "utils/createComptroller";
import { Spinner } from "@chakra-ui/spinner";
import { useAddAssetContext } from "context/AddAssetContext";

const Screen2 = ({ mode }: { mode: string }) => {
  const {
    feeTier,
    poolOracleModel,
    oracleData,
    setFeeTier,
    activeOracleModel,
    tokenAddress,
    oracleAddress,
    oracleTouched,
    uniV3BaseTokenAddress,
    setOracleTouched,
    activeUniSwapPair,
    setOracleAddress,
    setActiveOracleModel,
    setUniV3BaseTokenAddress,
    poolOracleAddress,
    setActiveUniSwapPair,
    uniV3BaseTokenOracle,
    setUniV3BaseTokenOracle,
    baseTokenActiveOracleName,
    setBaseTokenActiveOracleName,
    shouldShowUniV3BaseTokenOracleForm,
    // New stuff -skip oracle step with default oracle
    hasPriceForAsset,
    hasDefaultOracle,
    hasCustomOracleForToken,
    priceForAsset,
    defaultOracle,
    customOracleForToken,
  } = useAddAssetContext();

  if (
    poolOracleModel === "MasterOracleV1" ||
    poolOracleModel === "ChainlinkPriceOracle"
  )
    return (
      <LegacyOracle
        tokenAddress={tokenAddress}
        poolOracleModel={poolOracleModel}
        setActiveOracleModel={setActiveOracleModel}
        poolOracleAddress={poolOracleAddress}
        setOracleAddress={setOracleAddress}
      />
    );

  // If it has a default oracle and the user hasn't edited to be outside the default oracle
  const hasDefaultOraclePriceAndHasntEdited =
    hasDefaultOracle && hasPriceForAsset && oracleAddress === defaultOracle;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      h="100%"
      w="100%"
      // bg="aqua"
    >
      {hasDefaultOraclePriceAndHasntEdited && (
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          w="100%"
          h="30%"
          // bg="red"
        >
          <Alert status="info" width="80%" height="50px" borderRadius={5}>
            <AlertIcon />
            <Text fontSize="sm" align="center" color="black">
              This asset already has a price from the Pool's Default Oracle, but
              you can change this asset's oracle if you want.
            </Text>
          </Alert>
        </Row>
      )}
      <Row
        mainAxisAlignment={
          mode === "Adding" && !shouldShowUniV3BaseTokenOracleForm
            ? "center"
            : "flex-start"
        }
        crossAxisAlignment={
          mode === "Adding" && !shouldShowUniV3BaseTokenOracleForm
            ? "center"
            : "flex-start"
        }
        h="100%"
        w="100%"
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment={
            shouldShowUniV3BaseTokenOracleForm ? "flex-start" : "center"
          }
          maxHeight="100%"
          height="100%"
          maxWidth="100%"
          width={
            mode === "Adding" && !shouldShowUniV3BaseTokenOracleForm
              ? "50%"
              : "100%"
          }
        >
          <OracleConfig />
        </Column>
        {shouldShowUniV3BaseTokenOracleForm ? (
          <Column
            width="50%"
            minW="50%"
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
          >
            <BaseTokenOracleConfig />
          </Column>
        ) : null}
      </Row>
    </Column>
  );
};
export default Screen2;

const LegacyOracle = ({
  tokenAddress,
  poolOracleModel,
  poolOracleAddress,
  setOracleAddress,
  setActiveOracleModel,
}: {
  tokenAddress: string;
  poolOracleModel: string;
  poolOracleAddress: string;
  setOracleAddress: (x: string) => void;
  setActiveOracleModel: (x: string) => void;
}) => {
  const supportedAddress: string | undefined = useIsAssetSupported(
    tokenAddress,
    poolOracleModel,
    poolOracleAddress
  );

  if (!supportedAddress && typeof supportedAddress === "undefined")
    return <Spinner />;

  if (supportedAddress === "0x0000000000000000000000000000000000000000")
    return (
      <h1>
        Asset is not currently supported by our oracle, please contact the Rari
        Capital team for assistance.
      </h1>
    );

  setOracleAddress(supportedAddress);
  setActiveOracleModel(poolOracleModel);
  return <h2>Your oracle supports this token.</h2>;
};

const useIsAssetSupported = (
  tokenAddress: string,
  oracleModel: string,
  poolOracleAddress: string
): string | undefined => {
  const { fuse } = useRari();

  const { data: supportedAddress, error } = useQuery(
    "Checking if oracle supports: " + tokenAddress,
    async () => {
      const contract = createOracle(poolOracleAddress, fuse, oracleModel);

      let supportedAddress: string | undefined;

      if (oracleModel === "MasterPriceOracleV1") {
        const answer: string = await contract.methods
          .oracles(tokenAddress)
          .call();

        supportedAddress = answer;
      }

      if (oracleModel === "ChainlinkPriceOracle") {
        const answer: number = await contract.methods
          .price(tokenAddress)
          .call();
        supportedAddress =
          answer <= 0
            ? "0x0000000000000000000000000000000000000000"
            : poolOracleAddress;
      }

      return supportedAddress;
    }
  );

  return error
    ? "0x0000000000000000000000000000000000000000"
    : supportedAddress;
};

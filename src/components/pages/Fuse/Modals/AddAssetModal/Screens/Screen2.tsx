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

const Screen2 = ({
  mode,
  feeTier,
  oracleModel,
  oracleData,
  setFeeTier,
  activeOracle,
  tokenAddress,
  oracleAddress,
  oracleTouched,
  uniV3BaseToken,
  setOracleTouched,
  activeUniSwapPair,
  _setOracleAddress,
  _setActiveOracle,
  setUniV3BaseToken,
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
}: {
  mode: "Editing" | "Adding";
  feeTier: number;
  oracleModel: string | undefined;
  oracleData: OracleDataType | string | undefined;
  setFeeTier: React.Dispatch<React.SetStateAction<number>>;
  activeOracle: string;
  tokenAddress: string;
  oracleAddress: string;
  oracleTouched: boolean;
  uniV3BaseToken: string;
  setOracleTouched: React.Dispatch<React.SetStateAction<boolean>>;
  activeUniSwapPair: string;
  _setActiveOracle: React.Dispatch<React.SetStateAction<string>>;
  _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;
  setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;
  poolOracleAddress: string;
  setActiveUniSwapPair: React.Dispatch<React.SetStateAction<string>>;
  uniV3BaseTokenOracle: string;
  setUniV3BaseTokenOracle: React.Dispatch<React.SetStateAction<string>>;
  baseTokenActiveOracleName: string;
  setBaseTokenActiveOracleName: React.Dispatch<React.SetStateAction<string>>;
  shouldShowUniV3BaseTokenOracleForm: boolean;
  // New stuff - skip oracle step with default
  hasPriceForAsset: boolean;
  hasDefaultOracle: boolean;
  hasCustomOracleForToken: boolean;
  priceForAsset: number | undefined;
  defaultOracle: string;
  customOracleForToken: string;
}) => {
  if (
    oracleModel === "MasterOracleV1" ||
    oracleModel === "ChainlinkPriceOracle"
  )
    return (
      <LegacyOracle
        tokenAddress={tokenAddress}
        oracleModel={oracleModel}
        setActiveOracle={_setActiveOracle}
        poolOracleAddress={poolOracleAddress}
        _setOracleAddress={_setOracleAddress}
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
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
        w="100%"
        bg="aqua"
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          maxHeight="100%"
          height="100%"
          maxWidth="100%"
          width={"100%"}
          bg="pink"
        >
          <OracleConfig
            mode={mode}
            feeTier={feeTier}
            oracleData={oracleData}
            setFeeTier={setFeeTier}
            activeOracle={activeOracle}
            tokenAddress={tokenAddress}
            oracleAddress={oracleAddress}
            oracleTouched={oracleTouched}
            uniV3BaseToken={uniV3BaseToken}
            setOracleTouched={setOracleTouched}
            activeUniSwapPair={activeUniSwapPair}
            _setActiveOracle={_setActiveOracle}
            _setOracleAddress={_setOracleAddress}
            setUniV3BaseToken={setUniV3BaseToken}
            poolOracleAddress={poolOracleAddress}
            setActiveUniSwapPair={setActiveUniSwapPair}
            uniV3BaseTokenOracle={uniV3BaseTokenOracle}
            setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
            baseTokenActiveOracleName={baseTokenActiveOracleName}
            setBaseTokenActiveOracleName={setBaseTokenActiveOracleName}
            shouldShowUniV3BaseTokenOracleForm={
              shouldShowUniV3BaseTokenOracleForm
            }
          />
        </Column>
        {shouldShowUniV3BaseTokenOracleForm ? (
          <Column
            width="50%"
            minW="50%"
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="center"
          >
            <BaseTokenOracleConfig
              mode="Adding"
              oracleData={oracleData}
              uniV3BaseToken={uniV3BaseToken}
              uniV3BaseTokenOracle={uniV3BaseTokenOracle}
              setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
              baseTokenActiveOracleName={baseTokenActiveOracleName}
              setBaseTokenActiveOracleName={setBaseTokenActiveOracleName}
            />
          </Column>
        ) : null}
      </Row>
    </Column>
  );
};
export default Screen2;

const LegacyOracle = ({
  tokenAddress,
  oracleModel,
  poolOracleAddress,
  _setOracleAddress,
  setActiveOracle,
}: {
  tokenAddress: string;
  oracleModel: string;
  poolOracleAddress: string;
  _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;
  setActiveOracle: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const supportedAddress: string | undefined = useIsAssetSupported(
    tokenAddress,
    oracleModel,
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

  _setOracleAddress(supportedAddress);
  setActiveOracle(oracleModel);
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

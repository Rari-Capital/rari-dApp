// Chakra and UI
import { Input, Box, Text, Select, Spinner, useToast } from "@chakra-ui/react";
import { Center, Row } from "utils/chakraUtils";
import { DASHBOARD_BOX_PROPS } from "../../../../../shared/DashboardBox";
import { SaveButton } from "../../../FusePoolEditPage";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../../../shared/SimpleTooltip";

// React
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

// Rari
import { useRari } from "../../../../../../context/RariContext";

// Hooks
import {
  useGetOracleOptions,
  useIdentifyOracle,
} from "hooks/fuse/useOracleData";
import { createOracle } from "../../../../../../utils/createComptroller";

// Utils
import { handleGenericError } from "../../../../../../utils/errorHandling";
import { isTokenETHOrWETH } from "utils/tokenUtils";

// Components
import UniswapV3PriceOracleConfigurator from "./UniswapV3PriceOracleConfigurator";
import UniswapV2OrSushiPriceOracleConfigurator from "./UniswapV2OrSushiPriceOracleConfigurator";
import BaseTokenOracleConfig from "./BaseTokenOracleConfig";
import { useAddAssetContext } from "context/AddAssetContext";

// const useOraclesLoading = (options: any) => {
//   const [isLoading, setIsLoading] = useState(false)

//   Object.keys(options).filter((option) => {

//   })

// };

const OracleConfig = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { fuse, address } = useRari();

  const {
    mode,
    feeTier,
    oracleData,
    activeOracleModel,
    tokenAddress,
    oracleAddress,
    oracleTouched,
    uniV3BaseTokenAddress,
    setOracleTouched,
    activeUniSwapPair,
    setActiveOracleModel,
    setOracleAddress,
    poolOracleAddress,
    uniV3BaseTokenOracle,
    baseTokenActiveOracleName,
    shouldShowUniV3BaseTokenOracleForm,
  } = useAddAssetContext();

  const isUserAdmin = !!oracleData ? address === oracleData.admin : false;

  // Available oracle options for asset
  const options = useGetOracleOptions(oracleData, tokenAddress);

  // Identify token oracle address
  const oracleIdentity = useIdentifyOracle(oracleAddress);

  const [inputTouched, setInputTouched] = useState(false);

  // If user's editing the asset's properties, show the Ctoken's active Oracle
  useEffect(() => {
    // Map oracleIdentity to whatever the type of `activeOracle` can be

    // "Current_Price_Oracle" would only be avialable if you are editing
    if (
      mode === "Editing" &&
      options &&
      options["Current_Price_Oracle"] &&
      !oracleTouched
    ) {
      setActiveOracleModel("Current_Price_Oracle");
    }

    // if avaiable, set to "Default_Price_Oracle" if you are adding
    if (
      mode === "Adding" &&
      options &&
      !!options["Default_Price_Oracle"] &&
      !oracleTouched
    ) {
      setActiveOracleModel("Default_Price_Oracle");
    }

    // if avaiable, set to "Default_Price_Oracle" if you are adding
    if (
      mode === "Adding" &&
      options &&
      !!options["Current_Price_Oracle"] &&
      !oracleTouched
    ) {
      setActiveOracleModel("Current_Price_Oracle");
    }
  }, [
    mode,
    activeOracleModel,
    options,
    setActiveOracleModel,
    oracleIdentity,
    oracleTouched,
  ]);

  // Update the oracle address, after user chooses which option they want to use.
  // If option is Custom_Oracle or Uniswap_V3_Oracle, oracle address is changed differently so we dont trigger this.
  useEffect(() => {
    if (
      activeOracleModel.length > 0 &&
      activeOracleModel !== "Custom_Oracle" &&
      activeOracleModel !== "Uniswap_V3_Oracle" &&
      activeOracleModel !== "Uniswap_V2_Oracle" &&
      activeOracleModel !== "SushiSwap_Oracle" &&
      options
    )
      setOracleAddress(options[activeOracleModel]);
    if (
      activeUniSwapPair === "" &&
      (activeOracleModel === "Custom_Oracle" ||
        activeOracleModel === "Uniswap_V3_Oracle" ||
        activeOracleModel === "Uniswap_V2_Oracle" ||
        activeOracleModel === "SushiSwap_Oracle") &&
      !inputTouched
    )
      setOracleAddress("");
  }, [activeOracleModel, options, setOracleAddress, activeUniSwapPair]);

  // Will update oracle for the asset. This is used only if user is editing asset.
  const updateOracle = async () => {
    const poolOracleContract = createOracle(
      poolOracleAddress,
      fuse,
      "MasterPriceOracle"
    );

    // This variable will change if we deploy an oracle. (i.e TWAP Oracles)
    // If we're using an option that has been deployed it stays the same.
    let oracleAddressToUse = oracleAddress;

    try {
      if (options === null) return null;

      // If activeOracle if a TWAP Oracle
      if (activeOracleModel === "Uniswap_V3_Oracle") {
        // Check for observation cardinality and fix if necessary
        await fuse.primeUniswapV3Oracle(oracleAddressToUse, { from: address });

        // Deploy oracle
        oracleAddressToUse = await fuse.deployPriceOracle(
          "UniswapV3TwapPriceOracleV2",
          {
            feeTier,
            baseToken: uniV3BaseTokenAddress,
          },
          { from: address }
        );
      }

      const tokenArray =
        shouldShowUniV3BaseTokenOracleForm &&
        !isTokenETHOrWETH(uniV3BaseTokenAddress)
          ? [tokenAddress, uniV3BaseTokenAddress]
          : [tokenAddress];
      const oracleAddressArray =
        shouldShowUniV3BaseTokenOracleForm &&
        !isTokenETHOrWETH(uniV3BaseTokenAddress)
          ? [oracleAddressToUse, uniV3BaseTokenOracle]
          : [oracleAddressToUse];

      console.log({ tokenArray, oracleAddressArray });

      // Add oracle to Master Price Oracle
      await poolOracleContract.methods
        .add(tokenArray, oracleAddressArray)
        .send({ from: address });

      queryClient.refetchQueries();

      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some refetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "You have successfully updated the oracle to this asset!",
        description: "Oracle will now point to the new selected address.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      setActiveOracleModel("Current_Price_Oracle");
      setOracleAddress(options["Current_Price_Oracle"]);
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  if (!options)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <>
      <Row
        mainAxisAlignment={mode === "Editing" ? "space-between" : "flex-start"}
        // background="gold"
        crossAxisAlignment={"center"}
        width={
          mode === "Editing"
            ? !shouldShowUniV3BaseTokenOracleForm
              ? "100%"
              : "50%"
            : "100%"
        }
        flexGrow={1}
        pt={mode === "Editing" ? 4 : 0}
        pb={mode === "Editing" ? 1 : 0}
        px={mode === "Editing" ? 4 : 0}
        id="PRICEORACLE"
      >
        <SimpleTooltip label={t("Choose the best price oracle for the asset.")}>
          <Text fontWeight="bold">
            {t("Price Oracle")} <QuestionIcon ml={1} mb="4px" />
          </Text>
        </SimpleTooltip>

        {/* Oracles */}
        <Box
          width={mode === "Editing" ? "50%" : "100%"}
          alignItems="flex-end"
          flexDirection="column"
          alignContent="center"
          display="flex"
        >
          <Select
            mb={2}
            ml="auto"
            width="260px"
            {...DASHBOARD_BOX_PROPS}
            borderRadius="7px"
            _focus={{ outline: "none" }}
            value={activeOracleModel.toLowerCase()}
            onChange={(event) => {
              // if (mode === "Editing") {
              // }
              setOracleTouched(true);
              setActiveOracleModel(event.target.value);
            }}
            placeholder={
              activeOracleModel.length === 0
                ? t("Choose Oracle")
                : activeOracleModel.replaceAll("_", " ")
            }
            disabled={
              !isUserAdmin ||
              (!oracleData?.adminOverwrite &&
                !options.Current_Price_Oracle === null)
            }
          >
            {Object.entries(options).map(([key, value]) =>
              value !== null &&
              value !== undefined &&
              key !== activeOracleModel &&
              (mode === "Adding" ? key !== "Current_Price_Oracle" : true) ? (
                // dont show the selected choice in the list
                <option key={key} value={key} className="black-bg-option">
                  {key.replaceAll("_", " ")}
                </option>
              ) : null
            )}
            {/* <option disabled={true}>Loading...</option> */}
          </Select>

          {activeOracleModel.length > 0 ? (
            <Input
              mt={2}
              mb={2}
              ml="auto"
              size="sm"
              bg="#282727"
              height="40px"
              width="260px"
              variant="filled"
              textAlign="center"
              value={oracleAddress}
              onChange={(event) => {
                const address = event.target.value;
                setInputTouched(true);
                setOracleAddress(address);
              }}
              {...DASHBOARD_BOX_PROPS}
              _focus={{ bg: "#121212" }}
              _hover={{ bg: "#282727" }}
              _placeholder={{ color: "#e0e0e0" }}
              disabled={activeOracleModel === "Custom_Oracle" ? false : true}
            />
          ) : null}
          <Text color="grey" fontSize="sm" textAlign="center">
            {oracleIdentity}
          </Text>
          {activeOracleModel === "Custom_Oracle" && (
            <Text color="red" fontSize="sm" textAlign="center">
              Make sure you know what you are doing!
            </Text>
          )}
        </Box>
      </Row>

      <Row
        mainAxisAlignment={mode === "Editing" ? "center" : "center"}
        crossAxisAlignment={mode === "Editing" ? "flex-start" : "center"}
        flexDirection="column"
        width={
          mode === "Adding" && !shouldShowUniV3BaseTokenOracleForm
            ? "100%"
            : "50%"
        }
        // bg="pink"
        ml={mode === "Editing" ? "auto" : ""}
        px={mode === "Editing" ? 4 : 0}
        id="UNIV3Config"
      >
        {activeOracleModel === "Uniswap_V3_Oracle" ? (
          <UniswapV3PriceOracleConfigurator />
        ) : null}

        {activeOracleModel === "Uniswap_V2_Oracle" ? (
          <UniswapV2OrSushiPriceOracleConfigurator type="UniswapV2" />
        ) : null}

        {activeOracleModel === "SushiSwap_Oracle" ? (
          <UniswapV2OrSushiPriceOracleConfigurator type="Sushiswap" />
        ) : null}
      </Row>

      {shouldShowUniV3BaseTokenOracleForm && mode === "Editing" ? (
        <BaseTokenOracleConfig />
      ) : null}

      {activeOracleModel !== "Current_Price_Oracle" && mode === "Editing" ? (
        <SaveButton
          ml={"auto"}
          mb={3}
          mr={4}
          fontSize="xs"
          altText={t("Update")}
          onClick={updateOracle}
        />
      ) : null}
    </>
  );
};
export default OracleConfig;

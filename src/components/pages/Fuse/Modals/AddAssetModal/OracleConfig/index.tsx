// Chakra and UI
import {
    Alert,
    AlertIcon,
    Input,
    Box,
    Text,
    Select,
    Spinner,
    useToast,
  } from "@chakra-ui/react";
  import {
    Center,
    Row,
  } from "utils/chakraUtils";
  import {
    DASHBOARD_BOX_PROPS,
  } from "../../../../../shared/DashboardBox";
  import {
    SaveButton,
  } from "../../../FusePoolEditPage";
  import { QuestionIcon } from "@chakra-ui/icons";
  import { SimpleTooltip } from "../../../../../shared/SimpleTooltip";
  
  // React
  import { useEffect } from "react";
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

const OracleConfig = ({
    mode,
    feeTier,
    oracleData,
    setFeeTier,
    activeOracle,
    tokenAddress,
    oracleAddress,
    oracleTouched,
    uniV3BaseToken,
    setOracleTouched,
    _setActiveOracle,
    _setOracleAddress,
    setUniV3BaseToken,
    poolOracleAddress,
    uniV3BaseTokenOracle,
    setUniV3BaseTokenOracle,
    baseTokenActiveOracleName, 
    setBaseTokenActiveOracleName,
    shouldShowUniV3BaseTokenOracleForm,
  }: {
    shouldShowUniV3BaseTokenOracleForm: any;
    baseTokenActiveOracleName: any, 
    setBaseTokenActiveOracleName: any,
    setUniV3BaseTokenOracle: any;
    uniV3BaseTokenOracle: any;
    poolOracleAddress: string; // Fuse pool's oracle address.
    _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;
    setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;
    setOracleTouched: React.Dispatch<React.SetStateAction<boolean>>;
    _setActiveOracle: React.Dispatch<React.SetStateAction<string>>;
    uniV3BaseToken: any;
    oracleAddress: string; // Address of the oracle that will be used for the asset.
    oracleTouched: boolean;
    tokenAddress: string; // Asset's address. i.e USDC, DAI.
    activeOracle: string; // Stores oracle option that has been chosen for the asset.
    oracleData: any; // Stores Fuse pool's Oracle dat.
    setFeeTier: React.Dispatch<React.SetStateAction<number>>;
    feeTier: number; // Only used to deploy Uniswap V3 Twap Oracle. It holds fee tier from Uniswap's token pair pool.
    mode: "Editing" | "Adding"; // Modal config
  }) => {
    const toast = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
  
    const { fuse, address } = useRari();
  
    const isValidAddress = fuse.web3.utils.isAddress(tokenAddress);
    const isUserAdmin = address === oracleData.admin;
  
    // Available oracle options for asset
    const options = useGetOracleOptions(
      oracleData,
      tokenAddress,
      fuse,
      isValidAddress
    );
  
    // Identify token oracle address
    const oracleIdentity = useIdentifyOracle(oracleAddress);
  
    // If user's editing the asset's properties, show the Ctoken's active Oracle
    useEffect(() => {
      // Map oracleIdentity to whatever the type of `activeOracle` can be
      if (
        mode === "Editing" &&
        options &&
        options["Active_Price_Oracle"] &&
        !oracleTouched
      )
        _setActiveOracle("Active_Price_Oracle");
    }, [mode, activeOracle, options, _setActiveOracle, oracleIdentity, oracleTouched]);
  
    // Update the oracle address, after user chooses which option they want to use.
    // If option is Custom_Oracle or Uniswap_V3_Oracle, oracle address is changed differently so we dont trigger this.
    useEffect(() => {
      if (
        activeOracle.length > 0 &&
        activeOracle !== "Custom_Oracle" &&
        activeOracle !== "Uniswap_V3_Oracle" &&
        activeOracle !== "Uniswap_V2_Oracle" &&
        activeOracle !== "SushiSwap_Oracle" &&
        options
      )
        _setOracleAddress(options[activeOracle]);
    }, [activeOracle, options, _setOracleAddress]);
  
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
        if (activeOracle === "Uniswap_V3_Oracle") {
          // Check for observation cardinality and fix if necessary
          await fuse.primeUniswapV3Oracle(oracleAddressToUse, { from: address });
  
          // Deploy oracle
          oracleAddressToUse = await fuse.deployPriceOracle(
            "UniswapV3TwapPriceOracleV2",
            {
              feeTier,
              baseToken: uniV3BaseToken,
            },
            { from: address }
          );
        }
  
        const tokenArray =
          shouldShowUniV3BaseTokenOracleForm && !isTokenETHOrWETH(uniV3BaseToken)
            ? [tokenAddress, uniV3BaseToken]
            : [tokenAddress];
        const oracleAddressArray =
          shouldShowUniV3BaseTokenOracleForm && !isTokenETHOrWETH(uniV3BaseToken)
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
        _setActiveOracle("Active_Price_Oracle");
        _setOracleAddress(options["Active_Price_Oracle"]);
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
          mainAxisAlignment="space-between"
          alignItems="center"
          crossAxisAlignment="center"
          width="100%"
          pt={mode === "Editing" ? 4 : 0 }
          pb={mode === "Editing" ? 1 : 0 }
          px={mode === "Editing" ? 4 : 0 }
        >
          <SimpleTooltip label={t("Choose the best price oracle for the asset.")}>
            <Text fontWeight="bold">
              {t("Price Oracle")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>
  
          {/* Oracles */}
          <Box
            width={mode === "Editing" ? "50%" : "100%" }
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
              value={activeOracle.toLowerCase()}
              onChange={(event) => {
                if (mode === "Editing") {
                  setOracleTouched(true);
                }
                _setActiveOracle(event.target.value);
              }}
              placeholder={
                activeOracle.length === 0
                  ? t("Choose Oracle")
                  : activeOracle.replaceAll("_", " ")
              }
              disabled={
                !isUserAdmin ||
                (!oracleData.adminOverwrite &&
                  !options.Active_Price_Oracle === null)
              }
            >
              {Object.entries(options).map(([key, value]) =>
                value !== null &&
                value !== undefined &&
                key !== "Active_Price_Oracle" ? (
                  <option key={key} value={key} className="black-bg-option">
                    {key.replaceAll("_", " ")}
                  </option>
                ) : null
              )}
            </Select>
  
            {activeOracle.length > 0 ? (
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
                  _setOracleAddress(address);
                }}
                {...DASHBOARD_BOX_PROPS}
                _focus={{ bg: "#121212" }}
                _hover={{ bg: "#282727" }}
                _placeholder={{ color: "#e0e0e0" }}
                disabled={activeOracle === "Custom_Oracle" ? false : true}
              />
            ) : null}
            <Text color="grey" fontSize="sm" textAlign="center">
              {oracleIdentity}
            </Text>
          </Box>
        </Row>
  
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          flexDirection="column"
          width="100%"
        >
          {activeOracle === "Uniswap_V3_Oracle" ? (
            <UniswapV3PriceOracleConfigurator
              setFeeTier={setFeeTier}
              _setOracleAddress={_setOracleAddress}
              setUniV3BaseToken={setUniV3BaseToken}
              tokenAddress={tokenAddress.toLocaleLowerCase()}
            />
          ) : null}
  
          {activeOracle === "Uniswap_V2_Oracle" ? (
            <UniswapV2OrSushiPriceOracleConfigurator
              type="UniswapV2"
              _setOracleAddress={_setOracleAddress}
              setUniV3BaseToken={setUniV3BaseToken}
              tokenAddress={tokenAddress.toLocaleLowerCase()}
            />
          ) : null}
  
          {activeOracle === "SushiSwap_Oracle" ? (
            <UniswapV2OrSushiPriceOracleConfigurator
              type="Sushiswap"
              _setOracleAddress={_setOracleAddress}
              setUniV3BaseToken={setUniV3BaseToken}
              tokenAddress={tokenAddress.toLocaleLowerCase()}
            />
          ) : null}
        </Row>
  
        {shouldShowUniV3BaseTokenOracleForm && mode === "Editing" ? (
            <BaseTokenOracleConfig
              mode={mode}
              oracleData={oracleData}
              uniV3BaseToken={uniV3BaseToken}
              baseTokenAddress={uniV3BaseToken}
              uniV3BaseTokenOracle={uniV3BaseTokenOracle}
              setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
              baseTokenActiveOracleName={baseTokenActiveOracleName} 
              setBaseTokenActiveOracleName={setBaseTokenActiveOracleName}
            />
        ) : null}
  
        {activeOracle !== "Active_Price_Oracle" && mode === "Editing" ? (
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
export default OracleConfig
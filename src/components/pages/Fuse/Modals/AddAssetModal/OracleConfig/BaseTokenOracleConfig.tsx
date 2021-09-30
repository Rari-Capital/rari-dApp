// Chakra and UI
import {
    Input,
    Box,
    Text,
    Select,
  } from "@chakra-ui/react";
  import {
    Column,
  } from "utils/chakraUtils";
  import {
    DASHBOARD_BOX_PROPS,
  } from "../../../../../shared/DashboardBox";
  import { QuestionIcon } from "@chakra-ui/icons";
  import { SimpleTooltip } from "../../../../../shared/SimpleTooltip";
  
  // Components
  import { CTokenIcon } from "../../../FusePoolsPage";
  
  // React
  import { useEffect } from "react";
  import { useTranslation } from "react-i18next";
  
  // Rari
  import { useRari } from "../../../../../../context/RariContext";

  // Hooks
  import {
    useGetOracleOptions,
  } from "hooks/fuse/useOracleData";

const BaseTokenOracleConfig = ({
    mode,
    oracleData,
    uniV3BaseToken,
    baseTokenAddress,
    uniV3BaseTokenOracle,
    setUniV3BaseTokenOracle,
    baseTokenActiveOracleName, 
    setBaseTokenActiveOracleName
  }: {
    setUniV3BaseTokenOracle: React.Dispatch<React.SetStateAction<string>>; // Sets oracle address for base token
    uniV3BaseTokenOracle: string; // Oracle address chosen for the base token
    baseTokenAddress: string; // Base token address.
    uniV3BaseToken: string; // Base token address.
    oracleData: any; // Fuse Pool's Oracle data. i.e contract, admin, overwrite permissions.
    mode: "Editing" | "Adding";
    baseTokenActiveOracleName: any; 
    setBaseTokenActiveOracleName: any;
  }) => {
    const { t } = useTranslation();
  
    const { fuse, address } = useRari();
  
    const isValidAddress = fuse.web3.utils.isAddress(uniV3BaseToken);
    const isUserAdmin = address === oracleData.admin;
  
    // We get all oracle options.
    const options = useGetOracleOptions(
      oracleData,
      uniV3BaseToken,
      fuse,
      isValidAddress
    );
  
    // If we're editing the asset, show master price oracle as a default.
    // Should run only once, when component renders.
    useEffect(() => {
      if (
        mode === "Editing" &&
        baseTokenActiveOracleName === "" &&
        options &&
        options["Active_Price_Oracle"]
      )
        setBaseTokenActiveOracleName("Active_Price_Oracle");
    }, [mode, baseTokenActiveOracleName, options, setBaseTokenActiveOracleName]);
  
    // This will update the oracle address, after user chooses which options they want to use.
    // If option is Custom_Oracle oracle address is typed in by user, so we dont trigger this.
    useEffect(() => {
      if (!!baseTokenActiveOracleName && baseTokenActiveOracleName !== "Custom_Oracle" && options)
        setUniV3BaseTokenOracle(options[baseTokenActiveOracleName]);
    }, [baseTokenActiveOracleName, options, setUniV3BaseTokenOracle]);
  
    return (
      <Box
        d="flex"
        w="100%"
        alignContent="center"
        flexDirection="column"
        justifyContent="center"
      >
        <Column
          my={4}
          width="100%"
          mx={mode === "Adding" ? 0 : 4}
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
        >
          {options ? (
            <>
              <Column mainAxisAlignment="center" crossAxisAlignment="center">
                <CTokenIcon address={baseTokenAddress} boxSize={"50px"} />
                <SimpleTooltip
                  label={t("Choose the best price oracle for this BaseToken.")}
                >
                  <Text fontWeight="bold" fontSize="sm" align="center">
                    {t("BaseToken Price Oracle")} <QuestionIcon ml={1} mb="4px" />
                  </Text>
                </SimpleTooltip>
              </Column>
  
              <Box alignItems="center">
                <Select
                  {...DASHBOARD_BOX_PROPS}
                  ml="auto"
                  mb={2}
                  borderRadius="7px"
                  _focus={{ outline: "none" }}
                  width="260px"
                  placeholder={
                    baseTokenActiveOracleName.length === 0
                      ? t("Choose Oracle")
                      : baseTokenActiveOracleName.replaceAll("_", " ")
                  }
                  value={baseTokenActiveOracleName.toLowerCase()}
                  disabled={
                    !isUserAdmin ||
                    (!oracleData.adminOverwrite &&
                      !options.Active_Price_Oracle === null)
                  }
                  onChange={(event) => setBaseTokenActiveOracleName(event.target.value)}
                >
                  {Object.entries(options).map(([key, value]) =>
                    value !== null &&
                    value !== undefined &&
                    key !== "Uniswap_V3_Oracle" &&
                    key !== "Uniswap_V2_Oracle" ? (
                      <option className="black-bg-option" value={key} key={key}>
                        {key.replaceAll("_", " ")}
                      </option>
                    ) : null
                  )}
                </Select>
  
                {baseTokenActiveOracleName.length > 0 ? (
                  <Input
                    width="100%"
                    textAlign="center"
                    height="40px"
                    variant="filled"
                    size="sm"
                    mt={2}
                    mb={2}
                    value={uniV3BaseTokenOracle}
                    onChange={(event) => {
                      const address = event.target.value;
                      setUniV3BaseTokenOracle(address);
                    }}
                    disabled={baseTokenActiveOracleName === "Custom_Oracle" ? false : true}
                    {...DASHBOARD_BOX_PROPS}
                    _placeholder={{ color: "#e0e0e0" }}
                    _focus={{ bg: "#121212" }}
                    _hover={{ bg: "#282727" }}
                    bg="#282727"
                  />
                ) : null}
              </Box>
            </>
          ) : null}
        </Column>
      </Box>
    );
  };

export default BaseTokenOracleConfig
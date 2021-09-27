// Chakra and UI
import {
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
  Box,
  Text,
  Image,
  Select,
  Spinner,
  useToast,
  Link
} from "@chakra-ui/react";
import { Column, Center, Row } from "utils/chakraUtils";
import DashboardBox, { DASHBOARD_BOX_PROPS, } from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { SliderWithLabel } from "../../../shared/SliderWithLabel";
import { ConfigRow, SaveButton, testForComptrollerErrorAndSend } from "../FusePoolEditPage";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../shared/SimpleTooltip";

// React
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";

// Rari
import { useRari } from "../../../../context/RariContext";
import Fuse from "../../../../fuse-sdk";

// Axios
import axios from "axios";

// Hooks
import { ETH_TOKEN_DATA, TokenData, useTokenData } from "../../../../hooks/useTokenData";
import { convertIRMtoCurve } from "../FusePoolInfoPage";
import { useOracleData, useGetOracleOptions } from "hooks/fuse/useOracleData";
import { createOracle } from "../../../../utils/createComptroller";

// Utils
import { FuseIRMDemoChartOptions } from "../../../../utils/chartOptions";
import { handleGenericError } from "../../../../utils/errorHandling";
import { USDPricedFuseAsset } from "../../../../utils/fetchFusePoolData";
import { createComptroller } from "../../../../utils/createComptroller";
import { testForCTokenErrorAndSend } from "./PoolModal/AmountSelect";

// Libraries
import Chart from "react-apexcharts";
import BigNumber from "bignumber.js";
import LogRocket from "logrocket";
import { toLocaleString } from "fuse-sdk/webpack.config";
import { smallUsdFormatter } from "utils/bigUtils";


const formatPercentage = (value: number) => value.toFixed(0) + "%";

export const createCToken = (fuse: Fuse, cTokenAddress: string) => {
  const cErc20Delegate = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
    ),
    cTokenAddress
  );

  return cErc20Delegate;
};

export const useLiquidationIncentive = (comptrollerAddress: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(
    comptrollerAddress + " comptrollerData",
    async () => {
      const comptroller = createComptroller(comptrollerAddress, fuse);

      return comptroller.methods.liquidationIncentiveMantissa().call();
    }
  );

  return data;
};

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string
) => {
  const { fuse } = useRari();

  const { data } = useQuery(cTokenAddress + " cTokenData", async () => {
    if (comptrollerAddress && cTokenAddress) {
      const comptroller = createComptroller(comptrollerAddress, fuse);
      const cToken = createCToken(fuse, cTokenAddress);

      const [
        adminFeeMantissa,
        reserveFactorMantissa,
        interestRateModelAddress,
        { collateralFactorMantissa },
        isPaused,
      ] = await Promise.all([
        cToken.methods.adminFeeMantissa().call(),
        cToken.methods.reserveFactorMantissa().call(),
        cToken.methods.interestRateModel().call(),
        comptroller.methods.markets(cTokenAddress).call(),
        comptroller.methods.borrowGuardianPaused(cTokenAddress).call(),
      ]);

      return {
        reserveFactorMantissa,
        adminFeeMantissa,
        collateralFactorMantissa,
        interestRateModelAddress,
        cTokenAddress,
        isPaused,
      };
    } else {
      return null;
    }
  });

  return data;
};

export const AssetSettings = ({
  poolName,
  poolID,
  tokenData,
  comptrollerAddress,
  tokenAddress,
  poolOracleAddress,
  oracleModel,
  oracleData,
  cTokenAddress,
  existingAssets,
  closeModal,
  mode,
}: {
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  tokenData: TokenData;
  tokenAddress: string;
  poolOracleAddress: string;
  oracleModel: string | null;
  oracleData: any

  // Only for editing mode
  cTokenAddress?: string;

  // Only for add asset modal
  existingAssets?: USDPricedFuseAsset[];
  closeModal: () => any;
  mode: "Editing" | "Adding"
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isDeploying, setIsDeploying] = useState(false);

  const [collateralFactor, setCollateralFactor] = useState(50);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [adminFee, setAdminFee] = useState(0);

  const [isBorrowPaused, setIsBorrowPaused] = useState(false);
  const [oracleAddress, _setOracleAddress] = useState<string>("")

  const scaleCollateralFactor = (_collateralFactor: number) => {
    return _collateralFactor / 1e16;
  };

  const scaleReserveFactor = (_reserveFactor: number) => {
    return _reserveFactor / 1e16;
  };

  const scaleAdminFee = (_adminFee: number) => {
    return _adminFee / 1e16;
  };

  const [interestRateModel, setInterestRateModel] = useState(
    Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
      .JumpRateModel_Cream_Stables_Majors
  );

  const { data: curves } = useQuery(
    interestRateModel + adminFee + reserveFactor + " irm",
    async () => {
      const IRM = await fuse.identifyInterestRateModel(interestRateModel);

      if (IRM === null) {
        return null;
      }

      await IRM._init(
        fuse.web3,
        interestRateModel,
        // reserve factor
        reserveFactor * 1e16,
        // admin fee
        adminFee * 1e16,
        // hardcoded 10% Fuse fee
        0.1e18
      );

      return convertIRMtoCurve(IRM, fuse);
    }
  );

  const deploy = async () => {
    // If pool already contains this asset:
    if (
      existingAssets!.some(
        (asset) => asset.underlyingToken === tokenData.address
      )
    ) {
      toast({
        title: "Error!",
        description: "You have already added this asset to this pool.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (oracleAddress === "") {
      toast({
        title: "Error!",
        description: "Please choose a valid oracle for this asset",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });

      return;
    }

    const poolOracleContract = createOracle(poolOracleAddress, fuse, "MasterPriceOracle")

    try {
        await poolOracleContract.methods.add([tokenAddress], [oracleAddress]).send({from: address})
        
        toast({
            title: "You have successfully configured the oracle for this asset!",
            description: "Oracle will now point to the new selected address. Now, lets add you asset to the pool.",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top-right",
        });
    } catch (e) {
        handleGenericError(e, toast);
    }

    setIsDeploying(true);

    // 50% -> 0.5 * 1e18
    const bigCollateralFacotr = new BigNumber(collateralFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = new BigNumber(reserveFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    // 5% -> 0.05 * 1e18
    const bigAdminFee = new BigNumber(adminFee)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    const conf: any = {
      underlying: tokenData.address,
      comptroller: comptrollerAddress,
      interestRateModel,
      initialExchangeRateMantissa: fuse.web3.utils.toBN(1e18),

      // Ex: BOGGED USDC
      name: poolName + " " + tokenData.name,
      // Ex: fUSDC-456
      symbol: "f" + tokenData.symbol + "-" + poolID,
      decimals: 8,
    };

    try {
      await fuse.deployAsset(
        conf,
        bigCollateralFacotr,
        bigReserveFactor,
        bigAdminFee,
        { from: address },
        // TODO: Disable this. This bypasses the price feed check. Only using now because only trusted partners are deploying assets.
        true
      );

      LogRocket.track("Fuse-DeployAsset");

      queryClient.refetchQueries();
      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some refetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "You have successfully added an asset to this pool!",
        description: "You may now lend and borrow with this asset.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      closeModal();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const liquidationIncentiveMantissa =
    useLiquidationIncentive(comptrollerAddress);

  const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);

  // Update values on refetch!
  useEffect(() => {
    if (cTokenData) {
      setCollateralFactor(cTokenData.collateralFactorMantissa / 1e16);
      setReserveFactor(cTokenData.reserveFactorMantissa / 1e16);
      setAdminFee(cTokenData.adminFeeMantissa / 1e16);
      setInterestRateModel(cTokenData.interestRateModelAddress);
      setIsBorrowPaused(cTokenData.isPaused);
    }
  }, [cTokenData]);

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

  return (
    cTokenAddress ? cTokenData?.cTokenAddress === cTokenAddress : true
  ) ? (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
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

        {cTokenData &&
        collateralFactor !==
          scaleCollateralFactor(cTokenData.collateralFactorMantissa) ? (
          <SaveButton ml={3} onClick={updateCollateralFactor} />
        ) : null}

        <SliderWithLabel
          ml="auto"
          value={collateralFactor}
          setValue={setCollateralFactor}
          formatValue={formatPercentage}
          max={
            liquidationIncentiveMantissa
              ? // 100% CF - Liquidation Incentive (ie: 8%) - 5% buffer
                100 - (liquidationIncentiveMantissa.toString() / 1e16 - 100) - 5
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

    {oracleModel === "MasterPriceOracle" && oracleData !== undefined?
        (  <>
              <OracleConfig 
                  oracleData={oracleData} 
                  tokenAddress={tokenAddress}
                  oracleAddress={oracleAddress}
                  _setOracleAddress={_setOracleAddress}
                  poolOracleAddress={poolOracleAddress}
                  mode={mode}
                />

              <ModalDivider />
            </> 
        )
      : null }
      
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

      <Box
        height="170px"
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {curves ? (
          <Chart
            options={
              {
                ...FuseIRMDemoChartOptions,
                colors: ["#FFFFFF", tokenData.color! ?? "#282727"],
              } as any
            }
            type="line"
            width="100%"
            height="100%"
            series={[
              {
                name: "Borrow Rate",
                data: curves.borrowerRates,
              },
              {
                name: "Deposit Rate",
                data: curves.supplierRates,
              },
            ]}
          />
        ) : curves === undefined ? (
          <Center expand color="#FFF">
            <Spinner my={8} />
          </Center>
        ) : (
          <Center expand color="#FFFFFF">
            <Text>
              {t("No graph is available for this asset's interest curves.")}
            </Text>
          </Center>
        )}
      </Box>

      {cTokenAddress ? null : (
        <Box px={4} mt={4} width="100%">
          <Button
            fontWeight="bold"
            fontSize="2xl"
            borderRadius="10px"
            width="100%"
            height="70px"
            color={tokenData.overlayTextColor! ?? "#000"}
            bg={tokenData.color! ?? "#FFF"}
            _hover={{ transform: "scale(1.02)" }}
            _active={{ transform: "scale(0.95)" }}
            isLoading={isDeploying}
            onClick={deploy}
          >
            {t("Confirm")}
          </Button>
        </Box>
      )}
    </Column>
  ) : (
    <Center expand>
      <Spinner my={8} />
    </Center>
  );
};

const OracleConfig = ({
  oracleData,
  tokenAddress,
  oracleAddress,
  _setOracleAddress,
  poolOracleAddress,
  mode,
} : { 
  oracleData: any;
  tokenAddress: string;
  oracleAddress: string;
  _setOracleAddress: any;
  poolOracleAddress: string;
  mode: "Editing" | "Adding"
}) => {
  const toast = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { fuse, address } = useRari()

  // Active Oracle will store oracle model. i.e. Rari Master Price Oracle, Custome Oracle, etc.
  const [activeOracle, _setActiveOracle] = useState<string>("")

  // Used only by UniswapV3TwapOracle
  const [feeTier, setFeeTier] = useState<number>(0)

  const isValidAddress = fuse.web3.utils.isAddress(tokenAddress)
  const isUserAdmin = address === oracleData.admin

  // We get all oracle options
  const options = useGetOracleOptions(oracleData, tokenAddress, fuse, isValidAddress)

  // If we're editing the asset, show master price oracle as a default
  useEffect(() => {
    if(mode === "Editing" && activeOracle === "" && options && options["Master_Price_Oracle_Default"]) 
      _setActiveOracle("Master_Price_Oracle_Default")
  },[mode, activeOracle, options])

  // This will update the oracle address, after user chooses which options they want to use.
  // If option is Custom_Oracle or Uniswap_V3_Oracle, oracle address is changed differently so we dont trigger this.
  useEffect(() => {
      if(activeOracle.length > 0 && activeOracle !== "Custom_Oracle" && activeOracle !== "Uniswap_V3_Oracle" && options) 
        _setOracleAddress(options[activeOracle])
  },[activeOracle, options, _setOracleAddress])


  const updateOracle = async () => {
    const poolOracleContract = createOracle(poolOracleAddress, fuse, "MasterPriceOracle")
    let oracleAddressToUse = oracleAddress

    try {
        if (options === null) return null

        if (activeOracle === "Uniswap_V3_Twap_Oracle") {
          // Check for observation cardinality and fix if necessary
          await fuse.primeUniswapV3Oracle(oracleAddress, {from: address})

          // Deploy oracle
          oracleAddressToUse = await fuse.deployPriceOracle("UniswapV3TwapPriceOracleV2", {uniswapV3Factory: oracleAddress, feeTier, baseToken: tokenAddress}, {from: address})
        }

        // Add oracle to Master Price Oracle
        await poolOracleContract.methods.add([tokenAddress], [oracleAddressToUse]).send({from: address})

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
        _setActiveOracle("Master_Price_Oracle_Default")
        _setOracleAddress(options["Master_Price_Oracle_Default"])
    } catch (e) {
        handleGenericError(e, toast);
    }
}

  return (
    <ConfigRow mainAxisAlignment="space-between">
      {options ?
          <>
          <SimpleTooltip
              label={isUserAdmin ? oracleData.adminOverwrite 
                ? t("Choose the best price oracle for the asset.") 
                : options.Master_Price_Oracle_Default === null 
                ? t("Once the oracle is set you won't be able to change it") 
                : t("Oracle has been set and can't be changed.")
                : t("You're not the oracle admin.")
              }
          >
              <Text fontWeight="bold">
              {t("Price Oracle")} <QuestionIcon ml={1} mb="4px" />
              </Text>
          </SimpleTooltip>

          <Box
              width="260px"
              alignItems="flex-end"
          >
              <Select
                  {...DASHBOARD_BOX_PROPS}
                  ml="auto"
                  mb={2}
                  borderRadius="7px"
                  _focus={{ outline: "none" }}
                  width="260px"
                  placeholder={activeOracle.length === 0 ? t("Choose Oracle"): activeOracle.replaceAll("_", " ")}
                  value={activeOracle.toLowerCase()}
                  disabled={!isUserAdmin || ( !oracleData.adminOverwrite && !options.Master_Price_Oracle_Default === null)}
                  onChange={(event) => _setActiveOracle(event.target.value)}
              >
                  {Object.entries(options).map(([key, value]) => 
                      value !== null && value !== undefined ? 
                      <option
                          className="black-bg-option"
                          value={key}
                          key={key}
                      >
                          {key.replaceAll('_', ' ')}
                      </option> : null
                  )}

              </Select>

              { activeOracle.length > 0 ? 
                  <Input
                      width="260px"
                      textAlign="center"
                      height="40px"
                      variant="filled"
                      size="sm"
                      mt={2}
                      mb={2}
                      value={oracleAddress}
                      onChange={(event) => {
                          const address = event.target.value;
                          _setOracleAddress(address);
                      }}
                      disabled={activeOracle === "Custom_Oracle" ? false : true}
                      {...DASHBOARD_BOX_PROPS}
                      _placeholder={{ color: "#e0e0e0" }}
                      _focus={{ bg: "#121212" }}
                      _hover={{ bg: "#282727" }}
                      bg="#282727"
                  />
              : null }

              { activeOracle === "Uniswap_V3_Oracle" ? 
                <UniswapV3PriceOracleConfigurator 
                  _setOracleAddress={_setOracleAddress} 
                  tokenAddress={tokenAddress.toLocaleLowerCase()}
                  setFeeTier={setFeeTier}
                /> 
                : null 
              }


          </Box>

          {activeOracle !== "Master_Price_Oracle_Default" && mode === "Editing" ? (
                <SaveButton 
                  ml={1} 
                  onClick={updateOracle} 
                  fontSize="xs"
                  altText={t("Update")}
                />
              ) : null
          }
          </>
          
          : null 

        }
    </ConfigRow>
  )
}


const UniswapV3PriceOracleConfigurator = (
  {
    tokenAddress, 
    _setOracleAddress,
    setFeeTier
  }: {
    tokenAddress: string, 
    _setOracleAddress: (value: React.SetStateAction<string>) => void,
    setFeeTier: React.Dispatch<React.SetStateAction<number>>
  }
) => {
  const { t } = useTranslation();

  // This will be used to index whitelistPools array (fetched from the graph.)
  // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
  const [activePool, setActivePool] = useState<string>("");

  // We get a list of whitelistedPools from uniswap-v3's the graph.
  const {data: liquidity, error} = useQuery("UniswapV3 pool liquidity for " + tokenAddress, async () =>
    (await axios.post(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
        {
          query:
          `{
            token(id:"${tokenAddress}") {
              whitelistPools {
                id,
                feeTier,
                totalValueLockedUSD,
                token0 {
                  name
                },
                token1 {
                  name
                }
              }
            }
          }`,
        }
      )).data
  , {refetchOnMount: false})

  // When user selects an option this function will be called.
  // Active pool is updated and we set the oracle address to the address of the pool we chose.
  const updateBoth = (value: string) => {
     setActivePool(value)
     setFeeTier(liquidity.data.token.whitelistPools[value].feeTier)
    _setOracleAddress(liquidity.data.token.whitelistPools[value].id)
  }

  // If liquidity is undefined, theres an error or theres no token found return nothing.
  if (liquidity === undefined || error || liquidity.data.token === null) return null

  // Sort whitelisted pools by TVL. Greatest to smallest.
  const liquiditySorted = liquidity.data.token.whitelistPools.sort((a: any, b: any): any => parseInt(a.totalValueLockedUSD) > parseInt(b.totalValueLockedUSD) ? -1 : 1)
  
  return (
    <>
    <Row
      crossAxisAlignment="center"
      mainAxisAlignment="space-between"
      width="260px"
      my={2}
    >
      <SimpleTooltip label={t("This field will determine which pool your oracle reads from. Its safer with more liquidity.")}>
        <Text fontWeight="bold">
          {t("Pool:")} <QuestionIcon ml={1} mb="4px" />
        </Text>
      </SimpleTooltip>
      <Select
        {...DASHBOARD_BOX_PROPS}
        ml={2}
        mb={2}
        borderRadius="7px"
        _focus={{ outline: "none" }}
        width="180px"
        placeholder={activePool.length === 0 ? t("Choose Pool"): activePool}
        value={activePool}
        onChange={(event) => { 
          updateBoth(event.target.value)}}
        >
        {typeof liquidity !== undefined
          ? Object.entries(liquiditySorted).map(([key, value]: any[]) => 
              value.totalValueLockedUSD !== null && value.totalValueLockedUSD !== undefined && value.totalValueLockedUSD !== "0" 
              ? ( 
                <option
                    className="black-bg-option"
                    value={key}
                    key={value.id}
                >
                    {`${value.token0.name} / ${value.token1.name}`}
                </option> 
              ) : null)
        : null }
      </Select>
    </Row>

    {activePool.length > 0 ?
      <>
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={2}
        >
          <SimpleTooltip label={t("TVL in pool as of this moment.")}>
              <Text fontWeight="bold">
                {t("Liquidity:")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>
          <h1>
            {activePool !== "" ? smallUsdFormatter(liquidity.data.token.whitelistPools[activePool].totalValueLockedUSD) : null}
          </h1>
        </Row>
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={4}
        >
          <SimpleTooltip label={t("The fee percentage for the pool on Uniswap (0.05%, 0.3%, 1%)")}>
            <Text fontWeight="bold">
              {t("Fee Tier:")} <QuestionIcon ml={1} mb="4px" />
            </Text>
          </SimpleTooltip>
          <Text>
            %{activePool !== "" ? liquidity.data.token.whitelistPools[activePool].feeTier / 10000 : null}
          </Text>
        </Row>
        <Row
        crossAxisAlignment="center"
        mainAxisAlignment="center"
        width="260px"
        my={0}
        >
          <Link href={`https://info.uniswap.org/#/pools/${liquidity.data.token.whitelistPools[activePool].id}`} isExternal  >
            Visit Pool in Uniswap
          </Link>
        </Row>
      </>
    : null }
    </>
  )
}

const AddAssetModal = ({
  comptrollerAddress,
  poolOracleAddress,
  oracleModel,
  poolName,
  poolID,
  isOpen,
  onClose,
  existingAssets,
}: {
  comptrollerAddress: string;
  poolOracleAddress: string;
  oracleModel: string | null;
  poolName: string;
  poolID: string;
  isOpen: boolean;
  onClose: () => any;
  existingAssets: USDPricedFuseAsset[];
}) => {
  const { t } = useTranslation();
  const { fuse } = useRari()

  const [tokenAddress, _setTokenAddress] = useState<string>("");

  const tokenData = useTokenData(tokenAddress);
  const oracleData = useOracleData(poolOracleAddress, fuse)

  const isEmpty = tokenAddress.trim() === "";

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <Heading fontSize="27px" my={4} textAlign="center">
          {t("Add Asset")}
        </Heading>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          pb={4}
        >
          {!isEmpty ? (
            <>
              {tokenData?.logoURL ? (
                <Image
                  mt={4}
                  src={tokenData.logoURL}
                  boxSize="50px"
                  borderRadius="50%"
                  backgroundImage={`url(${SmallWhiteCircle})`}
                  backgroundSize="100% auto"
                />
              ) : null}
              <Heading
                my={tokenData?.symbol ? 3 : 6}
                fontSize="22px"
                color={tokenData?.color ?? "#FFF"}
              >
                {tokenData
                  ? tokenData.name ?? "Invalid Address!"
                  : "Loading..."}
              </Heading>
            </>
          ) : null}

          <Center px={4} mt={isEmpty ? 4 : 0} width="100%">
            <Input
              width="100%"
              textAlign="center"
              placeholder={t(
                "Token Address: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              )}
              height="40px"
              variant="filled"
              size="sm"
              value={tokenAddress}
              onChange={(event) => {
                const address = event.target.value;
                _setTokenAddress(address);
              }}
              {...DASHBOARD_BOX_PROPS}
              _placeholder={{ color: "#e0e0e0" }}
              _focus={{ bg: "#121212" }}
              _hover={{ bg: "#282727" }}
              bg="#282727"
            />

            {!existingAssets.some(
              // If ETH hasn't been added:
              (asset) => asset.underlyingToken === ETH_TOKEN_DATA.address
            ) ? (
              <DashboardBox
                flexShrink={0}
                as="button"
                ml={2}
                height="40px"
                borderRadius="10px"
                px={2}
                fontSize="sm"
                fontWeight="bold"
                onClick={() => _setTokenAddress(ETH_TOKEN_DATA.address)}
              >
                <Center expand>ETH</Center>
              </DashboardBox>
            ) : null}
          </Center>

          {tokenData?.symbol ? (
            <>
              <ModalDivider mt={4} />
              <AssetSettings
                mode="Adding"
                comptrollerAddress={comptrollerAddress}
                tokenData={tokenData}
                tokenAddress={tokenAddress}
                poolOracleAddress={poolOracleAddress}
                oracleModel={oracleModel}
                oracleData={oracleData}
                closeModal={onClose}
                poolName={poolName}
                poolID={poolID}
                existingAssets={existingAssets}
              />
            </>
          ) : null}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;

// Chakra and UI
import {
  Alert,
  AlertIcon,
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
  Link,
  Checkbox,
  Stack
} from "@chakra-ui/react";
import { Column, Center, Row } from "utils/chakraUtils";
import DashboardBox, { DASHBOARD_BOX_PROPS, } from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { SliderWithLabel } from "../../../shared/SliderWithLabel";
import { ConfigRow, SaveButton, testForComptrollerErrorAndSend } from "../FusePoolEditPage";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../shared/SimpleTooltip";

import { CTokenIcon } from "../FusePoolsPage";


// React
import { useEffect, useState, useMemo } from "react";
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
import { useOracleData, useGetOracleOptions, useSushiOrUniswapV2Pairs } from "hooks/fuse/useOracleData";
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
import { smallUsdFormatter, shortUsdFormatter } from "utils/bigUtils";


const formatPercentage = (value: number) => value.toFixed(0) + "%";

const ETH_AND_WETH = ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000000000000000000000"]
const isTokenETHOrWETH = (tokenAddress: string) => ETH_AND_WETH.includes(tokenAddress.toLowerCase())


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

  // Sharad - univ3 base token oracle check
  const [uniV3BaseTokenOracle, setUniV3BaseTokenOracle] = useState<string>("")  // this is the oracle we choose for the univ3BaseToken if it doesn't already exist
  const [uniV3BaseToken, setUniV3BaseToken] = useState<string>("")  // if you choose univ3 pool for your token oracle, this is ur base token (pair token on the unvi3 pool)
  const [uniV3BaseTokenHasOracle, setUniV3BaseTokenHasOracle] = useState<boolean>(false)

  // If you typed in a univ3Basetoken AND it doesn't have an oracle in the MasterPriceOracle, then show the form
  // Or if the baseToken is weth then dont show form because we already have a hardcoded oracle for it
  const shouldShowUniV3BaseTokenOracleForm = useMemo(() => 
    ( !!uniV3BaseToken && !uniV3BaseTokenHasOracle ) 
  ,[uniV3BaseTokenHasOracle, uniV3BaseToken])

  // If you are using a univ3oracle, check the basetoken for an oracle
  useEffect(() => {
    if (!!uniV3BaseToken) {
    // check if masterpriceoracle has a oracle for basetoken
    oracleData.oracleContract.methods.oracles(uniV3BaseToken).call().then((address: string) => {
      console.log("oracle address for basetoken", {uniV3BaseToken, address})

      // if address  is EmptyAddress then there is no oracle for this token
      return address === "0x0000000000000000000000000000000000000000" ? setUniV3BaseTokenHasOracle(false) : setUniV3BaseTokenHasOracle(true)
    } )
  }
  }, [uniV3BaseToken, oracleData, setUniV3BaseTokenHasOracle])

  // Active Oracle will store oracle model. i.e. Rari Master Price Oracle, Custome Oracle, etc.
  const [activeOracle, _setActiveOracle] = useState<string>("")

  // Used only by UniswapV3TwapOracle
  const [feeTier, setFeeTier] = useState<number>(0)

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
    let oracleAddressToUse = oracleAddress
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

    setIsDeploying(true);

    const poolOracleContract = createOracle(poolOracleAddress, fuse, "MasterPriceOracle")

    if (activeOracle === "Uniswap_V3_Oracle") {

      // If this oracle is set in the optional form (only if u have a univ3pair and the base token isnt in the oracle)
      // Then u have to deploy the base token )

      // Check for observation cardinality and fix if necessary
      await fuse.primeUniswapV3Oracle(oracleAddress, {from: address})

      // Deploy oracle
      oracleAddressToUse = await fuse.deployPriceOracle("UniswapV3TwapPriceOracleV2", {feeTier, baseToken: uniV3BaseToken}, {from: address})
    } 

    if (activeOracle === "Uniswap_V2_Oracle") {
      // Deploy Oracle
      oracleAddressToUse = await fuse.deployPriceOracle("UniswapTwapPriceOracleV2", {baseToken: uniV3BaseToken}, {from: address})
    }

    console.log({tokenAddress, uniV3BaseToken, oracleAddressToUse, uniV3BaseTokenOracle})

    try {
        const tokenArray = shouldShowUniV3BaseTokenOracleForm ? [tokenAddress, uniV3BaseToken] : [tokenAddress]
        const oracleAddress = shouldShowUniV3BaseTokenOracleForm ? [oracleAddressToUse, uniV3BaseTokenOracle] : [oracleAddressToUse]

        await poolOracleContract.methods.add(tokenArray, oracleAddress).send({from: address})
        
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


    // 50% -> 0.5 * 1e18
    const bigCollateralFactor = new BigNumber(collateralFactor)
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

    console.log({conf, bigCollateralFactor,  bigReserveFactor, bigAdminFee, address })

    try {
      await fuse.deployAsset(
        conf,
        bigCollateralFactor,
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

    {oracleModel === "MasterPriceOracle" && oracleData !== undefined  && !isTokenETHOrWETH(tokenAddress) &&
        (  <>
              <OracleConfig 
                  oracleData={oracleData} // pool oracle data (?)
                  tokenAddress={tokenAddress} // asset you want to add
                  activeOracle={activeOracle} // name of the current token's pricefeed oracle : UniswapV3 / ChainLink / MasterPriceOracle etc
                  feeTier={feeTier} // only used for uniswapv3. 
                  oracleAddress={oracleAddress}   // address of the asset's oracle
                  poolOracleAddress={poolOracleAddress} // pool oracle address
                  mode={mode} // Editing or Adding
                  _setActiveOracle={_setActiveOracle}
                  setFeeTier={setFeeTier}
                  _setOracleAddress={_setOracleAddress}
                  uniV3BaseTokenOracle={uniV3BaseTokenOracle} // base token ORACLE
                  setUniV3BaseTokenOracle={setUniV3BaseTokenOracle} // base token ORACLE
                  setUniV3BaseToken={setUniV3BaseToken} // base token address
                  uniV3BaseToken={uniV3BaseToken} // base token address
                />

              <ModalDivider />
              
            </> 
        ) }

      {shouldShowUniV3BaseTokenOracleForm ? (
        <>
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="center"
          width="100%"
          my={2}
        >
          <Alert status="info" width="80%" borderRadius={5} my={1}>
              <AlertIcon/>
              <Text fontSize="sm" align="center" color="black">
                {"This Uniswap V3 TWAP Oracle needs an oracle for the BaseToken."}
              </Text>
          </Alert>
        </Row>
        <BaseTokenOracleConfig 
        oracleData={oracleData}
        poolOracleAddress={poolOracleAddress}
        baseTokenAddress={uniV3BaseToken}
        uniV3BaseTokenOracle={uniV3BaseTokenOracle}
        setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
        uniV3BaseToken={uniV3BaseToken}
        mode={mode}
        />
        </>
      ) : null }

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
  setFeeTier,
  feeTier,
  activeOracle,
  _setActiveOracle,
  uniV3BaseTokenOracle, // base token ORACLE
  setUniV3BaseTokenOracle, // base token ORACLE
  setUniV3BaseToken, // base token address
  uniV3BaseToken, // base token address
} : { 
  oracleData: any;
  tokenAddress: string;
  oracleAddress: string;
  _setOracleAddress:  React.Dispatch<React.SetStateAction<string>>;
  uniV3BaseTokenOracle: string;
  setUniV3BaseTokenOracle:  React.Dispatch<React.SetStateAction<string>>;
  setUniV3BaseToken:  React.Dispatch<React.SetStateAction<string>>
  uniV3BaseToken: string;
  _setActiveOracle:  React.Dispatch<React.SetStateAction<string>>;
  setFeeTier:  React.Dispatch<React.SetStateAction<number>>;
  feeTier: number;
  activeOracle: string;
  poolOracleAddress: string;
  mode: "Editing" | "Adding";
}) => {
  const toast = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { fuse, address } = useRari()

  const isValidAddress = fuse.web3.utils.isAddress(tokenAddress)
  const isUserAdmin = address === oracleData.admin

  // We get all oracle options
  const options = useGetOracleOptions(oracleData, tokenAddress, fuse, isValidAddress)

  // If we're editing the asset, show master price oracle as a default
  useEffect(() => {
    if(mode === "Editing" && activeOracle === "" && options && options["Master_Price_Oracle_Default"]) 
      _setActiveOracle("Master_Price_Oracle_Default")
  },[mode, activeOracle, options, _setActiveOracle])

  // This will update the oracle address, after user chooses which options they want to use.
  // If option is Custom_Oracle or Uniswap_V3_Oracle, oracle address is changed differently so we dont trigger this.
  useEffect(() => {
      if(activeOracle.length > 0 && activeOracle !== "Custom_Oracle" && activeOracle !== "Uniswap_V3_Oracle" && activeOracle !== "Uniswap_V2_Oracle" && options) 
        _setOracleAddress(options[activeOracle])
  },[activeOracle, options, _setOracleAddress])


  const updateOracle = async () => {
    const poolOracleContract = createOracle(poolOracleAddress, fuse, "MasterPriceOracle")
    let oracleAddressToUse = oracleAddress

    try {
        if (options === null) return null

        if (activeOracle === "Uniswap_V3_Oracle") {
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
                  setUniV3BaseToken={setUniV3BaseToken}
                  tokenAddress={tokenAddress.toLocaleLowerCase()}
                  setFeeTier={setFeeTier}
                /> 
                : null 
              }

              { activeOracle === "Uniswap_V2_Oracle" ?
                <UniswapV2OrSushiPriceOracleConfigurator 
                  _setOracleAddress={_setOracleAddress} 
                  setUniV3BaseToken={setUniV3BaseToken}
                  tokenAddress={tokenAddress.toLocaleLowerCase()}
                  type="UniswapV2"
                />
                : null 
              }


              { activeOracle === "SushiSwap_Oracle" ?
                <UniswapV2OrSushiPriceOracleConfigurator 
                  _setOracleAddress={_setOracleAddress} 
                  setUniV3BaseToken={setUniV3BaseToken}
                  tokenAddress={tokenAddress.toLocaleLowerCase()}
                  type="Sushiswap"
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
    setUniV3BaseToken,
    setFeeTier
  }: {
    tokenAddress: string, 
    _setOracleAddress: React.Dispatch<React.SetStateAction<string>>,
    setUniV3BaseToken:  React.Dispatch<React.SetStateAction<string>>,
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
                  symbol,
                  id
                },
                token1 {
                  symbol,
                  id
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
    const uniPool = liquidity.data.token.whitelistPools[value]
    setActivePool(value)
    setFeeTier(uniPool.feeTier)
    _setOracleAddress(uniPool.id)
    setUniV3BaseToken(uniPool.token0.id === tokenAddress ? uniPool.token1.id : uniPool.token0.id )
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
              value.totalValueLockedUSD !== null && value.totalValueLockedUSD !== undefined && value.totalValueLockedUSD >= 100 
              ? ( 
                <option
                    className="black-bg-option"
                    value={key}
                    key={value.id}
                >
                    {`${value.token0.symbol} / ${value.token1.symbol} (${shortUsdFormatter(value.totalValueLockedUSD)})`}
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

const UniswapV2OrSushiPriceOracleConfigurator = (
  {
    tokenAddress,
    _setOracleAddress,
    setUniV3BaseToken,
    type,
  } : {
    tokenAddress: string
    _setOracleAddress: React.Dispatch<React.SetStateAction<string>>,
    setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>,
    type: string
  }) => { 

    const { t } = useTranslation()
    
    // This will be used to index whitelistPools array (fetched from the graph.)
    // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
    const [activePool, setActivePool] = useState<string>("");
    const [checked, setChecked] = useState<boolean>(false)
    const [checkedStepTwo, setCheckedStepTwo] = useState<boolean>(false)
    
    const {SushiPairs, SushiError, UniV2Pairs, univ2Error} = useSushiOrUniswapV2Pairs(tokenAddress)

    const Pairs = type === "UniswapV2" ? UniV2Pairs : SushiPairs
    const Error = type === "UniswapV2" ? univ2Error : SushiError

    const updateInfo = (value: string) => {
      const pair = Pairs[value]
      setActivePool(value)
      _setOracleAddress(pair.id)
      setUniV3BaseToken(pair.token1.id === tokenAddress ? pair.token0.id : pair.token1.id)
    }

  if (Pairs === undefined || Error || Pairs === null) return null
  
  return (
    <>
    <Row 
      crossAxisAlignment="center"
      mainAxisAlignment="space-between"
      width="260px"
      my={3}
    >
     <Checkbox
        isChecked={checked}
        onChange={() => setChecked(!checked)}
     >
       <Text fontSize="xs" align="center">
         Using this type of oracle requires you to run a TWAP bot.
       </Text>
     </Checkbox> 
    </Row>

    { checked ?
      <Row 
        crossAxisAlignment="center"
        mainAxisAlignment="space-between"
        width="260px"
        my={3}
      >
        <Stack direction="row" spacing={4}>
          <Button colorScheme="teal">
            Check
          </Button>

          <Text fontSize="xs" align="center">
            After deploying your oracle, you have to wait about 15 - 25 minutes for the oracle to be set.
          </Text>
        </Stack>

      </Row> 
    : null }

    { true ? 
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
          disabled={!checked}
          onChange={(event) => { 
            updateInfo(event.target.value)}}
          >
          {typeof Pairs !== undefined
            ? Object.entries(Pairs).map(([key, value]: any[]) => 
                value.totalSupply !== null && value.totalSupply !== undefined && value.totalSupply >= 100
                ? ( 
                  <option
                      className="black-bg-option"
                      value={key}
                      key={value.id}
                  >
                      {`${value.token0.symbol} / ${value.token1.symbol} (${shortUsdFormatter(value.totalSupply)})`}
                  </option> 
                ) : null)
          : null }
        </Select>
      </Row> 
    : null }

     {activePool.length > 0 ?
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
            {activePool !== "" ? smallUsdFormatter(Pairs[activePool].totalSupply) : null}
          </h1>
        </Row>
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

const BaseTokenOracleConfig = ({
  oracleData,
  baseTokenAddress,
  setUniV3BaseTokenOracle,
  poolOracleAddress,
  mode,
  uniV3BaseTokenOracle, // base token ORACLE
  uniV3BaseToken, // base token address
} : { 
  oracleData: any;
  poolOracleAddress: string;
  baseTokenAddress: string;
  uniV3BaseTokenOracle: string;
  setUniV3BaseTokenOracle:  React.Dispatch<React.SetStateAction<string>>;
  uniV3BaseToken: string;
  mode: "Editing" | "Adding";
}) => {
  const toast = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { fuse, address } = useRari()

  const isValidAddress = fuse.web3.utils.isAddress(uniV3BaseToken)
  const isUserAdmin = address === oracleData.admin

  const [activeOracleName, setActiveOracleName] = useState<string>("")

  // We get all oracle options
  const options = useGetOracleOptions(oracleData, uniV3BaseToken, fuse, isValidAddress)

  // If we're editing the asset, show master price oracle as a default
  useEffect(() => {
    if(mode === "Editing" && activeOracleName === "" && options && options["Master_Price_Oracle_Default"]) 
      setActiveOracleName("Master_Price_Oracle_Default")
  },[mode, activeOracleName, options, setActiveOracleName])

  // This will update the oracle address, after user chooses which options they want to use.
  // If option is Custom_Oracle or Uniswap_V3_Oracle, oracle address is changed differently so we dont trigger this.
  useEffect(() => {
      if(!!activeOracleName && activeOracleName !== "Custom_Oracle" && options) 
        setUniV3BaseTokenOracle(options[activeOracleName])
  },[activeOracleName, options, setUniV3BaseTokenOracle])


  const updateOracle = async () => {
    const poolOracleContract = createOracle(poolOracleAddress, fuse, "MasterPriceOracle")
    let oracleAddressToUse = uniV3BaseTokenOracle

    try {
        if (options === null) return null

        // Removed uniswapv3 option for oracle

        // Add oracle to Master Price Oracle
        await poolOracleContract.methods.add([uniV3BaseTokenOracle], [oracleAddressToUse]).send({from: address})

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
        setActiveOracleName("Master_Price_Oracle_Default")
        setUniV3BaseTokenOracle(options["Master_Price_Oracle_Default"])
    } catch (e) {
        handleGenericError(e, toast);
    }
}

  return (
    <Row 
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      my={4}
      mx={4}
    >
      {options ?
          <>
          <Column mainAxisAlignment="center" crossAxisAlignment="center">
            <Stack direction="column" spacing={3} align="center">
            <CTokenIcon address={baseTokenAddress} boxSize={"50px"} />
            <SimpleTooltip
                label={t("Choose the best price oracle for this BaseToken.") }
            >
                <Text fontWeight="bold" fontSize="sm" align="center">
                  {t("BaseToken Price Oracle")} <QuestionIcon ml={1} mb="4px" />
                </Text>
            </SimpleTooltip>
            </Stack>
          </Column>

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
                  placeholder={activeOracleName.length === 0 ? t("Choose Oracle"): activeOracleName.replaceAll("_", " ")}
                  value={activeOracleName.toLowerCase()}
                  disabled={!isUserAdmin || ( !oracleData.adminOverwrite && !options.Master_Price_Oracle_Default === null)}
                  onChange={(event) => setActiveOracleName(event.target.value)}
              >
                  {Object.entries(options).map(([key, value]) => 
                      value !== null && value !== undefined  && key !== "Uniswap_V3_Oracle" && key!== "Uniswap_V2_Oracle" ? 
                      <option
                          className="black-bg-option"
                          value={key}
                          key={key}
                      >
                          {key.replaceAll('_', ' ')}
                      </option> : null
                  )}

              </Select>

              { activeOracleName.length > 0 ? 
                  <Input
                      width="260px"
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
                      disabled={activeOracleName === "Custom_Oracle" ? false : true}
                      {...DASHBOARD_BOX_PROPS}
                      _placeholder={{ color: "#e0e0e0" }}
                      _focus={{ bg: "#121212" }}
                      _hover={{ bg: "#282727" }}
                      bg="#282727"
                  />
              : null }

          </Box>

          {/* This can only happen if you are the admin and you are editing (not creating) */}
          {activeOracleName !== "Master_Price_Oracle_Default" && mode === "Editing" ? (
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
    </Row>
  )
}
// Chakra and UI
import {
    Heading,
    Spinner,
    useToast,
  } from "@chakra-ui/react";
  import {
    Column,
    Center,
    RowOrColumn,
  } from "utils/chakraUtils";
  import { Fade } from "@chakra-ui/react";
  
  // React
  import { useEffect, useState, useMemo } from "react";
  
  // React Query
  import { useQueryClient } from "react-query";
  
  // Rari
  import Fuse from "../../../../../fuse-sdk";
  import { useRari } from "../../../../../context/RariContext";
  
  // Hooks
  import { TokenData } from "../../../../../hooks/useTokenData";
  import { createOracle } from "../../../../../utils/createComptroller";
  import { useCTokenData } from "hooks/fuse/useCTokenData";
  import { OracleDataType } from "hooks/fuse/useOracleData";
  import useIRMCurves from "hooks/fuse/useIRMCurves";
  
  // Utils
  import { handleGenericError } from "../../../../../utils/errorHandling";
  import { USDPricedFuseAsset } from "../../../../../utils/fetchFusePoolData";
  import { isTokenETHOrWETH } from "utils/tokenUtils";
  
  // Libraries
  import BigNumber from "bignumber.js";
  import LogRocket from "logrocket";
  import { useIsMediumScreen } from "../../FuseTabBar";

  // Components
  import DeployButton from "./DeployButton";
  import AssetConfig from "./AssetConfig";
  import Screen1 from "./Screens/Screen1";
  import Screen2 from "./Screens/Screen2";
  import Screen3 from "./Screens/Screen3";


  const SimpleDeployment = [
    "Configuring your Fuse pool's Master Price Oracle",
    "Configuring your Fuse pool to support new asset market",
    "All Done!",
  ];
  
  const UniSwapV3DeploymentSimple = [
    "Checking for pair's cardinality",
    "Increasing Uniswap V3 pair cardinality",
    "Deploying Uniswap V3 Twap Oracle",
    "Configuring your Fuse pool's Master Price Oracle",
    "Configuring your Fuse pool to support new asset market",
    "All Done!",
  ];

 const AssetSettings = ({
    mode,
    poolID,
    poolName,
    tokenData,
    closeModal,
    oracleData,
    oracleModel,
    tokenAddress,
    cTokenAddress,
    existingAssets,
    poolOracleAddress,
    comptrollerAddress,
  }: {
    comptrollerAddress: string; // Fuse pool's comptroller address
    poolOracleAddress: string; // Fuse pool's oracle address
    tokenAddress: string; // Underlying token's addres. i.e. USDC, DAI, etc.
    oracleModel: string | null; // Fuse pool's oracle model name. i.e MasterPrice, Chainlink, etc.
    oracleData: OracleDataType; // Fuse pool's oracle contract, admin, overwriting permissions.
    tokenData: TokenData; // Token's data i.e. symbol, logo, css color, etc.
    poolName: string; // Fuse pool's name.
    poolID: string; // Fuse pool's ID.
  
    // Only for editing mode
    cTokenAddress?: string; // CToken for Underlying token. i.e f-USDC-4
  
    // Only for add asset modal
    existingAssets?: USDPricedFuseAsset[]; // A list of assets in the pool
  
    // Modal config
    closeModal: () => any;
    mode: "Editing" | "Adding";
  }) => {
    const toast = useToast();
    const { fuse, address } = useRari();
    const queryClient = useQueryClient();
    const isMobile = useIsMediumScreen();
  
    // Component state
    const [isDeploying, setIsDeploying] = useState(false);
  
    // Asset's general configurations.
    const [adminFee, setAdminFee] = useState(0);
    const [reserveFactor, setReserveFactor] = useState(10);
    const [isBorrowPaused, setIsBorrowPaused] = useState(false);
    const [collateralFactor, setCollateralFactor] = useState(50);
    
    const [oracleTouched, setOracleTouched] = useState(false);
    
    const [interestRateModel, setInterestRateModel] = useState(
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
      .JumpRateModel_Cream_Stables_Majors
      );
      
    const curves = useIRMCurves({ interestRateModel, adminFee, reserveFactor });
      
    // Asset's Oracle Configuration
    const [activeOracle, _setActiveOracle] = useState<string>(""); // Will store the oracle's model selected for this asset. i.e. Rari Master Price Oracle, Custome Oracle, etc.
    const [oracleAddress, _setOracleAddress] = useState<string>(""); // Will store the actual address of the oracle.
  
    // Uniswap V3 base token oracle config - these following lines are used only
    // if you choose Uniswap V3 Twap Oracle as the asset's oracle.
    const [feeTier, setFeeTier] = useState<number>(0);
    const [uniV3BaseToken, setUniV3BaseToken] = useState<string>(""); // This will store the pair's base token.
    const [uniV3BaseTokenOracle, setUniV3BaseTokenOracle] = useState<string>(""); // This will store the oracle chosen for the univ3BaseToken.
    const [baseTokenActiveOracleName, setBaseTokenActiveOracleName] = useState<string>("");
    const [uniV3BaseTokenHasOracle, setUniV3BaseTokenHasOracle] =
      useState<boolean>(false); // Will let us know if fuse pool's oracle has a price feed for the pair's base token.
  
    // If univ3Basetoken doesn't have an oracle in the fuse pool's oracle, then show the form
    // Or if the baseToken is weth then dont show form because we already have a hardcoded oracle for it
    const shouldShowUniV3BaseTokenOracleForm = useMemo(
      () =>
        !!uniV3BaseToken &&
        !uniV3BaseTokenHasOracle &&
        !isTokenETHOrWETH(uniV3BaseToken) &&
        (activeOracle === "Uniswap_V3_Oracle" ||
          activeOracle === "Uniswap_V2_Oracle" ||
          activeOracle === "SushiSwap_Oracle"),
      [uniV3BaseTokenHasOracle, uniV3BaseToken, activeOracle]
    );
  
    useEffect(() => {
      if (!!uniV3BaseToken && !isTokenETHOrWETH(uniV3BaseToken)) {
        // check if fuse pool's oracle has an oracle for uniV3BaseToken
        oracleData.oracleContract.methods
          .oracles(uniV3BaseToken)
          .call()
          .then((address: string) => {
            // if address  is EmptyAddress then there is no oracle for this token
            return address === "0x0000000000000000000000000000000000000000"
              ? setUniV3BaseTokenHasOracle(false)
              : setUniV3BaseTokenHasOracle(true);
          });
      }
    }, [uniV3BaseToken, oracleData, setUniV3BaseTokenHasOracle]);
  
    // Transaction Stepper
    const [activeStep, setActiveStep] = useState<number>(0);
    const [stage, setStage] = useState<number>(1);
  
    const handleSetStage = (incr: number) => {
      const newStage = stage + incr;
  
      // increment stage
      if (incr > 0) {
        if (isTokenETHOrWETH(tokenAddress) && newStage === 2) {
          setStage(3);
        } else setStage(newStage);
      }
  
      // decrement (previous page)
      else if (incr < 0) {
        if (isTokenETHOrWETH(tokenAddress) && newStage === 2) {
          setStage(1);
        } else setStage(newStage);
      }
    };
  
    const steps: string[] =
      activeOracle === "Rari_Default_Oracle" ||
      activeOracle === "Chainlink_Oracle"
        ? SimpleDeployment
        : activeOracle === "Uniswap_V3_Oracle"
        ? UniSwapV3DeploymentSimple
        : SimpleDeployment;
  
    const increaseActiveStep = (step: string) => {
      console.log("setting to: ", step);
      setActiveStep(steps.indexOf(step));
      console.log("done", steps.indexOf(step));
    };
    // Deploy Asset!
    const deploy = async () => {
      let oracleAddressToUse = oracleAddress;
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
  
      if (!isTokenETHOrWETH(tokenAddress)) {
        if (oracleAddress === "") {
          toast({
            title: "Error!",
            description: "Please choose a valid oracle for this asset",
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top-right",
          });
  
          return;
        }
      }
  
      setIsDeploying(true);
  
      const poolOracleContract = createOracle(
        poolOracleAddress,
        fuse,
        "MasterPriceOracle"
      );
  
      if (activeOracle === "Uniswap_V3_Oracle") {
        // If this oracle is set in the optional form (only if u have a univ3pair and the base token isnt in the oracle)
        // Then u have to deploy the base token )
  
        // Check for observation cardinality and fix if necessary
        console.log("Going into sdk to check cardinality");
        const shouldPrime = await fuse.checkCardinality(oracleAddress);
        console.log("Should increase?", shouldPrime);
  
        if (shouldPrime) {
          console.log("Into SDK to increase");
  
          increaseActiveStep("Increasing Uniswap V3 pair cardinality");
  
          await fuse.primeUniswapV3Oracle(oracleAddress, { from: address });
          console.log("Back from increase");
  
          increaseActiveStep("Deploying Uniswap V3 Twap Oracle");
        }
  
        if (!shouldPrime) {
          increaseActiveStep("Deploying Uniswap V3 Twap Oracle");
        }
  
        // Deploy oracle
        oracleAddressToUse = await fuse.deployPriceOracle(
          "UniswapV3TwapPriceOracleV2",
          { feeTier, baseToken: uniV3BaseToken },
          { from: address }
        );
      }
  
      increaseActiveStep("Configuring your Fuse pool's Master Price Oracle");
  
      if (activeOracle === "Uniswap_V2_Oracle") {
        // Deploy Oracle
        oracleAddressToUse = await fuse.deployPriceOracle(
          "UniswapTwapPriceOracleV2",
          { baseToken: uniV3BaseToken },
          { from: address }
        );
      }
  
      if (!isTokenETHOrWETH(tokenAddress)) {
        try {
          const tokenArray = shouldShowUniV3BaseTokenOracleForm
            ? [tokenAddress, uniV3BaseToken]
            : [tokenAddress];
          const oracleAddress = shouldShowUniV3BaseTokenOracleForm
            ? [oracleAddressToUse, uniV3BaseTokenOracle]
            : [oracleAddressToUse];
  
          await poolOracleContract.methods
            .add(tokenArray, oracleAddress)
            .send({ from: address });
          increaseActiveStep(
            "Configuring your Fuse pool to support new asset market"
          );
  
          toast({
            title: "You have successfully configured the oracle for this asset!",
            description:
              "Oracle will now point to the new selected address. Now, lets add you asset to the pool.",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top-right",
          });
        } catch (e) {
          handleGenericError(e, toast);
        }
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
  
      console.log({
        conf,
        bigCollateralFactor,
        bigReserveFactor,
        bigAdminFee,
        address,
      });
  
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
  
        increaseActiveStep("All Done!");
  
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
  
    // Update values on refetch!
    const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);
    useEffect(() => {
      if (cTokenData) {
        setIsBorrowPaused(cTokenData.isPaused);
        setAdminFee(cTokenData.adminFeeMantissa / 1e16);
        setReserveFactor(cTokenData.reserveFactorMantissa / 1e16);
        setInterestRateModel(cTokenData.interestRateModelAddress);
        setCollateralFactor(cTokenData.collateralFactorMantissa / 1e16);
      }
    }, [cTokenData]);
  
    const args = {
      mode,
      feeTier,
      adminFee,
      baseTokenActiveOracleName, 
      setBaseTokenActiveOracleName,
      tokenData,
      cTokenData,
      setFeeTier,
      oracleData,
      setAdminFee,
      oracleModel,
      tokenAddress,
      activeOracle,
      oracleAddress,
      cTokenAddress,
      reserveFactor,
      isBorrowPaused,
      uniV3BaseToken,
      collateralFactor,
      _setActiveOracle,
      setReserveFactor,
      poolOracleAddress,
      _setOracleAddress,
      interestRateModel,
      setUniV3BaseToken,
      comptrollerAddress,
      setCollateralFactor,
      setInterestRateModel,
      uniV3BaseTokenOracle,
      setUniV3BaseTokenOracle,
      shouldShowUniV3BaseTokenOracleForm,
      setOracleTouched,
      oracleTouched,
    };
  
    const OracleConfigArgs = {
      mode,
      feeTier,
      setFeeTier,
      oracleData,
      tokenAddress,
      activeOracle,
      oracleAddress,
      _setActiveOracle,
      _setOracleAddress,
      setUniV3BaseToken,
      poolOracleAddress,
      shouldShowUniV3BaseTokenOracleForm,
    };
  
    if (mode === "Editing") return <AssetConfig {...args} />;
  
    return (
      cTokenAddress ? cTokenData?.cTokenAddress === cTokenAddress : true
    ) ? (
      <Column
        d="flex"
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Title stage={stage}/>
        <RowOrColumn
          maxHeight="90%"
          isRow={!isMobile}
          crossAxisAlignment={stage < 3 ? "flex-start" : "center"}
          mainAxisAlignment={stage < 3 ? "flex-start" : "center"}
          height={isDeploying ? "65%" : "70%"}
          width="100%"
          overflowY="auto"
        >
          {stage < 3 ? (
            <>
              <Column
                width={
                  isMobile
                    ? "100%"
                    : shouldShowUniV3BaseTokenOracleForm || stage === 1 
                    ? "50%"
                    : "100%"
                }
                height="100%"
                d="flex"
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                alignItems="center"
                justifyContent="center"
              >
                <Screen1
                  stage={stage}
                  args={args}
                  OracleConfigArgs={OracleConfigArgs}
                  shouldShowUniV3BaseTokenOracleForm={
                    shouldShowUniV3BaseTokenOracleForm
                  }
                />
              </Column>
              <Column
                width={
                  isMobile
                    ? "100%"
                    : shouldShowUniV3BaseTokenOracleForm || stage === 1
                    ? "50%"
                    : "0%"
                }
                height="100%"
                d="flex"
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                alignItems="center"
                justifyContent="center"
                // bg="aqua"
              >
                <Fade
                  in={stage === 1 || shouldShowUniV3BaseTokenOracleForm}
                  unmountOnExit
                >
                  <Screen2
                    stage={stage}
                    mode={mode}
                    curves={curves}
                    oracleData={oracleData}
                    tokenData={tokenData}
                    uniV3BaseToken={uniV3BaseToken}
                    baseTokenAddress={uniV3BaseToken}
                    uniV3BaseTokenOracle={uniV3BaseTokenOracle}
                    setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
                    shouldShowUniV3BaseTokenOracleForm={
                      shouldShowUniV3BaseTokenOracleForm
                    }
                    interestRateModel={interestRateModel}
                    baseTokenActiveOracleName={baseTokenActiveOracleName}
                    setBaseTokenActiveOracleName={setBaseTokenActiveOracleName}
                  />
                </Fade>
              </Column>
            </>
          ) : (
                <Screen3 
                  curves={curves}
                  adminFee={adminFee}
                  tokenData={tokenData}
                  activeOracle={activeOracle}
                  reserveFactor={reserveFactor}
                  collateralFactor={collateralFactor}
                  interestRateModel={interestRateModel}
                  baseTokenActiveOracle={baseTokenActiveOracleName}
                  shouldShowUniV3BaseTokenOracleForm={shouldShowUniV3BaseTokenOracleForm}
                />
          )}
        </RowOrColumn>
        <DeployButton
          mode={mode}
          steps={steps}
          stage={stage}
          deploy={deploy}
          handleSetStage={handleSetStage}
          tokenData={tokenData}
          activeStep={activeStep}
          isDeploying={isDeploying}
          oracleAddress={oracleAddress}
          shouldShowUniV3BaseTokenOracleForm={shouldShowUniV3BaseTokenOracleForm}
          uniV3BaseTokenOracle ={uniV3BaseTokenOracle}
        />
      </Column>
    ) : (
      <Center expand>
        <Spinner my={8} />
      </Center>
    );
  };

export default AssetSettings

const Title = ({stage}: {stage: number}) => {
  return (
    <>
    <Fade in={stage === 1} unmountOnExit>
      <Heading> IRM Config </Heading>
    </Fade>
    <Fade in={stage === 2} unmountOnExit>
      <Heading> Oracle Config </Heading>
    </Fade>
    <Fade in={stage === 3} unmountOnExit>
      <Heading> Asset Config Summary </Heading>
    </Fade>
    </>
  )
}
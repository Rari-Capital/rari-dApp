// Chakra and UI
import { Heading, Spinner, useToast, Button } from "@chakra-ui/react";
import { Column, Center, RowOrColumn, Row } from "utils/chakraUtils";
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

type RETRY_FLAG = 1 | 2 | 3 | 4 | 5;

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
  oracleData?: OracleDataType; // Fuse pool's oracle contract, admin, overwriting permissions.
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
  const [baseTokenActiveOracleName, setBaseTokenActiveOracleName] =
    useState<string>("");
  const [uniV3BaseTokenHasOracle, setUniV3BaseTokenHasOracle] =
    useState<boolean>(false); // Will let us know if fuse pool's oracle has a price feed for the pair's base token.

  // This will be used to index whitelistPools array (fetched from the graph.)
  // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
  const [activeUniSwapPair, setActiveUniSwapPair] = useState<string>("");

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

  // If you choose a UniV3 Pool as the oracle, check if fuse pool's oracle has an oracle for uniV3BaseToken
  useEffect(() => {
    if (!!uniV3BaseToken && !isTokenETHOrWETH(uniV3BaseToken) && !!oracleData) {
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

  // Modal Pages
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

  // Transaction Stepper
  const [activeStep, setActiveStep] = useState<number>(0);

  // Retry Flag - start deploy function from here
  const [retryFlag, setRetryFlag] = useState<RETRY_FLAG>(1);
  const [needsRetry, setNeedsRetry] = useState<boolean>(false);

  // Set transaction steps based on type of Oracle deployed
  const steps: string[] =
    activeOracle === "Rari_Default_Oracle" ||
    activeOracle === "Chainlink_Oracle"
      ? SimpleDeployment
      : activeOracle === "Uniswap_V3_Oracle"
      ? UniSwapV3DeploymentSimple
      : SimpleDeployment;

  const increaseActiveStep = (step: string) => {
    setActiveStep(steps.indexOf(step));
  };

  const preDeployValidate = (oracleAddressToUse: string) => {
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

      throw new Error("You have already added this asset to this pool.");
    }

    // If you have not chosen an oracle
    if (!isTokenETHOrWETH(tokenAddress)) {
      if (oracleAddressToUse === "") {
        toast({
          title: "Error!",
          description: "Please choose a valid oracle for this asset",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });

        throw new Error("Please choose a valid oracle for this asset");
      }
    }
  };

  const checkUniV3Oracle = async () => {
    // If this oracle is set in the optional form (only if u have a univ3pair and the base token isnt in the oracle)
    // Then u have to deploy the base token )

    // Check for observation cardinality and fix if necessary
    const shouldPrime = await fuse.checkCardinality(oracleAddress);

    if (shouldPrime) {
      increaseActiveStep("Increasing Uniswap V3 pair cardinality");

      await fuse.primeUniswapV3Oracle(oracleAddress, { from: address });
    }
  };

  const deployUniV3Oracle = async () => {
    increaseActiveStep("Deploying Uniswap V3 Twap Oracle");

    // Deploy UniV3 oracle
    const oracleAddressToUse = await fuse.deployPriceOracle(
      "UniswapV3TwapPriceOracleV2",
      { feeTier, baseToken: uniV3BaseToken },
      { from: address }
    );

    return oracleAddressToUse;
  };

  // Deploy Oracle
  const deployUniV2Oracle = async () =>
    await fuse.deployPriceOracle(
      "UniswapTwapPriceOracleV2",
      { baseToken: uniV3BaseToken },
      { from: address }
    );

  const addOraclesToMasterPriceOracle = async (oracleAddressToUse: string) => {
    /** Configure the pool's MasterPriceOracle  **/
    increaseActiveStep("Configuring your Fuse pool's Master Price Oracle");

    // Instantiate Fuse Pool's Oracle contract (Always "MasterPriceOracle")
    const poolOracleContract = createOracle(
      poolOracleAddress,
      fuse,
      "MasterPriceOracle"
    );

    const tokenArray = shouldShowUniV3BaseTokenOracleForm
      ? [tokenAddress, uniV3BaseToken] // univ3 only
      : [tokenAddress];
    const oracleAddress = shouldShowUniV3BaseTokenOracleForm
      ? [oracleAddressToUse, uniV3BaseTokenOracle] // univ3 only
      : [oracleAddressToUse];

    const hasOracles = await Promise.all(
      tokenArray.map(async (tokenAddr) => {
        const address: string = await poolOracleContract.methods
          .oracles(tokenAddr)
          .call();


        // if address  is EmptyAddress then there is no oracle for this token
        return !(address === "0x0000000000000000000000000000000000000000");
      })
    );

    //const mpoNeedsUpdating = hasOracles.some((x) => !x);

    if (hasOracles) {
      await poolOracleContract.methods
        .add(tokenArray, oracleAddress)
        .send({ from: address });

      toast({
        title: "You have successfully configured the oracle for this asset!",
        description:
          "Oracle will now point to the new selected address. Now, lets add you asset to the pool.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const deployAssetToPool = async () => {
    increaseActiveStep(
      "Configuring your Fuse pool to support new asset market"
    );

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
  };

  // Deploy Asset!
  const deploy = async () => {
    let oracleAddressToUse = oracleAddress;
    try {
      preDeployValidate(oracleAddressToUse);
    } catch (err) {
      return;
    }

    setIsDeploying(true);

    let _retryFlag = retryFlag;
    console.log({ _retryFlag, retryFlag });

    try {
      // It should be 1 if we haven't had to retry anything

      /** IF UNISWAP V3 ORACLE **/
      if (_retryFlag === 1) {
        setNeedsRetry(false);
        if (activeOracle === "Uniswap_V3_Oracle") {
          await checkUniV3Oracle();
        }
        _retryFlag = 2; // set it to two after we fall through step 1
      }

      /** IF UNISWAP V3 ORACLE **/
      if (_retryFlag === 2) {
        setNeedsRetry(false);
        if (activeOracle === "Uniswap_V3_Oracle") {
          oracleAddressToUse = await deployUniV3Oracle();
        }
        _retryFlag = 3;
      }

      /** IF UNISWAP V2 ORACLE **/
      if (_retryFlag === 3) {
        setNeedsRetry(false);
        if (activeOracle === "Uniswap_V2_Oracle") {
          oracleAddressToUse = await deployUniV2Oracle();
        }
        _retryFlag = 4;
      }

      /**  CONFIGURE MASTERPRICEORACLE **/
      // You only need to Configure an Oracle if your asset is not ETH / WETH
      if (_retryFlag === 4) {
        setNeedsRetry(false);
        if (!isTokenETHOrWETH(tokenAddress)) {
          console.log('hey')
          await addOraclesToMasterPriceOracle(oracleAddressToUse);
        }
        _retryFlag = 5;
      }

      /** DEPLOY ASSET  **/
      if (_retryFlag === 5) {
        setNeedsRetry(false);

        console.log("HELLO");
        await deployAssetToPool();
        console.log("GOODBYe");

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
      }

      closeModal();
    } catch (e) {
      handleGenericError(e, toast);
      setRetryFlag(_retryFlag);
      console.log({ _retryFlag });
      setNeedsRetry(true);
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
    setActiveUniSwapPair,
    setInterestRateModel,
    activeUniSwapPair,
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
    setActiveUniSwapPair,
    activeUniSwapPair,
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
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      height="100%"
      minHeight="100%"
    >
      <Column
        crossAxisAlignment={"flex-start"}
        mainAxisAlignment={"flex-start"}
        h="100%"
        w="100%"
        // bg="yellow"
      >
        <Row
          mainAxisAlignment={"center"}
          crossAxisAlignment={"flex-start"}
          w="100%"
          // bg="aqua"
        >
          <Title stage={stage} />
        </Row>
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
              shouldShowUniV3BaseTokenOracleForm={
                shouldShowUniV3BaseTokenOracleForm
              }
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
          shouldShowUniV3BaseTokenOracleForm={
            shouldShowUniV3BaseTokenOracleForm
          }
          uniV3BaseTokenOracle={uniV3BaseTokenOracle}
          needsRetry={needsRetry}
        />
        {/* {needsRetry && <Button onClick={deploy}>Retry</Button>} */}
      </Column>
    </Column>
  ) : (
    <Center expand>
      <Spinner my={8} />
    </Center>
  );
};

export default AssetSettings;

const Title = ({ stage }: { stage: number }) => {
  return (
    <>
      <Fade in={stage === 1} unmountOnExit>
        <Heading size="lg"> Configure Interest Rate Model </Heading>
      </Fade>
      <Fade in={stage === 2} unmountOnExit>
        <Heading> Configure Oracle </Heading>
      </Fade>
      <Fade in={stage === 3} unmountOnExit>
        <Heading> Asset Config Summary </Heading>
      </Fade>
    </>
  );
};

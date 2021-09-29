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
  Circle,
} from "@chakra-ui/react";
import { Column, Center, Row } from "utils/chakraUtils";
import DashboardBox, {
  DASHBOARD_BOX_PROPS,
} from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { SliderWithLabel } from "../../../shared/SliderWithLabel";
import {
  ConfigRow,
  SaveButton,
  testForComptrollerErrorAndSend,
} from "../FusePoolEditPage";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../shared/SimpleTooltip";
import { Fade, ScaleFade, Slide, SlideFade } from "@chakra-ui/react";

// Components
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
import {
  ETH_TOKEN_DATA,
  TokenData,
  useTokenData,
} from "../../../../hooks/useTokenData";
import { convertIRMtoCurve } from "../FusePoolInfoPage";
import {
  useOracleData,
  useGetOracleOptions,
  useSushiOrUniswapV2Pairs,
  OracleDataType,
} from "hooks/fuse/useOracleData";
import { createOracle } from "../../../../utils/createComptroller";

// Utils
import { FuseIRMDemoChartOptions } from "../../../../utils/chartOptions";
import { handleGenericError } from "../../../../utils/errorHandling";
import { USDPricedFuseAsset } from "../../../../utils/fetchFusePoolData";
import { createComptroller } from "../../../../utils/createComptroller";
import { testForCTokenErrorAndSend } from "./PoolModal/AmountSelect";
import { smallUsdFormatter, shortUsdFormatter } from "utils/bigUtils";

// Libraries
import Chart from "react-apexcharts";
import BigNumber from "bignumber.js";
import LogRocket from "logrocket";

const formatPercentage = (value: number) => value.toFixed(0) + "%";

const ETH_AND_WETH = [
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "0x0000000000000000000000000000000000000000",
];
const isTokenETHOrWETH = (tokenAddress: string) =>
  ETH_AND_WETH.includes(tokenAddress.toLowerCase());

type EditMode = "Editing" | "Adding";

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

const useIRMCurves = ({
  interestRateModel,
  adminFee,
  reserveFactor,
}: {
  interestRateModel: any;
  adminFee: any;
  reserveFactor: any;
}) => {
  const { fuse } = useRari();

  // Get IRM curves
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

  return curves;
};

// This component will handle deployment,
// Also conditional rendering. Either Editing or Deploying and asset
export const AssetSettings = ({
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
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const queryClient = useQueryClient();

  // Component state
  const [isDeploying, setIsDeploying] = useState(false);

  // Asset's general configurations.
  const [adminFee, setAdminFee] = useState(0);
  const [reserveFactor, setReserveFactor] = useState(10);
  const [isBorrowPaused, setIsBorrowPaused] = useState(false);
  const [collateralFactor, setCollateralFactor] = useState(50);
  const [oracleAddress, _setOracleAddress] = useState<string>("");

  const [interestRateModel, setInterestRateModel] = useState(
    Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
      .JumpRateModel_Cream_Stables_Majors
  );

  const curves = useIRMCurves({ interestRateModel, adminFee, reserveFactor });

  // Asset's Oracle Configuration
  const [activeOracle, _setActiveOracle] = useState<string>(""); // Will store the oracle's model selected for this asset. i.e. Rari Master Price Oracle, Custome Oracle, etc.

  // Uniswap V3 base token oracle config - these following lines are used only
  // if you choose Uniswap V3 Twap Oracle as the asset's oracle.
  const [feeTier, setFeeTier] = useState<number>(0);
  const [uniV3BaseToken, setUniV3BaseToken] = useState<string>(""); // This will store the pair's base token.
  const [uniV3BaseTokenOracle, setUniV3BaseTokenOracle] = useState<string>(""); // This will store the oracle chosen for the univ3BaseToken.
  const [uniV3BaseTokenHasOracle, setUniV3BaseTokenHasOracle] =
    useState<boolean>(false); // Will let us know if fuse pool's oracle has a price feed for the pair's base token.

  // If univ3Basetoken doesn't have an oracle in the fuse pool's oracle, then show the form
  // Or if the baseToken is weth then dont show form because we already have a hardcoded oracle for it
  const shouldShowUniV3BaseTokenOracleForm = useMemo(
    () =>
      !!uniV3BaseToken &&
      !uniV3BaseTokenHasOracle &&
      (activeOracle === "Uniswap_V3_Oracle" ||
        activeOracle === "Uniswap_V2_Oracle" ||
        activeOracle === "SushiSwap_Oracle"),
    [uniV3BaseTokenHasOracle, uniV3BaseToken, activeOracle]
  );

  useEffect(() => {
    if (!!uniV3BaseToken) {
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

  const steps =
    activeOracle === "Rari_Default_Oracle" ||
    activeOracle === "Chainlink_Oracle"
      ? SimpleDeployment
      : activeOracle === "Uniswap_V3_Oracle"
      ? UniSwapV3DeploymentSimple
      : SimpleDeployment;

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
      await fuse.primeUniswapV3Oracle(oracleAddress, { from: address });

      // Deploy oracle
      oracleAddressToUse = await fuse.deployPriceOracle(
        "UniswapV3TwapPriceOracleV2",
        { feeTier, baseToken: uniV3BaseToken },
        { from: address }
      );
    }

    if (activeOracle === "Uniswap_V2_Oracle") {
      // Deploy Oracle
      oracleAddressToUse = await fuse.deployPriceOracle(
        "UniswapTwapPriceOracleV2",
        { baseToken: uniV3BaseToken },
        { from: address }
      );
    }

    console.log({
      tokenAddress,
      uniV3BaseToken,
      oracleAddressToUse,
      uniV3BaseTokenOracle,
    });
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
    <>
      <Box
        d="flex"
        maxHeight="90%"
        flexDirection="row"
        alignItems={stage < 3 ? "flex-start" : "center"}
        justifyContent={stage < 3 ? undefined : "center"}
        height={isDeploying ? "65%" : "90%"}
      >
        {stage < 3 ? (
          <>
            <Screen1
              stage={stage}
              args={args}
              OracleConfigArgs={OracleConfigArgs}
            />
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
            />
          </>
        ) : (
          <h1>hello</h1>
        )}
      </Box>
      <DeployButton
        mode={mode}
        steps={steps}
        stage={stage}
        deploy={deploy}
        setStage={setStage}
        tokenData={tokenData}
        activeStep={activeStep}
        isDeploying={isDeploying}
        activeOracle={activeOracle}
        setActiveStep={setActiveStep}
      />
    </>
  ) : (
    <Center expand>
      <Spinner my={8} />
    </Center>
  );
};

const Screen1 = ({
  stage,
  args,
  OracleConfigArgs,
}: {
  stage: number;
  args: any;
  OracleConfigArgs: any;
}) => {
  console.log({ stage });
  return (
    <>
      <Column
        mainAxisAlignment={stage === 1 ? "flex-start" : "flex-start"}
        crossAxisAlignment={stage === 1 ? "flex-start" : "flex-start"}
        overflowY="scroll"
        maxHeight="100%"
        height="95%"
        width="50%"
        maxWidth="50%"
        p={3}
      >
        <Fade in={stage === 1} unmountOnExit>
          <AssetConfig {...args} />
        </Fade>

        <Fade in={stage === 2} unmountOnExit>
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            p={3}
          >
            <Heading> Oracle Config </Heading>
            <h2>Oracle Config help description</h2>
            <OracleConfig {...OracleConfigArgs} />
          </Column>
        </Fade>
      </Column>
    </>
  );
};

const Screen2 = ({
  stage,
  // OracleConfigArgs,
  mode,
  curves,
  tokenData,
  oracleData,
  uniV3BaseToken,
  baseTokenAddress,
  uniV3BaseTokenOracle,
  setUniV3BaseTokenOracle,
  shouldShowUniV3BaseTokenOracleForm,
}: {
  stage: number;
  // OracleConfigArgs: any;
  mode: "Editing" | "Adding";
  curves: any;
  tokenData: TokenData;
  oracleData: any;
  uniV3BaseToken: string;
  baseTokenAddress: string;
  uniV3BaseTokenOracle: string;
  setUniV3BaseTokenOracle: any;
  shouldShowUniV3BaseTokenOracleForm: boolean;
}) => {
  return (
    <Column
      mainAxisAlignment={stage === 2 ? "flex-start" : "center"}
      crossAxisAlignment={stage === 2 ? "flex-start" : "center"}
      overflowY="scroll"
      maxHeight="100%"
      height="95%"
      width="50%"
      maxWidth="50%"
    >
      <Fade in={stage === 1} unmountOnExit>
        {mode === "Adding" && (
          <Column
            w="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <IRMChart curves={curves} tokenData={tokenData} />
            <Text>name of IRM</Text>
          </Column>
        )}
      </Fade>
      <Fade in={stage === 2} unmountOnExit>
        {shouldShowUniV3BaseTokenOracleForm && mode == "Adding" && (
          <BaseTokenOracleConfig
            mode={mode}
            oracleData={oracleData}
            uniV3BaseToken={uniV3BaseToken}
            baseTokenAddress={uniV3BaseToken}
            uniV3BaseTokenOracle={uniV3BaseTokenOracle}
            setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
          />
        )}
      </Fade>
    </Column>
  );
};

const DeployButton = ({
  mode,
  steps,
  stage,
  deploy,
  setStage,
  tokenData,
  activeStep,
  isDeploying,
  activeOracle,
  setActiveStep,
}: {
  setActiveStep: any;
  activeOracle: any;
  isDeploying: any;
  activeStep: any;
  tokenData: any;
  setStage: any;
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
          setActiveStep={setActiveStep}
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
        {stage !== 1 && stage === 3 &&  (
          <Button
            width="45%"
            height="70px"
            fontSize="2xl"
            onClick={() => setStage(stage - 1)}
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
            onClick={() =>
              stage === "Confirm" ? deploy() : setStage(stage + 1)
            }
            fontWeight="bold"
            borderRadius="10px"
            disabled={isDeploying}
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
            width="100%"
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
            {isDeploying ? steps[activeStep].description : t("Confirm")}
          </Button>
        )}
      </Box>
    </>
  );
};

const AssetConfig = ({
  cTokenData,
  collateralFactor,
  setCollateralFactor,
  cTokenAddress,
  isBorrowPaused,
  adminFee,
  setAdminFee,
  oracleModel,
  oracleData,
  tokenAddress,
  mode,
  setFeeTier,
  activeOracle,
  oracleAddress,
  _setActiveOracle,
  feeTier,
  _setOracleAddress,
  setUniV3BaseToken,
  poolOracleAddress,
  shouldShowUniV3BaseTokenOracleForm,
  uniV3BaseToken,
  uniV3BaseTokenOracle,
  setUniV3BaseTokenOracle,
  setInterestRateModel,
  interestRateModel,
  tokenData,
  setReserveFactor,
  reserveFactor,
  comptrollerAddress,
}: {
  mode: any;
  feeTier: any;
  adminFee: any;
  tokenData: any;
  oracleData: any;
  cTokenData: any;
  setFeeTier: any;
  oracleModel: any;
  setAdminFee: any;
  tokenAddress: any;
  activeOracle: any;
  reserveFactor: any;
  oracleAddress: any;
  cTokenAddress: any;
  uniV3BaseToken: any;
  isBorrowPaused: any;
  collateralFactor: any;
  setReserveFactor: any;
  _setActiveOracle: any;
  interestRateModel: any;
  _setOracleAddress: any;
  setUniV3BaseToken: any;
  poolOracleAddress: any;
  comptrollerAddress: any;
  setCollateralFactor: any;
  uniV3BaseTokenOracle: any;
  setInterestRateModel: any;
  setUniV3BaseTokenOracle: any;
  shouldShowUniV3BaseTokenOracleForm: any;
}) => {
  const queryClient = useQueryClient();
  const { fuse, address } = useRari();
  const { t } = useTranslation();
  const toast = useToast();
  const curves = useIRMCurves({ interestRateModel, adminFee, reserveFactor });

  // Liquidation incentive. (This is configured at pool level)
  const liquidationIncentiveMantissa =
    useLiquidationIncentive(comptrollerAddress);

  const scaleCollateralFactor = (_collateralFactor: number) => {
    return _collateralFactor / 1e16;
  };

  const scaleReserveFactor = (_reserveFactor: number) => {
    return _reserveFactor / 1e16;
  };

  const scaleAdminFee = (_adminFee: number) => {
    return _adminFee / 1e16;
  };

  // Updates asset's Interest Rate Model.
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

  // Determines if users can borrow an asset or not.
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

  // Updates loan to Value ratio.
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

  // Updated portion of accrued reserves that goes into reserves.
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

  // Updates asset's admin fee.
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

  return (
    <>
      <Column
        width="100%"
        maxWidth="100%"
        height="100%"
        overflowY="auto"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
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

          {cTokenData !== undefined &&
          mode === "Editing" &&
          collateralFactor !==
            scaleCollateralFactor(cTokenData?.collateralFactorMantissa) ? (
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
                  100 -
                  (liquidationIncentiveMantissa.toString() / 1e16 - 100) -
                  5
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

        {oracleModel === "MasterPriceOracle" &&
          oracleData !== undefined &&
          !isTokenETHOrWETH(tokenAddress) &&
          mode === "Editing" && (
            <>
              <OracleConfig
                mode={mode}
                feeTier={feeTier}
                setFeeTier={setFeeTier}
                oracleData={oracleData}
                tokenAddress={tokenAddress}
                activeOracle={activeOracle}
                oracleAddress={oracleAddress}
                _setActiveOracle={_setActiveOracle}
                _setOracleAddress={_setOracleAddress}
                setUniV3BaseToken={setUniV3BaseToken}
                poolOracleAddress={poolOracleAddress}
                shouldShowUniV3BaseTokenOracleForm={
                  shouldShowUniV3BaseTokenOracleForm
                }
                uniV3BaseTokenOracle={uniV3BaseTokenOracle}
                setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
                uniV3BaseToken={uniV3BaseToken}
              />

              <ModalDivider />
            </>
          )}

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

        {mode === "Editing" && (
          <IRMChart curves={curves} tokenData={tokenData} />
        )}
      </Column>
    </>
  );
};

const OracleConfig = ({
  mode,
  feeTier,
  setFeeTier,
  oracleData,
  activeOracle,
  tokenAddress,
  oracleAddress,
  uniV3BaseToken,
  _setActiveOracle,
  _setOracleAddress,
  setUniV3BaseToken,
  poolOracleAddress,
  uniV3BaseTokenOracle,
  setUniV3BaseTokenOracle,
  shouldShowUniV3BaseTokenOracleForm,
}: {
  shouldShowUniV3BaseTokenOracleForm: any;
  uniV3BaseTokenOracle: any;
  setUniV3BaseTokenOracle: any;
  poolOracleAddress: string; // Fuse pool's oracle address.
  _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;
  setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;
  _setActiveOracle: React.Dispatch<React.SetStateAction<string>>;
  uniV3BaseToken: any;
  oracleAddress: string; // Address of the oracle that will be used for the asset.
  activeOracle: string; // Stores oracle option that has been chosen for the asset.
  tokenAddress: string; // Asset's address. i.e USDC, DAI.
  setFeeTier: React.Dispatch<React.SetStateAction<number>>;
  oracleData: any; // Stores Fuse pool's Oracle dat.
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

  // If user's editing the asset's properties, show master price oracle as a default.
  // Should run only once, when component is rendered
  useEffect(() => {
    if (
      mode === "Editing" &&
      activeOracle === "" &&
      options &&
      options["Master_Price_Oracle_Default"]
    )
      _setActiveOracle("Master_Price_Oracle_Default");
  }, [mode, activeOracle, options, _setActiveOracle]);

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
        await fuse.primeUniswapV3Oracle(oracleAddress, { from: address });

        // Deploy oracle
        oracleAddressToUse = await fuse.deployPriceOracle(
          "UniswapV3TwapPriceOracleV2",
          { uniswapV3Factory: oracleAddress, feeTier, baseToken: tokenAddress },
          { from: address }
        );
      }

      // Add oracle to Master Price Oracle
      await poolOracleContract.methods
        .add([tokenAddress], [oracleAddressToUse])
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
      _setActiveOracle("Master_Price_Oracle_Default");
      _setOracleAddress(options["Master_Price_Oracle_Default"]);
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
      <ConfigRow
        mainAxisAlignment="space-between"
        alignItems="center"
        crossAxisAlignment="center"
        width="100%"
      >
        <SimpleTooltip label={t("Choose the best price oracle for the asset.")}>
          <Text fontWeight="bold">
            {t("Price Oracle")} <QuestionIcon ml={1} mb="4px" />
          </Text>
        </SimpleTooltip>

        <Box
          width="100%"
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
            onChange={(event) => _setActiveOracle(event.target.value)}
            placeholder={
              activeOracle.length === 0
                ? t("Choose Oracle")
                : activeOracle.replaceAll("_", " ")
            }
            disabled={
              !isUserAdmin ||
              (!oracleData.adminOverwrite &&
                !options.Master_Price_Oracle_Default === null)
            }
          >
            {Object.entries(options).map(([key, value]) =>
              value !== null && value !== undefined ? (
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
        </Box>
      </ConfigRow>

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

      {shouldShowUniV3BaseTokenOracleForm && mode == "Editing" ? (
        <>
          <Row
            crossAxisAlignment="center"
            mainAxisAlignment="center"
            width="100%"
            my={2}
          >
            <Alert
              status="info"
              width="80%"
              height="50px"
              borderRadius={5}
              my={1}
            >
              <AlertIcon />
              <Text fontSize="sm" align="center" color="black">
                {
                  "This Uniswap V3 TWAP Oracle needs an oracle for the BaseToken."
                }
              </Text>
            </Alert>
          </Row>
          <BaseTokenOracleConfig
            mode={mode}
            oracleData={oracleData}
            uniV3BaseToken={uniV3BaseToken}
            baseTokenAddress={uniV3BaseToken}
            uniV3BaseTokenOracle={uniV3BaseTokenOracle}
            setUniV3BaseTokenOracle={setUniV3BaseTokenOracle}
          />
        </>
      ) : null}

      {activeOracle !== "Master_Price_Oracle_Default" && mode === "Editing" ? (
        <SaveButton
          ml={1}
          fontSize="xs"
          altText={t("Update")}
          onClick={updateOracle}
        />
      ) : null}
    </>
  );
};

const UniswapV3PriceOracleConfigurator = ({
  setFeeTier,
  tokenAddress,
  _setOracleAddress,
  setUniV3BaseToken,
}: {
  // Assets Address. i.e DAI, USDC
  tokenAddress: string;

  // Will update the oracle address that we use when adding, editing an asset
  _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;

  // Will update BaseToken address. This is used in component: AssetSettings (see top of this page).
  // Helps us know if oracle has a price feed for this asset. If it doesn't we need to add one.
  setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;

  // Will update FeeTier Only used to deploy Uniswap V3 Twap Oracle. It holds fee tier from Uniswap's token pair pool.
  setFeeTier: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation();

  // This will be used to index whitelistPools array (fetched from the graph.)
  // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
  const [activePool, setActivePool] = useState<string>("");

  // We get a list of whitelistedPools from uniswap-v3's the graph.
  const { data: liquidity, error } = useQuery(
    "UniswapV3 pool liquidity for " + tokenAddress,
    async () =>
      (
        await axios.post(
          "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
          {
            query: `{
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
        )
      ).data,
    { refetchOnMount: false }
  );

  // When user selects an option this function will be called.
  // Active pool, fee Tier, and base token are updated and we set the oracle address to the address of the pool we chose.
  const updateBoth = (value: string) => {
    const uniPool = liquidity.data.token.whitelistPools[value];

    setActivePool(value);
    setFeeTier(uniPool.feeTier);
    _setOracleAddress(uniPool.id);
    setUniV3BaseToken(
      uniPool.token0.id === tokenAddress ? uniPool.token1.id : uniPool.token0.id
    );
  };

  // If liquidity is undefined, theres an error or theres no token found return nothing.
  if (liquidity === undefined || error || liquidity.data.token === null)
    return null;

  // Sort whitelisted pools by TVL. Greatest to smallest. Greater TVL is safer for users so we show it first.
  const liquiditySorted = liquidity.data.token.whitelistPools.sort(
    (a: any, b: any): any =>
      parseInt(a.totalValueLockedUSD) > parseInt(b.totalValueLockedUSD) ? -1 : 1
  );

  return (
    <>
      <Row
        crossAxisAlignment="center"
        mainAxisAlignment="space-between"
        width="260px"
        my={2}
      >
        <SimpleTooltip
          label={t(
            "This field will determine which pool your oracle reads from. Its safer with more liquidity."
          )}
        >
          <Text fontWeight="bold">
            {t("Pool:")} <QuestionIcon ml={1} mb="4px" />
          </Text>
        </SimpleTooltip>
        <Select
          {...DASHBOARD_BOX_PROPS}
          ml={2}
          mb={2}
          width="180px"
          borderRadius="7px"
          value={activePool}
          _focus={{ outline: "none" }}
          placeholder={activePool.length === 0 ? t("Choose Pool") : activePool}
          onChange={(event) => {
            updateBoth(event.target.value);
          }}
        >
          {typeof liquidity !== undefined
            ? Object.entries(liquiditySorted).map(([key, value]: any[]) =>
                value.totalValueLockedUSD !== null &&
                value.totalValueLockedUSD !== undefined &&
                value.totalValueLockedUSD >= 100 ? (
                  <option
                    className="black-bg-option"
                    value={key}
                    key={value.id}
                  >
                    {`${value.token0.symbol} / ${
                      value.token1.symbol
                    } (${shortUsdFormatter(value.totalValueLockedUSD)})`}
                  </option>
                ) : null
              )
            : null}
        </Select>
      </Row>

      {activePool.length > 0 ? (
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
              {activePool !== ""
                ? smallUsdFormatter(
                    liquidity.data.token.whitelistPools[activePool]
                      .totalValueLockedUSD
                  )
                : null}
            </h1>
          </Row>
          <Row
            crossAxisAlignment="center"
            mainAxisAlignment="space-between"
            width="260px"
            my={4}
          >
            <SimpleTooltip
              label={t(
                "The fee percentage for the pool on Uniswap (0.05%, 0.3%, 1%)"
              )}
            >
              <Text fontWeight="bold">
                {t("Fee Tier:")} <QuestionIcon ml={1} mb="4px" />
              </Text>
            </SimpleTooltip>
            <Text>
              %
              {activePool !== ""
                ? liquidity.data.token.whitelistPools[activePool].feeTier /
                  10000
                : null}
            </Text>
          </Row>
          <Row
            crossAxisAlignment="center"
            mainAxisAlignment="center"
            width="260px"
            my={0}
          >
            <Link
              href={`https://info.uniswap.org/#/pools/${liquidity.data.token.whitelistPools[activePool].id}`}
              isExternal
            >
              Visit Pool in Uniswap
            </Link>
          </Row>
        </>
      ) : null}
    </>
  );
};

const UniswapV2OrSushiPriceOracleConfigurator = ({
  type,
  tokenAddress,
  _setOracleAddress,
  setUniV3BaseToken,
}: {
  // Asset's Address. i.e DAI, USDC
  tokenAddress: string;

  // Will update the oracle address that we use when adding, editing an asset
  _setOracleAddress: React.Dispatch<React.SetStateAction<string>>;

  // Will update BaseToken address. This is used in component: AssetSettings (see top of this page).
  // Helps us know if oracle has a price feed for this asset. If it doesn't we need to add one.
  setUniV3BaseToken: React.Dispatch<React.SetStateAction<string>>;

  // Either SushiSwap or Uniswap V2
  type: string;
}) => {
  const { t } = useTranslation();

  // This will be used to index whitelistPools array (fetched from the graph.)
  // It also helps us know if user has selected anything or not. If they have, detail fields are shown.
  const [activePool, setActivePair] = useState<string>("");

  // Checks if user has started the TWAP bot.
  const [checked, setChecked] = useState<boolean>(false);

  // Will store oracle response. This helps us know if its safe to add it to Master Price Oracle
  const [checkedStepTwo, setCheckedStepTwo] = useState<boolean>(false);

  // Get pair options from sushiswap and uniswap
  const { SushiPairs, SushiError, UniV2Pairs, univ2Error } =
    useSushiOrUniswapV2Pairs(tokenAddress);

  // This is where we conditionally store data depending on type.
  // Uniswap V2 or SushiSwap
  const Pairs = type === "UniswapV2" ? UniV2Pairs : SushiPairs;
  const Error = type === "UniswapV2" ? univ2Error : SushiError;

  // Will update active pair, set oracle address and base token.
  const updateInfo = (value: string) => {
    const pair = Pairs[value];
    setActivePair(value);
    _setOracleAddress(pair.id);
    setUniV3BaseToken(
      pair.token1.id === tokenAddress ? pair.token0.id : pair.token1.id
    );
  };

  // If pairs are still being fetched, if theres and error or if there are none, return nothing.
  if (Pairs === undefined || Error || Pairs === null) return null;

  return (
    <>
      <Row
        crossAxisAlignment="center"
        mainAxisAlignment="space-between"
        width="260px"
        my={3}
      >
        <Checkbox isChecked={checked} onChange={() => setChecked(!checked)}>
          <Text fontSize="xs" align="center">
            Using this type of oracle requires you to run a TWAP bot.
          </Text>
        </Checkbox>
      </Row>

      {checked ? (
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={3}
        >
          <Button colorScheme="teal">Check</Button>

          <Text fontSize="xs" align="center">
            After deploying your oracle, you have to wait about 15 - 25 minutes
            for the oracle to be set.
          </Text>
        </Row>
      ) : null}

      {true ? (
        <Row
          crossAxisAlignment="center"
          mainAxisAlignment="space-between"
          width="260px"
          my={2}
        >
          <SimpleTooltip
            label={t(
              "This field will determine which pool your oracle reads from. Its safer with more liquidity."
            )}
          >
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
            placeholder={
              activePool.length === 0 ? t("Choose Pool") : activePool
            }
            value={activePool}
            disabled={!checked}
            onChange={(event) => {
              updateInfo(event.target.value);
            }}
          >
            {typeof Pairs !== undefined
              ? Object.entries(Pairs).map(([key, value]: any[]) =>
                  value.totalSupply !== null &&
                  value.totalSupply !== undefined &&
                  value.totalSupply >= 100 ? (
                    <option
                      className="black-bg-option"
                      value={key}
                      key={value.id}
                    >
                      {`${value.token0.symbol} / ${
                        value.token1.symbol
                      } (${shortUsdFormatter(value.totalSupply)})`}
                    </option>
                  ) : null
                )
              : null}
          </Select>
        </Row>
      ) : null}

      {activePool.length > 0 ? (
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
            {activePool !== ""
              ? smallUsdFormatter(Pairs[activePool].totalSupply)
              : null}
          </h1>
        </Row>
      ) : null}
    </>
  );
};

const AddAssetModal = ({
  isOpen,
  poolID,
  onClose,
  poolName,
  oracleModel,
  existingAssets,
  poolOracleAddress,
  comptrollerAddress,
}: {
  comptrollerAddress: string; // Pool's comptroller address.
  poolOracleAddress: string; // Pool's oracle address.
  existingAssets: USDPricedFuseAsset[]; // List of exising assets in fuse pool.
  oracleModel: string | null; // Pool's oracle model name.
  poolName: string; // Used to name assets at deployment. i.e f-USDC-koan.
  poolID: string; // Fuse pool ID.
  isOpen: boolean; // Modal config.
  onClose: () => any; // Modal config.
}) => {
  const { t } = useTranslation();
  const { fuse } = useRari();

  // Will change with user's input
  const [tokenAddress, _setTokenAddress] = useState<string>("");

  // Get token data. i.e symbol, logo, etc.
  const tokenData = useTokenData(tokenAddress);

  // Get fuse pool's oracle data. i.e contract, admin, overwriting permissions
  const oracleData = useOracleData(poolOracleAddress, fuse);

  const isEmpty = tokenAddress.trim() === "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="slideInBottom"
      isCentered={isEmpty ? true : false}
    >
      <ModalOverlay />
      <ModalContent
        {...MODAL_PROPS}
        width="50%"
        height="85%"
        maxWidth="50%"
        maxHeight="85%"
        overflowY="hidden"
      >
        <Heading my={4} fontSize="27px" textAlign="center">
          {t("Add Asset")}
        </Heading>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          pb={4}
          maxHeight="90%"
          height="90%"
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

          {tokenData?.symbol && oracleData ? (
            <>
              <ModalDivider mt={4} />
              <Box
                height="75%"
                display="flex"
                maxHeight="75%"
                width="100%"
                flexDirection="column"
                justifyContent="flex-start"
              >
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
              </Box>
            </>
          ) : null}
        </Column>
      </ModalContent>
    </Modal>
  );
};

export default AddAssetModal;

const BaseTokenOracleConfig = ({
  mode,
  oracleData,
  uniV3BaseToken,
  baseTokenAddress,
  uniV3BaseTokenOracle,
  setUniV3BaseTokenOracle,
}: {
  setUniV3BaseTokenOracle: React.Dispatch<React.SetStateAction<string>>; // Sets oracle address for base token
  uniV3BaseTokenOracle: string; // Oracle address chosen for the base token
  baseTokenAddress: string; // Base token address.
  uniV3BaseToken: string; // Base token address.
  oracleData: any; // Fuse Pool's Oracle data. i.e contract, admin, overwrite permissions.
  mode: "Editing" | "Adding";
}) => {
  const { t } = useTranslation();

  const { fuse, address } = useRari();

  const isValidAddress = fuse.web3.utils.isAddress(uniV3BaseToken);
  const isUserAdmin = address === oracleData.admin;

  // Stores name of the oracle option we chose for the base token.
  // Will change on user input.
  const [activeOracleName, setActiveOracleName] = useState<string>("");

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
      activeOracleName === "" &&
      options &&
      options["Master_Price_Oracle_Default"]
    )
      setActiveOracleName("Master_Price_Oracle_Default");
  }, [mode, activeOracleName, options, setActiveOracleName]);

  // This will update the oracle address, after user chooses which options they want to use.
  // If option is Custom_Oracle oracle address is typed in by user, so we dont trigger this.
  useEffect(() => {
    if (!!activeOracleName && activeOracleName !== "Custom_Oracle" && options)
      setUniV3BaseTokenOracle(options[activeOracleName]);
  }, [activeOracleName, options, setUniV3BaseTokenOracle]);

  console.log({ options });

  return (
    <Box
      d="flex"
      alignContent="center"
      flexDirection="column"
      justifyContent="center"
    >
      <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
        <Alert my={1} width="80%" status="info" borderRadius={5}>
          <AlertIcon />
          <Text fontSize="sm" align="center" color="black">
            {"This Uniswap V3 TWAP Oracle needs an oracle for the BaseToken."}
          </Text>
        </Alert>
      </Row>
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
                  activeOracleName.length === 0
                    ? t("Choose Oracle")
                    : activeOracleName.replaceAll("_", " ")
                }
                value={activeOracleName.toLowerCase()}
                disabled={
                  !isUserAdmin ||
                  (!oracleData.adminOverwrite &&
                    !options.Master_Price_Oracle_Default === null)
                }
                onChange={(event) => setActiveOracleName(event.target.value)}
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

              {activeOracleName.length > 0 ? (
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
                  disabled={activeOracleName === "Custom_Oracle" ? false : true}
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

const SimpleDeployment = [
  { description: "Configuring Master Price Oracle" },
  { description: "Deploying Asset" },
];

const UniSwapV3DeploymentSimple = [
  { description: "Checking for pair's cardinality" },
  { description: "Increasing Uniswap V3 pair cardinality" },
  { description: "Configuring your Fuse pool's Master Price Oracle" },
  { description: "Configuring your Fuse pool to support new asset market" },
];

export const TransactionStepper = ({
  activeOracle,
  activeStep,
  setActiveStep,
  steps,
  tokenData,
}: {
  activeOracle: string;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  steps: { [key: string]: any }[];
  tokenData: any;
}): JSX.Element => {
  return (
    <Box
      width="100%"
      d="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Row
        width="100%"
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        my={4}
      >
        <Row
          mainAxisAlignment="space-around"
          crossAxisAlignment="center"
          width="90%"
          my={4}
        >
          {steps.map((step, index) => (
            <Circle
              size="50px"
              color="white"
              opacity={activeStep === index ? "1" : "0.7"}
              bg={activeStep > index ? "gray" : tokenData.color}
            >
              {activeStep === index ? <Spinner /> : index + 1}
            </Circle>
          ))}
        </Row>
      </Row>
    </Box>
  );
};

const IRMChart = ({
  curves,
  tokenData,
}: {
  curves: any;
  tokenData: TokenData;
}) => {
  const { t } = useTranslation();
  return (
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
  );
};

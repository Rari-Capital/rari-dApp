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
} from "@chakra-ui/react";
import { Column, Center } from "utils/chakraUtils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import DashboardBox, {
  DASHBOARD_BOX_PROPS,
} from "../../../shared/DashboardBox";
import { ModalDivider, MODAL_PROPS } from "../../../shared/Modal";

import {
  ETH_TOKEN_DATA,
  TokenData,
  useTokenData,
} from "../../../../hooks/useTokenData";
import SmallWhiteCircle from "../../../../static/small-white-circle.png";
import { useRari } from "../../../../context/RariContext";
import { FuseIRMDemoChartOptions } from "../../../../utils/chartOptions";
import { SliderWithLabel } from "../../../shared/SliderWithLabel";
import { convertIRMtoCurve } from "../FusePoolInfoPage";

import Fuse from "../../../../fuse-sdk";
import Chart from "react-apexcharts";
import {
  ConfigRow,
  SaveButton,
  testForComptrollerErrorAndSend,
} from "../FusePoolEditPage";
import { useQuery, useQueryClient } from "react-query";
import { QuestionIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "../../../shared/SimpleTooltip";
import BigNumber from "bignumber.js";
import { createComptroller } from "../../../../utils/createComptroller";
import { testForCTokenErrorAndSend } from "./PoolModal/AmountSelect";

import { handleGenericError } from "../../../../utils/errorHandling";
import { USDPricedFuseAsset } from "../../../../utils/fetchFusePoolData";
import LogRocket from "logrocket";

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
        admin,
        pendingAdmin,
        adminHasRights,
        { collateralFactorMantissa },
        isPaused,
      ] = await Promise.all([
        cToken.methods.adminFeeMantissa().call(),
        cToken.methods.reserveFactorMantissa().call(),
        cToken.methods.interestRateModel().call(),
        cToken.methods.admin().call(),
        cToken.methods.pendingAdmin().call(),
        cToken.methods.adminHasRights().call(),
        comptroller.methods.markets(cTokenAddress).call(),
        comptroller.methods.borrowGuardianPaused(cTokenAddress).call(),
      ]);

      return {
        reserveFactorMantissa,
        adminFeeMantissa,
        collateralFactorMantissa,
        interestRateModelAddress,
        admin,
        pendingAdmin,
        cTokenAddress,
        adminHasRights,
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
  cTokenAddress,
  existingAssets,
  closeModal,
}: {
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  tokenData: TokenData;

  // Only for editing mode
  cTokenAddress?: string;

  // Only for add asset modal
  existingAssets?: USDPricedFuseAsset[];
  closeModal: () => any;
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
    Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_Cream_Stables_Majors
  );

  const [admin, setAdmin] = useState(address);

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
      admin,
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
      setAdmin(cTokenData.admin);
      setInterestRateModel(cTokenData.interestRateModelAddress);
      setIsBorrowPaused(cTokenData.isPaused);
    }
  }, [cTokenData]);

  const togglePause = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setBorrowPaused(cTokenAddress, !isBorrowPaused),
        address,
        ""
      );

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

  const updateAdmin = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    if (!fuse.web3.utils.isAddress(admin)) {
      handleGenericError({ message: "This is not a valid address." }, toast);
      return;
    }

    try {
      await testForCTokenErrorAndSend(
        cToken.methods._setPendingAdmin(admin),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateAdmin");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const acceptAdmin = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    try {
      await testForCTokenErrorAndSend(
        cToken.methods._acceptAdmin(),
        address,
        ""
      );

      LogRocket.track("Fuse-AcceptAdmin");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const revokeRights = async () => {
    const cToken = createCToken(fuse, cTokenAddress!);

    try {
      await testForCTokenErrorAndSend(
        cToken.methods._renounceAdminRights(),
        address,
        ""
      );

      LogRocket.track("Fuse-RevokeRights");

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

      <ConfigRow height="35px">
        <SimpleTooltip
          label={t(
            "The admin address receives admin fees earned on this asset and if they have admin rights, they have the ability to update the parameters of the asset."
          )}
        >
          <Text fontWeight="bold">
            {t("Admin")} <QuestionIcon ml={1} mb="4px" />
          </Text>
        </SimpleTooltip>

        {cTokenData &&
        admin.toLowerCase() !== cTokenData.admin.toLowerCase() ? (
          <SaveButton ml={3} onClick={updateAdmin} />
        ) : cTokenData &&
          address.toLowerCase() === cTokenData.pendingAdmin.toLowerCase() ? (
          <SaveButton
            ml={3}
            onClick={acceptAdmin}
            fontSize="xs"
            altText={t("Become Admin")}
          />
        ) : cTokenData &&
          cTokenData.adminHasRights &&
          address.toLowerCase() === cTokenData.admin.toLowerCase() ? (
          <SaveButton
            ml={3}
            onClick={revokeRights}
            fontSize="xs"
            altText={t("Revoke Rights")}
          />
        ) : null}

        <Input
          isDisabled={
            cTokenData
              ? !cTokenData.adminHasRights ||
                cTokenData.admin.toLowerCase() !== address
              : false
          }
          ml="auto"
          width="320px"
          height="100%"
          textAlign="center"
          variant="filled"
          size="sm"
          value={admin}
          onChange={(event) => {
            const address = event.target.value;
            setAdmin(address);
          }}
          {...DASHBOARD_BOX_PROPS}
          _placeholder={{ color: "#e0e0e0" }}
          _focus={{ bg: "#121212" }}
          _hover={{ bg: "#282727" }}
          bg="#282727"
        />
      </ConfigRow>

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

const AddAssetModal = ({
  comptrollerAddress,
  poolName,
  poolID,
  isOpen,
  onClose,
  existingAssets,
}: {
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
  isOpen: boolean;
  onClose: () => any;
  existingAssets: USDPricedFuseAsset[];
}) => {
  const { t } = useTranslation();

  const [tokenAddress, _setTokenAddress] = useState<string>("");

  const tokenData = useTokenData(tokenAddress);

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
                comptrollerAddress={comptrollerAddress}
                tokenData={tokenData}
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

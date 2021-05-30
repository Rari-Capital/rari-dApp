import {
  AvatarGroup,
  Box,
  Heading,
  Text,
  Switch,
  useDisclosure,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Column, RowOrColumn, Center, Row } from "utils/chakraUtils";
import { memo, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";

import DashboardBox from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { SliderWithLabel } from "../../shared/SliderWithLabel";
import AddAssetModal, { AssetSettings } from "./Modals/AddAssetModal";
import { useFusePoolData } from "../../../hooks/useFusePoolData";
import { USDPricedFuseAsset } from "../../../utils/fetchFusePoolData";
import { CTokenIcon } from "./FusePoolsPage";
import { createComptroller } from "../../../utils/createComptroller";
import { useQueryClient, useQuery } from "react-query";
import { WhitelistInfo } from "./FusePoolCreatePage";

import { useExtraPoolInfo } from "./FusePoolInfoPage";
import BigNumber from "bignumber.js";
import { useTokenData } from "../../../hooks/useTokenData";
import LogRocket from "logrocket";
import { handleGenericError } from "../../../utils/errorHandling";
import { useAuthedCallback } from "../../../hooks/useAuthedCallback";

const activeStyle = { bg: "#FFF", color: "#000" };
const noop = () => {};

const formatPercentage = (value: number) => value.toFixed(0) + "%";

export enum ComptrollerErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  COMPTROLLER_MISMATCH,
  INSUFFICIENT_SHORTFALL,
  INSUFFICIENT_LIQUIDITY,
  INVALID_CLOSE_FACTOR,
  INVALID_COLLATERAL_FACTOR,
  INVALID_LIQUIDATION_INCENTIVE,
  MARKET_NOT_ENTERED, // no longer possible
  MARKET_NOT_LISTED,
  MARKET_ALREADY_LISTED,
  MATH_ERROR,
  NONZERO_BORROW_BALANCE,
  PRICE_ERROR,
  REJECTION,
  SNAPSHOT_ERROR,
  TOO_MANY_ASSETS,
  TOO_MUCH_REPAY,
  SUPPLIER_NOT_WHITELISTED,
  BORROW_BELOW_MIN,
  SUPPLY_ABOVE_MAX,
}

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(comptrollerAddress + " isUpgradeable", async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const isUpgradeable: boolean = await comptroller.methods
      .adminHasRights()
      .call();

    return isUpgradeable;
  });

  return data;
};

export async function testForComptrollerErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string
) {
  let response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
  if (response[0] !== "0") {
    const err = new Error(
      failMessage + " Code: " + ComptrollerErrorCodes[response]
    );

    LogRocket.captureException(err);
    throw err;
  }

  return txObject.send({ from: caller });
}

const FusePoolEditPage = memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openAddAssetModal);

  const { t } = useTranslation();

  const { poolId } = useParams();

  const data = useFusePoolData(poolId);

  return (
    <>
      {data ? (
        <AddAssetModal
          comptrollerAddress={data.comptroller}
          existingAssets={data.assets}
          poolName={data.name}
          poolID={poolId}
          isOpen={isAddAssetModalOpen}
          onClose={closeAddAssetModal}
        />
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1150px"}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar />

        <FuseTabBar />

        <RowOrColumn
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          isRow={!isMobile}
        >
          <DashboardBox
            width={isMobile ? "100%" : "50%"}
            height={isMobile ? "auto" : "440px"}
            mt={4}
          >
            {data ? (
              <PoolConfiguration
                assets={data.assets}
                comptrollerAddress={data.comptroller}
              />
            ) : (
              <Center expand>
                <Spinner my={8} />
              </Center>
            )}
          </DashboardBox>

          <Box pl={isMobile ? 0 : 4} width={isMobile ? "100%" : "50%"}>
            <DashboardBox
              width="100%"
              mt={4}
              height={isMobile ? "auto" : "440px"}
            >
              {data ? (
                data.assets.length > 0 ? (
                  <AssetConfiguration
                    openAddAssetModal={authedOpenModal}
                    assets={data.assets}
                    comptrollerAddress={data.comptroller}
                    poolID={poolId}
                    poolName={data.name}
                  />
                ) : (
                  <Column
                    expand
                    mainAxisAlignment="center"
                    crossAxisAlignment="center"
                    py={4}
                  >
                    <Text mb={4}>{t("There are no assets in this pool.")}</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={authedOpenModal}
                    />
                  </Column>
                )
              ) : (
                <Center expand>
                  <Spinner my={8} />
                </Center>
              )}
            </DashboardBox>
          </Box>
        </RowOrColumn>
      </Column>
    </>
  );
});

export default FusePoolEditPage;

const PoolConfiguration = ({
  assets,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();
  const { poolId } = useParams();

  const { fuse, address } = useRari();

  const queryClient = useQueryClient();
  const toast = useToast();

  const data = useExtraPoolInfo(comptrollerAddress);

  const changeWhitelistStatus = async (enforce: boolean) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistEnforcement(enforce),
        address,
        ""
      );

      LogRocket.track("Fuse-ChangeWhitelistStatus");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const addToWhitelist = async (newUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const newList = [...data!.whitelist, newUser];

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistStatuses(
          newList,
          Array(newList.length).fill(true)
        ),
        address,
        ""
      );

      LogRocket.track("Fuse-AddToWhitelist");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const removeFromWhitelist = async (removeUser: string) => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const whitelist = data!.whitelist;
    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setWhitelistStatuses(
          whitelist,
          whitelist.map((user) => user !== removeUser)
        ),
        address,
        ""
      );

      LogRocket.track("Fuse-RemoveFromWhitelist");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const renounceOwnership = async () => {
    const unitroller = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/Unitroller.sol:Unitroller"].abi
      ),
      comptrollerAddress
    );

    try {
      // TODO: Revoke admin rights on all the cTokens!
      await testForComptrollerErrorAndSend(
        unitroller.methods._renounceAdminRights(),
        address,
        ""
      );

      LogRocket.track("Fuse-RenounceOwnership");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

  const scaleCloseFactor = (_closeFactor: number) => {
    return _closeFactor / 1e16;
  };

  const scaleLiquidationIncentive = (_liquidationIncentive: number) => {
    return _liquidationIncentive / 1e16 - 100;
  };

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setCloseFactor(scaleCloseFactor(data.closeFactor));
      setLiquidationIncentive(
        scaleLiquidationIncentive(data.liquidationIncentive)
      );
    }
  }, [data]);

  const updateCloseFactor = async () => {
    // 50% -> 0.5 * 1e18
    const bigCloseFactor = new BigNumber(closeFactor)
      .dividedBy(100)
      .multipliedBy(1e18)
      .toFixed(0);

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setCloseFactor(bigCloseFactor),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateCloseFactor");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const updateLiquidationIncentive = async () => {
    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive = new BigNumber(liquidationIncentive)
      .dividedBy(100)
      .plus(1)
      .multipliedBy(1e18)
      .toFixed(0);

    const comptroller = createComptroller(comptrollerAddress, fuse);

    try {
      await testForComptrollerErrorAndSend(
        comptroller.methods._setLiquidationIncentive(bigLiquidationIncentive),
        address,
        ""
      );

      LogRocket.track("Fuse-UpdateLiquidationIncentive");

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="sm" px={4} py={4}>
        {t("Pool {{num}} Configuration", { num: poolId })}
      </Heading>

      <ModalDivider />

      {data ? (
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          width="100%"
          overflowY="auto"
        >
          <ConfigRow>
            <Text fontWeight="bold" mr={2}>
              {t("Assets:")}
            </Text>

            {assets.length > 0 ? (
              <>
                <AvatarGroup size="xs" max={30}>
                  {assets.map(({ underlyingToken, cToken }) => {
                    return (
                      <CTokenIcon key={cToken} address={underlyingToken} />
                    );
                  })}
                </AvatarGroup>

                <Text ml={2} flexShrink={0}>
                  {assets.map(({ underlyingSymbol }, index, array) => {
                    return (
                      underlyingSymbol +
                      (index !== array.length - 1 ? " / " : "")
                    );
                  })}
                </Text>
              </>
            ) : (
              <Text>{t("None")}</Text>
            )}
          </ConfigRow>

          <ModalDivider />

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
          >
            <ConfigRow>
              <Text fontWeight="bold">{t("Whitelist")}:</Text>

              <Switch
                ml="auto"
                h="20px"
                isDisabled={!data.upgradeable}
                isChecked={data.enforceWhitelist}
                onChange={() => {
                  changeWhitelistStatus(!data.enforceWhitelist);
                }}
                className="black-switch"
                colorScheme="#121212"
              />
            </ConfigRow>

            {data.enforceWhitelist ? (
              <WhitelistInfo
                whitelist={data.whitelist}
                addToWhitelist={addToWhitelist}
                removeFromWhitelist={removeFromWhitelist}
              />
            ) : null}

            <ModalDivider />

            <ConfigRow>
              <Text fontWeight="bold">{t("Upgradeable")}:</Text>

              {data.upgradeable ? (
                <DashboardBox
                  height="35px"
                  ml="auto"
                  as="button"
                  onClick={renounceOwnership}
                >
                  <Center expand px={2} fontWeight="bold">
                    {t("Renounce Ownership")}
                  </Center>
                </DashboardBox>
              ) : (
                <Text ml="auto" fontWeight="bold">
                  {t("Admin Rights Disabled")}
                </Text>
              )}
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t("Close Factor")}:</Text>

              {data && scaleCloseFactor(data.closeFactor) !== closeFactor ? (
                <SaveButton onClick={updateCloseFactor} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={closeFactor}
                setValue={setCloseFactor}
                formatValue={formatPercentage}
                min={5}
                max={90}
              />
            </ConfigRow>

            <ModalDivider />

            <ConfigRow height="35px">
              <Text fontWeight="bold">{t("Liquidation Incentive")}:</Text>

              {data &&
              scaleLiquidationIncentive(data.liquidationIncentive) !==
                liquidationIncentive ? (
                <SaveButton onClick={updateLiquidationIncentive} />
              ) : null}

              <SliderWithLabel
                ml="auto"
                value={liquidationIncentive}
                setValue={setLiquidationIncentive}
                formatValue={formatPercentage}
                min={0}
                max={50}
              />
            </ConfigRow>
          </Column>
        </Column>
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
  poolName,
  poolID,
}: {
  openAddAssetModal: () => any;
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
  poolName: string;
  poolID: string;
}) => {
  const isMobile = useIsSemiSmallScreen();

  const { t } = useTranslation();

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "440px"}
      width="100%"
      flexShrink={0}
    >
      <ConfigRow mainAxisAlignment="space-between">
        <Heading size="sm">{t("Assets Configuration")}</Heading>

        <AddAssetButton
          comptrollerAddress={comptrollerAddress}
          openAddAssetModal={openAddAssetModal}
        />
      </ConfigRow>

      <ModalDivider />

      <ConfigRow>
        <Text fontWeight="bold" mr={2}>
          {t("Assets:")}
        </Text>

        {assets.map((asset, index, array) => {
          return (
            <Box
              pr={index === array.length - 1 ? 4 : 2}
              key={asset.cToken}
              flexShrink={0}
            >
              <DashboardBox
                as="button"
                onClick={() => setSelectedAsset(asset)}
                {...(asset.cToken === selectedAsset.cToken
                  ? activeStyle
                  : noop)}
              >
                <Center expand px={4} py={1} fontWeight="bold">
                  {asset.underlyingSymbol}
                </Center>
              </DashboardBox>
            </Box>
          );
        })}
      </ConfigRow>

      <ModalDivider />

      <ColoredAssetSettings
        comptrollerAddress={comptrollerAddress}
        tokenAddress={selectedAsset.underlyingToken}
        cTokenAddress={selectedAsset.cToken}
        poolName={poolName}
        poolID={poolID}
      />
    </Column>
  );
};

const ColoredAssetSettings = ({
  tokenAddress,
  poolName,
  poolID,
  comptrollerAddress,
  cTokenAddress,
}: {
  tokenAddress: string;
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  cTokenAddress: string;
}) => {
  const tokenData = useTokenData(tokenAddress);

  return tokenData ? (
    <AssetSettings
      closeModal={noop}
      comptrollerAddress={comptrollerAddress}
      poolName={poolName}
      poolID={poolID}
      tokenData={tokenData}
      cTokenAddress={cTokenAddress}
    />
  ) : (
    <Center expand>
      <Spinner />
    </Center>
  );
};

export const SaveButton = ({
  onClick,
  ...others
}: {
  onClick: () => any;
  [key: string]: any;
}) => {
  const { t } = useTranslation();

  return (
    <DashboardBox
      flexShrink={0}
      ml={2}
      width="60px"
      height="35px"
      as="button"
      fontWeight="bold"
      onClick={onClick}
      {...others}
    >
      {t("Save")}
    </DashboardBox>
  );
};

const AddAssetButton = ({
  openAddAssetModal,
  comptrollerAddress,
}: {
  openAddAssetModal: () => any;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  const isUpgradeable = useIsUpgradeable(comptrollerAddress);

  return isUpgradeable ? (
    <DashboardBox
      onClick={openAddAssetModal}
      as="button"
      py={1}
      px={2}
      fontWeight="bold"
    >
      {t("Add Asset")}
    </DashboardBox>
  ) : null;
};

export const ConfigRow = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: any;
}) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
      overflowX="auto"
      flexShrink={0}
      {...others}
    >
      {children}
    </Row>
  );
};

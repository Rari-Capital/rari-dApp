import { Box, Center, Heading, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import DashboardBox from "components/shared/DashboardBox";
import { ModalDivider } from "components/shared/Modal";
import { useRari } from "context/RariContext";
import { OracleDataType, useOracleData } from "hooks/fuse/useOracleData";
import { useIsUpgradeable } from "hooks/useIsUpgradable";
import { useTokenData } from "hooks/useTokenData";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "utils/chakraUtils";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import { ConfigRow } from "../../FusePoolEditPage";
import AssetSettings from "../AddAssetModal/AssetSettings";

const activeStyle = { bg: "#FFF", color: "#000" };
const noop = () => {};  

const AssetConfiguration = ({
  openAddAssetModal,
  assets,
  comptrollerAddress,
  poolOracleAddress,
  oracleModel,
  poolName,
  poolID,
}: {
  openAddAssetModal: () => any;
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
  poolOracleAddress: string;
  oracleModel: string | undefined;
  poolName: string;
  poolID: string;
}) => {
  const { t } = useTranslation();
  const { fuse } = useRari();
  const oracleData = useOracleData(poolOracleAddress, fuse, oracleModel);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
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
        poolOracleAddress={poolOracleAddress}
        oracleModel={oracleModel}
        oracleData={oracleData}
      />
    </Column>
  );
};

export default AssetConfiguration;

export const AddAssetButton = ({
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

const ColoredAssetSettings = ({
  tokenAddress,
  poolName,
  poolID,
  comptrollerAddress,
  cTokenAddress,
  poolOracleAddress,
  oracleModel,
  oracleData,
}: {
  tokenAddress: string;
  poolName: string;
  poolID: string;
  comptrollerAddress: string;
  cTokenAddress: string;
  poolOracleAddress: string;
  oracleModel: string | undefined;
  oracleData: OracleDataType | undefined;
}) => {
  const tokenData = useTokenData(tokenAddress);

  return tokenData ? (
    <AssetSettings
      mode="Editing"
      tokenAddress={tokenAddress}
      poolOracleAddress={poolOracleAddress}
      oracleModel={oracleModel}
      oracleData={oracleData}
      closeModal={noop}
      comptrollerAddress={comptrollerAddress}
      poolName={poolName}
      poolID={poolID}
      tokenData={tokenData}
      cTokenAddress={cTokenAddress}
    />
  ) : (
    <Center expand>
      <Spinner my={8} />
    </Center>
  );
};

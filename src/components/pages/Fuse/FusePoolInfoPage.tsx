import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import {
  AvatarGroup,
  Box,
  Heading,
  Link,
  Select,
  Spinner,
  Text,
  useClipboard,
} from "@chakra-ui/react";

import {
  Column,
  RowOnDesktopColumnOnMobile,
  RowOrColumn,
  Center,
  Row,
  useIsMobile,
} from "lib/chakraUtils";

const AssetChart = dynamic(() => import("./AssetChart"), { ssr: false });
import { CTokenIcon } from "./FusePoolsPage/CTokenIcon";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import CaptionedStat from "components/shared/CaptionedStat";
import AppLink from "components/shared/AppLink";
import DashboardBox, { DASHBOARD_BOX_PROPS } from "components/shared/DashboardBox";
import { ModalDivider } from "components/shared/Modal";


// Hooks
import { useQuery } from "react-query";
import { useFusePoolData } from "hooks/useFusePoolData";
import { useTokenData } from "hooks/useTokenData";
import { useRari } from "context/RariContext";
import { useIsSemiSmallScreen } from "hooks/useIsSemiSmallScreen";
import { memo, useState } from "react";
import { useTranslation } from 'next-i18next';

// Utils
import Fuse from "lib/fuse-sdk";
import { shortAddress } from "utils/shortAddress";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import { createComptroller } from "utils/createComptroller";
import { shortUsdFormatter } from "utils/bigUtils";
import { FuseUtilizationChartOptions } from "utils/chartOptions";

export const useExtraPoolInfo = (comptrollerAddress: string) => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + " extraPoolInfo", async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const [
      { 0: admin, 1: upgradeable },
      oracle,
      closeFactor,
      liquidationIncentive,
      enforceWhitelist,
      whitelist,
    ] = await Promise.all([
      fuse.contracts.FusePoolLens.methods
        .getPoolOwnership(comptrollerAddress)
        .call({ gas: 1e18 }),

      fuse.getPriceOracle(await comptroller.methods.oracle().call()),

      comptroller.methods.closeFactorMantissa().call(),

      comptroller.methods.liquidationIncentiveMantissa().call(),

      (() => {
        try {
          comptroller.methods.enforceWhitelist().call();
        } catch (_) {
          return false;
        }
      })(),

      (() => {
        try {
          comptroller.methods.getWhitelist().call();
        } catch (_) {
          return [];
        }
      })(),
    ]);

    return {
      admin,
      upgradeable,
      enforceWhitelist,
      whitelist: whitelist as string[],
      isPowerfulAdmin:
        admin.toLowerCase() === address.toLowerCase() && upgradeable,
      oracle,
      closeFactor,
      liquidationIncentive,
    };
  });

  return data;
};

const FusePoolInfoPage = memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();
  const { t } = useTranslation();

  const router = useRouter();
  const poolId = router.query.poolId as string;

  const data = useFusePoolData(poolId);

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1150px"}
        height="100%"
        px={isMobile ? 4 : 0}
      >
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
            mt={4}
            height={isMobile ? "auto" : "450px"}
          >
            {data ? (
              <OracleAndInterestRates
                assets={data.assets}
                name={data.name}
                totalSuppliedUSD={data.totalSuppliedUSD}
                totalBorrowedUSD={data.totalBorrowedUSD}
                totalLiquidityUSD={data.totalLiquidityUSD}
                comptrollerAddress={data.comptroller}
              />
            ) : (
              <Center expand>
                <Spinner my={8} />
              </Center>
            )}
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            width={isMobile ? "100%" : "50%"}
            mt={4}
            height={isMobile ? "500px" : "450px"}
          >
            {data ? (
              data.assets.length > 0 ? (
                <AssetAndOtherInfo assets={data.assets} />
              ) : (
                <Center expand>{t("There are no assets in this pool.")}</Center>
              )
            ) : (
              <Center expand>
                <Spinner my={8} />
              </Center>
            )}
          </DashboardBox>
        </RowOrColumn>
      </Column>
    </>
  );
});

export default FusePoolInfoPage;

const OracleAndInterestRates = ({
  assets,
  name,
  totalSuppliedUSD,
  totalBorrowedUSD,
  totalLiquidityUSD,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  name: string;
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  totalLiquidityUSD: number;
  comptrollerAddress: string;
}) => {
  const router = useRouter();
  const poolId = router.query.poolId as string;

  const { t } = useTranslation();

  const data = useExtraPoolInfo(comptrollerAddress);
  const { hasCopied, onCopy } = useClipboard(data?.admin ?? "");

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      width="100%"
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        height="60px"
        flexShrink={0}
      >
        <Heading size="sm">
          {t("Pool {{num}} Info", { num: poolId, name })}
        </Heading>

        <Link
          className="no-underline"
          isExternal
          ml="auto"
          href={`https://rari.grafana.net/d/HChNahwGk/fuse-pool-details?orgId=1&refresh=10s&var-poolID=${poolId}`}
        >
          <DashboardBox height="35px">
            <Center expand px={2} fontWeight="bold">
              {t("Metrics")}
            </Center>
          </DashboardBox>
        </Link>

        {data?.isPowerfulAdmin ? (
          <AppLink className="no-underline" href="../edit" ml={2}>
            <DashboardBox height="35px">
              <Center expand px={2} fontWeight="bold">
                {t("Edit")}
              </Center>
            </DashboardBox>
          </AppLink>
        ) : null}
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        width="100%"
        my={4}
        px={4}
      >
        {assets.length > 0 ? (
          <>
            <AvatarGroup mt={1} size="xs" max={30}>
              {assets.map(({ underlyingToken, cToken }) => {
                return <CTokenIcon key={cToken} address={underlyingToken} />;
              })}
            </AvatarGroup>

            <Text mt={3} lineHeight={1} textAlign="center">
              {name} (
              {assets.map(({ underlyingSymbol }, index, array) => {
                return (
                  underlyingSymbol + (index !== array.length - 1 ? " / " : "")
                );
              })}
              )
            </Text>
          </>
        ) : (
          <Text>{name}</Text>
        )}
      </Column>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        my={5}
        px={4}
        width="100%"
      >
        <StatRow
          statATitle={t("Total Supplied")}
          statA={shortUsdFormatter(totalSuppliedUSD)}
          statBTitle={t("Total Borrowed")}
          statB={shortUsdFormatter(totalBorrowedUSD)}
        />

        <StatRow
          statATitle={t("Available Liquidity")}
          statA={shortUsdFormatter(totalLiquidityUSD)}
          statBTitle={t("Pool Utilization")}
          statB={
            totalSuppliedUSD.toString() === "0"
              ? "0%"
              : ((totalBorrowedUSD / totalSuppliedUSD) * 100).toFixed(2) + "%"
          }
        />

        <StatRow
          statATitle={t("Upgradeable")}
          statA={data ? (data.upgradeable ? "Yes" : "No") : "?"}
          statBTitle={
            hasCopied ? t("Admin (copied!)") : t("Admin (click to copy)")
          }
          statB={data?.admin ? shortAddress(data.admin) : "?"}
          onClick={onCopy}
        />

        <StatRow
          statATitle={t("Platform Fee")}
          statA={assets.length > 0 ? assets[0].fuseFee / 1e16 + "%" : "10%"}
          statBTitle={t("Average Admin Fee")}
          statB={
            assets
              .reduce(
                (a, b, _, { length }) => a + b.adminFee / 1e16 / length,
                0
              )
              .toFixed(1) + "%"
          }
        />

        <StatRow
          statATitle={t("Close Factor")}
          statA={data?.closeFactor ? data.closeFactor / 1e16 + "%" : "?%"}
          statBTitle={t("Liquidation Incentive")}
          statB={
            data?.liquidationIncentive
              ? data.liquidationIncentive / 1e16 - 100 + "%"
              : "?%"
          }
        />

        <StatRow
          statATitle={t("Oracle")}
          statA={data ? data.oracle ?? t("Unrecognized Oracle") : "?"}
          statBTitle={t("Whitelist")}
          statB={data ? (data.enforceWhitelist ? "Yes" : "No") : "?"}
        />
      </Column>
    </Column>
  );
};

const StatRow = ({
  statATitle,
  statA,
  statBTitle,
  statB,
  ...other
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
  [key: string]: any;
}) => {
  return (
    <RowOnDesktopColumnOnMobile
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      width="100%"
      mb={4}
      {...other}
    >
      <Text width="50%" textAlign="center">
        {statATitle}: <b>{statA}</b>
      </Text>

      <Text width="50%" textAlign="center">
        {statBTitle}: <b>{statB}</b>
      </Text>
    </RowOnDesktopColumnOnMobile>
  );
};

const AssetAndOtherInfo = ({ assets }: { assets: USDPricedFuseAsset[] }) => {
  const router = useRouter();
  const poolId = router.query.poolId as string;

  const { fuse } = useRari();

  const { t } = useTranslation();

  const [selectedAsset, setSelectedAsset] = useState(
    assets.length > 3 ? assets[2] : assets[0]
  );
  const selectedTokenData = useTokenData(selectedAsset.underlyingToken);
  const selectedAssetUtilization =
    // @ts-ignore
    selectedAsset.totalSupply === "0"
      ? 0
      : parseFloat(
          // Use Max.min() to cap util at 100%
          Math.min(
            (selectedAsset.totalBorrow / selectedAsset.totalSupply) * 100,
            100
          ).toFixed(0)
        );

  const { data } = useQuery(selectedAsset.cToken + " curves", async () => {
    const interestRateModel = await fuse.getInterestRateModel(
      selectedAsset.cToken
    );

    if (interestRateModel === null) {
      return { borrowerRates: null, supplierRates: null };
    }

    return convertIRMtoCurve(interestRateModel, fuse);
  });

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      height="100%"
    >
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        height="60px"
        width="100%"
        px={4}
        flexShrink={0}
      >
        <Heading size="sm" py={3}>
          {t("Pool {{num}}'s {{token}} Stats", {
            num: poolId,
            token: selectedAsset.underlyingSymbol,
          })}
        </Heading>

        <Select
          {...DASHBOARD_BOX_PROPS}
          borderRadius="7px"
          fontWeight="bold"
          width="130px"
          _focus={{ outline: "none" }}
          color={selectedTokenData?.color ?? "#FFF"}
          onChange={(event) =>
            setSelectedAsset(
              assets.find((asset) => asset.cToken === event.target.value)!
            )
          }
          value={selectedAsset.cToken}
        >
          {assets.map((asset) => (
            <option
              className="black-bg-option"
              value={asset.cToken}
              key={asset.cToken}
            >
              {asset.underlyingSymbol}
            </option>
          ))}
        </Select>
      </Row>

      <ModalDivider />

      <Box
        height="200px"
        width="100%"
        color="#000000"
        overflow="hidden"
        px={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {data ? (
          data.supplierRates === null ? (
            <Center expand color="#FFFFFF">
              <Text>
                {t("No graph is available for this asset's interest curves.")}
              </Text>
            </Center>
          ) : (
            <AssetChart
              selectedAssetUtilization={selectedAssetUtilization}
              selectedTokenData={selectedTokenData}
              data={data}
            />
          )
        ) : (
          <Center expand color="#FFFFFF">
            <Spinner />
          </Center>
        )}
      </Box>

      <ModalDivider />

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        pt={4}
        px={4}
        pb={2}
      >
        <CaptionedStat
          stat={(selectedAsset.collateralFactor / 1e16).toFixed(0) + "%"}
          statSize="lg"
          captionSize="xs"
          caption={t("Collateral Factor")}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        <CaptionedStat
          stat={(selectedAsset.reserveFactor / 1e16).toFixed(0) + "%"}
          statSize="lg"
          captionSize="xs"
          caption={t("Reserve Factor")}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Row>

      <ModalDivider />

      <Row
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
        height="100%"
        width="100%"
        p={4}
        mt={3}
      >
        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalSupplyUSD)}
          statSize="lg"
          captionSize="xs"
          caption={t("Total Supplied")}
          crossAxisAlignment="center"
          captionFirst={true}
        />

        {isMobile ? null : (
          <CaptionedStat
            stat={
              selectedAsset.totalSupplyUSD.toString() === "0"
                ? "0%"
                : (
                    (selectedAsset.totalBorrowUSD /
                      selectedAsset.totalSupplyUSD) *
                    100
                  ).toFixed(0) + "%"
            }
            statSize="lg"
            captionSize="xs"
            caption={t("Utilization")}
            crossAxisAlignment="center"
            captionFirst={true}
          />
        )}

        <CaptionedStat
          stat={shortUsdFormatter(selectedAsset.totalBorrowUSD)}
          statSize="lg"
          captionSize="xs"
          caption={t("Total Borrowed")}
          crossAxisAlignment="center"
          captionFirst={true}
        />
      </Row>
    </Column>
  );
};

export const convertIRMtoCurve = (interestRateModel: any, fuse: Fuse) => {
  let borrowerRates = [];
  let supplierRates = [];
  for (var i = 0; i <= 100; i++) {
    const supplyLevel =
      (Math.pow(
        (interestRateModel.getSupplyRate(
          fuse.web3.utils.toBN((i * 1e16).toString())
        ) /
          1e18) *
          (4 * 60 * 24) +
          1,
        365
      ) -
        1) *
      100;

    const borrowLevel =
      (Math.pow(
        (interestRateModel.getBorrowRate(
          fuse.web3.utils.toBN((i * 1e16).toString())
        ) /
          1e18) *
          (4 * 60 * 24) +
          1,
        365
      ) -
        1) *
      100;

    supplierRates.push({ x: i, y: supplyLevel });
    borrowerRates.push({ x: i, y: borrowLevel });
  }

  return { borrowerRates, supplierRates };
};

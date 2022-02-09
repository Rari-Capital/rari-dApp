import {
  AvatarGroup,
  Box,
  Heading,
  Link,
  Select,
  Spinner,
  Text,
  useClipboard,
  VStack,
} from "@chakra-ui/react";
import {
  Column,
  RowOnDesktopColumnOnMobile,
  RowOrColumn,
  Center,
  Row,
  useIsMobile,
} from "utils/chakraUtils";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";
import { shortUsdFormatter } from "../../../utils/bigUtils";
import { FuseUtilizationChartOptions } from "../../../utils/chartOptions";

import DashboardBox, { DASHBOARD_BOX_PROPS } from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";
import { Link as RouterLink } from "react-router-dom";

import Chart from "react-apexcharts";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { useQuery } from "react-query";
import { useFusePoolData } from "../../../hooks/useFusePoolData";

import { ETH_TOKEN_DATA, useTokenData } from "hooks/useTokenData";
import { CTokenIcon } from "components/shared/CTokenIcon";
import { shortAddress } from "../../../utils/shortAddress";
import { USDPricedFuseAsset } from "../../../utils/fetchFusePoolData";
import {
  createComptroller,
  createOracle,
} from "../../../utils/createComptroller";
import Fuse from "../../../fuse-sdk";
import CaptionedStat from "../../shared/CaptionedStat";
import Footer from "components/shared/Footer";
import { useIdentifyOracle } from "hooks/fuse/useOracleData";
import { truncate } from "utils/stringUtils";
import { SimpleTooltip } from "components/shared/SimpleTooltip";

export const useExtraPoolInfo = (
  comptrollerAddress: string,
  oracleAddress: string
) => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + " extraPoolInfo", async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const poolOracle = createOracle(oracleAddress, fuse, "MasterPriceOracle");

    let defaultOracle = undefined;
    try {
      defaultOracle = await poolOracle.methods.defaultOracle().call();
    } catch (err) {
      console.error("Error querying for defaultOracle");
    }

    const [
      { 0: admin, 1: upgradeable },
      closeFactor,
      liquidationIncentive,
      enforceWhitelist,
      whitelist,
      adminHasRights,
      pendingAdmin,
    ] = await Promise.all([
      fuse.contracts.FusePoolLensSecondary.methods
        .getPoolOwnership(comptrollerAddress)
        .call({ gas: 1e18 }),

      comptroller.methods.closeFactorMantissa().call(),

      comptroller.methods.liquidationIncentiveMantissa().call(),

      (() => {
        try {
          return comptroller.methods.enforceWhitelist().call();
        } catch (e) {
          return false;
        }
      })(),

      (() => {
        try {
          return comptroller.methods.getWhitelist().call();
        } catch (_) {
          return [];
        }
      })(),

      comptroller.methods.adminHasRights().call(),
      comptroller.methods.pendingAdmin().call(),
    ]);

    return {
      admin,
      upgradeable,
      enforceWhitelist,
      whitelist: whitelist as string[],
      isPowerfulAdmin:
        admin.toLowerCase() === address.toLowerCase() && upgradeable,
      closeFactor,
      liquidationIncentive,
      adminHasRights,
      pendingAdmin,
      defaultOracle,
    };
  });

  return data;
};

const FusePoolInfoPage = memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();
  const { t } = useTranslation();
  let { poolId } = useParams();
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
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar data={data} />

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
                oracleAddress={data.oracle}
                oracleModel={data.oracleModel}
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
                <AssetAndOtherInfo
                  assets={data.assets}
                  poolOracle={data.oracle}
                />
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
        <Footer />
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
  oracleAddress,
  oracleModel,
}: {
  assets: USDPricedFuseAsset[];
  name: string;
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  totalLiquidityUSD: number;
  comptrollerAddress: string;
  oracleAddress: string;
  oracleModel: string | undefined;
}) => {
  let { poolId } = useParams();

  const { t } = useTranslation();

  const data = useExtraPoolInfo(comptrollerAddress, oracleAddress);
  const defaultOracleIdentity = useIdentifyOracle(data?.defaultOracle);

  console.log(data?.defaultOracle, { defaultOracleIdentity });

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
          href={`https://metrics.rari.capital/d/HChNahwGk/fuse-pool-details?orgId=1&refresh=10s&var-poolID=${poolId}`}
        >
          <DashboardBox height="35px">
            <Center expand px={2} fontWeight="bold">
              {t("Metrics")}
            </Center>
          </DashboardBox>
        </Link>

        {data?.isPowerfulAdmin ? (
          <Link
            /* @ts-ignore */
            as={RouterLink}
            className="no-underline"
            to="../edit"
            ml={2}
          >
            <DashboardBox height="35px">
              <Center expand px={2} fontWeight="bold">
                {t("Edit")}
              </Center>
            </DashboardBox>
          </Link>
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
          statA={
            data?.closeFactor
              ? (data.closeFactor / 1e16).toFixed(2) + "%"
              : "?%"
          }
          statBTitle={t("Liquidation Incentive")}
          statB={
            data?.liquidationIncentive
              ? data.liquidationIncentive / 1e16 - 100 + "%"
              : "?%"
          }
        />

        <StatRow
          statATitle={t("Oracle")}
          statA={data ? oracleModel ?? t("Unrecognized Oracle") : "?"}
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
  statBTitle?: string;
  statB?: string;
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

      {statBTitle && statB && (
        <Text width="50%" textAlign="center">
          {statBTitle}: <b>{statB}</b>
        </Text>
      )}
    </RowOnDesktopColumnOnMobile>
  );
};

const AssetAndOtherInfo = ({
  assets,
  poolOracle,
}: {
  assets: USDPricedFuseAsset[];
  poolOracle: string;
}) => {
  let { poolId } = useParams();

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

  const { data: curveData } = useQuery(
    selectedAsset.cToken + " curves",
    async () => {
      const interestRateModel = await fuse.getInterestRateModel(
        selectedAsset.cToken
      );

      if (interestRateModel === null) {
        return { borrowerRates: null, supplierRates: null };
      }

      const IRMidentity = await fuse.identifyInterestRateModelName(
        interestRateModel
      );

      const curve = convertIRMtoCurve(interestRateModel, fuse);

      return { curve, IRMidentity };
    }
  );

  const { curve: data, IRMidentity } = curveData ?? {};
  console.log({ data, IRMidentity });

  const isMobile = useIsMobile();

  const oracleIdentity = useIdentifyOracle(
    selectedAsset.oracle,
    selectedAsset.underlyingToken
  );

  // Link to MPO if asset is ETH
  const oracleAddress =
    selectedAsset.underlyingToken === ETH_TOKEN_DATA.address
      ? poolOracle
      : selectedAsset.oracle;

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
      // bg="red"
      >
        {data ? (
          data.supplierRates === null ? (
            <Center expand color="#FFFFFF">
              <Text>
                {t("No graph is available for this asset's interest curves.")}
              </Text>
            </Center>
          ) : (
            <>
              <Chart
                options={
                  {
                    ...FuseUtilizationChartOptions,
                    annotations: {
                      points: [
                        {
                          x: selectedAssetUtilization,
                          y: data.borrowerRates[selectedAssetUtilization].y,
                          marker: {
                            size: 6,
                            fillColor: "#FFF",
                            strokeColor: "#DDDCDC",
                          },
                        },
                        {
                          x: selectedAssetUtilization,
                          y: data.supplierRates[selectedAssetUtilization].y,
                          marker: {
                            size: 6,
                            fillColor: selectedTokenData?.color ?? "#A6A6A6",
                            strokeColor: "#FFF",
                          },
                        },
                      ],
                      xaxis: [
                        {
                          x: selectedAssetUtilization,
                          label: {
                            text: t("Current Utilization"),
                            orientation: "horizontal",
                            style: {
                              background: "#121212",
                              color: "#FFF",
                            },
                          },
                        },
                      ],
                    },

                    colors: ["#FFFFFF", selectedTokenData?.color ?? "#A6A6A6"],
                  } as any
                }
                type="line"
                width="100%"
                height="100%"
                series={[
                  {
                    name: "Borrow Rate",
                    data: data.borrowerRates,
                  },
                  {
                    name: "Deposit Rate",
                    data: data.supplierRates,
                  },
                ]}
              />
              <Text
                position="absolute"
                zIndex={4}
                top={4}
                left={4}
                color="white"
              >
                {" "}
                {IRMidentity?.replace("_", " ") ?? ""}
              </Text>
            </>
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

        <SimpleTooltip label={oracleIdentity}>
          <Link
            href={`https://etherscan.io/address/${oracleAddress}`}
            isExternal
            _hover={{ pointer: "cursor", color: "#21C35E" }}
          >
            <CaptionedStat
              stat={truncate(oracleIdentity, 20)}
              statSize="md"
              captionSize="xs"
              caption={t("Oracle")}
              crossAxisAlignment="center"
              captionFirst={true}
            />
          </Link>
        </SimpleTooltip>

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
          <SimpleTooltip label={`${selectedAsset.totalSupply} ${selectedAsset.underlyingSymbol}`}>
            <CaptionedStat
              stat={(selectedAsset.totalSupply / (10 ** selectedAsset.underlyingDecimals)).toFixed(2) + ` (${shortUsdFormatter(selectedAsset.totalSupplyUSD)})`}
              statSize="lg"
              captionSize="xs"
              caption={t("Total Supplied")}
              crossAxisAlignment="center"
              captionFirst={true}
            />
          </SimpleTooltip>

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
      <ModalDivider />
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

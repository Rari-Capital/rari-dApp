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
} from "buttered-chakra";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";
import { shortUsdFormatter } from "../../../utils/bigUtils";
import { FuseUtilizationChartOptions } from "../../../utils/chartOptions";

import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_PROPS } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";
import { Link as RouterLink } from "react-router-dom";

import Chart from "react-apexcharts";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { useQuery } from "react-query";
import { useFusePoolData } from "../../../hooks/useFusePoolData";

import { useTokenData } from "../../../hooks/useTokenData";
import { CTokenIcon } from "./FusePoolsPage";
import { shortAddress } from "../../../utils/shortAddress";
import { USDPricedFuseAsset } from "../../../utils/fetchFusePoolData";

const FusePoolInfoPage = React.memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();
  const { t } = useTranslation();
  let { poolId } = useParams();
  const data = useFusePoolData(poolId);

  return (
    <>
      <ForceAuthModal />

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
            height={isMobile ? "300px" : "450px"}
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

      <CopyrightSpacer forceShow />
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
  let { poolId } = useParams();

  const { t } = useTranslation();

  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + " extraPoolInfo", async () => {
    const comptroller = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
      ),
      comptrollerAddress
    );

    const {
      0: admin,
      1: upgradeable,
    } = await fuse.contracts.FusePoolLens.methods
      .getPoolOwnership(comptrollerAddress)
      .call();

    const oracle = await fuse.getPriceOracle(
      await comptroller.methods.oracle().call()
    );

    const closeFactor = await comptroller.methods.closeFactorMantissa().call();

    const liquidationIncentive = await comptroller.methods
      .liquidationIncentiveMantissa()
      .call();

    const enforceWhitelist = await comptroller.methods
      .enforceWhitelist()
      .call();

    return {
      admin,
      upgradeable,
      enforceWhitelist,
      isPowerfulAdmin:
        admin.toLowerCase() === address.toLowerCase() && upgradeable,
      oracle,
      closeFactor,
      liquidationIncentive,
    };
  });

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
        height="49px"
        flexShrink={0}
      >
        <Heading size="sm">
          {t("Pool {{num}} Info", { num: poolId, name })}
        </Heading>

        {data?.isPowerfulAdmin ? (
          <Link
            /* @ts-ignore */
            as={RouterLink}
            className="no-underline"
            to="../edit"
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
            <AvatarGroup size="xs" max={20}>
              {assets.map(({ underlyingToken, cToken }) => {
                return <CTokenIcon key={cToken} address={underlyingToken} />;
              })}
            </AvatarGroup>

            <Text mt={3} lineHeight={1}>
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
        mt={8}
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
          statBTitle={t("Average Utilization Factor")}
          statB={
            assets
              .reduce((a, b, _, { length }) => {
                // @ts-ignore
                return b.totalSupply === "0"
                  ? 0
                  : a + ((b.totalBorrow / b.totalSupply) * 100) / length;
              }, 0)
              .toFixed(0) + "%"
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
          statATitle={t("Fuse Interest Fee")}
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
  const isMobile = useIsSemiSmallScreen();

  let { poolId } = useParams();

  const { fuse, rari } = useRari();

  const { t } = useTranslation();

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const selectedTokenData = useTokenData(selectedAsset.underlyingToken);
  const selectedAssetUtilization =
    // @ts-ignore
    selectedAsset.totalSupply === "0"
      ? 0
      : parseFloat(
          (
            (selectedAsset.totalBorrow / selectedAsset.totalSupply) *
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

    let borrowerRates = [];
    let supplierRates = [];
    for (var i = 0; i <= 100; i++) {
      const borrowLevel =
        (interestRateModel.getBorrowRate(
          rari.web3.utils.toBN((i * 1e16).toString())
        ) *
          2372500) /
        1e16;

      const supplyLevel =
        (interestRateModel.getSupplyRate(
          rari.web3.utils.toBN((i * 1e16).toString())
        ) *
          2372500) /
        1e16;

      borrowerRates.push({ x: i, y: borrowLevel });
      supplierRates.push({ x: i, y: supplyLevel });
    }

    return { borrowerRates, supplierRates };
  });

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      height="100%"
    >
      <Heading size="sm" px={4} py={3}>
        {t("Pool {{num}}'s {{token}} Interest Rate Model", {
          num: poolId,
          token: selectedAsset.underlyingSymbol,
        })}
      </Heading>
      <ModalDivider />

      <Row
        mt={3}
        px={4}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        width="100%"
        fontWeight="bold"
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Text>{t("Utilization vs APY")}</Text>

          {isMobile ? null : (
            <>
              <Text fontSize="12px" fontWeight="normal" ml={4}>
                {t("{{factor}}% Collateral Factor", {
                  factor: selectedAsset.collateralFactor / 1e16,
                })}
              </Text>

              <Text fontSize="12px" fontWeight="normal" ml={3}>
                {t("{{factor}}% Reserve Factor", {
                  factor: selectedAsset.reserveFactor / 1e16,
                })}
              </Text>
            </>
          )}
        </Row>

        <Select
          {...DASHBOARD_BOX_PROPS}
          borderRadius="7px"
          fontWeight="bold"
          width="130px"
          _focus={{ outline: "none" }}
          color={selectedTokenData?.color ?? "#FFF"}
          onChange={(event) =>
            setSelectedAsset(assets[event.target.value as any])
          }
        >
          {assets.map((asset, index) => (
            <option className="black-bg-option" value={index} key={index}>
              {asset.underlyingSymbol}
            </option>
          ))}
        </Select>
      </Row>

      <Box
        height="100%"
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
      >
        {data ? (
          data.supplierRates === null ? (
            <Center expand color="#FFFFFF">
              <Text>
                {t("No graph is available for this asset's interest curves.")}
              </Text>
            </Center>
          ) : (
            <Chart
              options={{
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
              }}
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
          )
        ) : (
          <Center expand color="#FFFFFF">
            <Spinner />
          </Center>
        )}
      </Box>
    </Column>
  );
};

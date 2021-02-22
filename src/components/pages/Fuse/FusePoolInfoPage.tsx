import {
  Avatar,
  AvatarGroup,
  Box,
  Heading,
  Link,
  Select,
  Spinner,
  Text,
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
import DashboardBox, {
  DASHBOARD_BOX_PROPS,
  DASHBOARD_BOX_SPACING,
} from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";
import { Link as RouterLink } from "react-router-dom";

import Chart from "react-apexcharts";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { useQuery } from "react-query";
import { useFusePoolData } from "../../../hooks/useFusePoolData";
import { USDPricedFuseAsset } from "./FusePoolPage";
import { useTokenData } from "../../../hooks/useTokenData";

const FusePoolInfoPage = React.memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();

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
        px={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
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
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height={isMobile ? "auto" : "450px"}
          >
            {data ? (
              <OracleAndInterestRates />
            ) : (
              <Center expand>
                <Spinner my={8} />
              </Center>
            )}
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            width={isMobile ? "100%" : "50%"}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height={isMobile ? "auto" : "450px"}
          >
            {data ? (
              <AssetAndOtherInfo assets={data.assets} />
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

const OracleAndInterestRates = () => {
  let { poolId } = useParams();

  const { t } = useTranslation();

  const poolTokens = [
    {
      symbol: "UNI",
      icon:
        "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
    },

    {
      symbol: "SUSHI",
      icon:
        "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png?1606986688",
    },

    {
      symbol: "ZRX",
      icon:
        "https://assets.coingecko.com/coins/images/863/small/0x.png?1547034672",
    },

    {
      symbol: "1INCH",
      icon:
        "https://assets.coingecko.com/coins/images/13469/small/1inch-token.png?1608803028",
    },
  ];

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
      >
        <Heading size="sm">{t("Pool {{num}} Info", { num: poolId })}</Heading>

        <Link
          /* @ts-ignore */
          as={RouterLink}
          className="no-underline"
          to="../edit"
        >
          <DashboardBox height="35px">
            <Center expand px={2} fontWeight="bold">
              Edit
            </Center>
          </DashboardBox>
        </Link>
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        width="100%"
        my={4}
        px={4}
      >
        <AvatarGroup size="sm" max={5} pt={1}>
          {poolTokens.map(({ symbol, icon }) => {
            return (
              <Avatar
                key={symbol}
                bg="#FFF"
                borderWidth="1px"
                name={symbol}
                src={icon}
              />
            );
          })}
        </AvatarGroup>

        <Text mt={3} lineHeight={1}>
          {poolTokens.map(({ symbol }, index, array) => {
            return symbol + (index !== array.length - 1 ? " / " : "");
          })}
        </Text>
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
          statA={shortUsdFormatter(3400000)}
          statBTitle={t("Total Borrowed")}
          statB={shortUsdFormatter(1400000)}
        />

        <StatRow
          statATitle={t("# of Suppliers")}
          statA={shortUsdFormatter(1750).replace("$", "")}
          statBTitle={t("# of Borrowers")}
          statB={shortUsdFormatter(100).replace("$", "")}
        />

        <StatRow
          statATitle={t("Editable")}
          statA={t("Yes")}
          statBTitle={t("Edit Timelock")}
          statB={24 + " " + t("hours")}
        />

        <StatRow
          statATitle={t("Fees")}
          statA={"10% Fuse Interest Fee"}
          statBTitle={t("Access")}
          statB={t("Public")}
        />

        <Center width="100%" mt={8} mb={12}>
          <Text textAlign="center">
            {t("Oracles Used")}: <b>Chainlink + Uniswap TWAP</b>
          </Text>
        </Center>
      </Column>
    </Column>
  );
};

const StatRow = ({
  statATitle,
  statA,
  statBTitle,
  statB,
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
}) => {
  return (
    <RowOnDesktopColumnOnMobile
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      width="100%"
      mb={4}
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
  const selectedAssetUtilization = parseFloat(
    ((selectedAsset.totalBorrow / selectedAsset.totalSupply) * 100).toFixed(0)
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

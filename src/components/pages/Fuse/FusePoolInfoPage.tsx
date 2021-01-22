import {
  Avatar,
  AvatarGroup,
  Box,
  Heading,
  Link,
  Select,
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
import { InterestRateChartOptions } from "../../../utils/chartOptions";

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

const FusePoolInfoPage = React.memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();

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
            height="auto"
          >
            <OracleAndInterestRates />
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            width={isMobile ? "100%" : "50%"}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height="auto"
          >
            <AssetAndOtherInfo />
          </DashboardBox>
        </RowOrColumn>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolInfoPage;

const OracleAndInterestRates = () => {
  const isMobile = useIsSemiSmallScreen();

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
      height={isMobile ? "auto" : "450px"}
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
        <AvatarGroup size="sm" max={5}>
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

const AssetAndOtherInfo = () => {
  const isMobile = useIsSemiSmallScreen();

  let { poolId } = useParams();

  const { t } = useTranslation();

  const borrowCurve = Array.from({ length: 100 }, (_, i) => {
    let y = 0;

    if (i < 80) {
      y = i * 0.1;
    } else {
      y = 5 + i * 0.25;
    }

    return { x: i, y };
  });

  const depositCurve = Array.from({ length: 100 }, (_, i) => {
    let y = 0;

    if (i < 82) {
      y = i * 0.09;
    } else {
      y = 5 + i * 0.23;
    }

    return { x: i, y };
  });

  const [selectedAsset, setSelectedAsset] = useState("SUSHI");

  const assetColors: any = { SUSHI: "#DD2D44" };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "450px"}
      width="100%"
    >
      <Heading size="sm" px={4} py={3}>
        {t("Pool {{num}}'s {{token}} Interest Rate Model", {
          num: poolId,
          token: selectedAsset,
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
                  factor: 75,
                })}
              </Text>

              <Text fontSize="12px" fontWeight="normal" ml={3}>
                {t("{{factor}}% Reserve Factor", {
                  factor: 10,
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
          color={assetColors[selectedAsset] ?? "#FFF"}
        >
          <option className="black-bg-option" value="week">
            {selectedAsset}
          </option>
        </Select>
      </Row>

      <Box
        height={isMobile ? "300px" : "100%"}
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
      >
        <Chart
          options={{
            ...InterestRateChartOptions,
            annotations: {
              points: [
                {
                  x: 30,
                  y: 3,
                  marker: {
                    size: 8,
                  },

                  label: {
                    borderWidth: 0,
                    text: t("Current Utilization"),
                    style: {
                      background: "#121212",
                      color: "#FFF",
                    },
                  },
                },
              ],
            },

            colors: ["#FFFFFF", assetColors[selectedAsset] ?? "#282727"],
          }}
          type="line"
          width="100%"
          height="100%"
          series={[
            {
              name: "Borrow Rate",
              data: borrowCurve,
            },
            {
              name: "Deposit Rate",
              data: depositCurve,
            },
          ]}
        />
      </Box>
    </Column>
  );
};

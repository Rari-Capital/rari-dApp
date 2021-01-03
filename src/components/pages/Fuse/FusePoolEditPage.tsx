import {
  Avatar,
  AvatarGroup,
  Box,
  Heading,
  Select,
  Text,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import { Column, RowOrColumn, Center, Row } from "buttered-chakra";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";

import { InterestRateChartOptions } from "../../../utils/chartOptions";

import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, {
  DASHBOARD_BOX_PROPS,
  DASHBOARD_BOX_SPACING,
} from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import Chart from "react-apexcharts";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import { SliderWithLabel } from "../../shared/SliderWithLabel";
import AddAssetModal from "./Modals/AddAssetModal";
import AddToWhitelistModal from "./Modals/AddToWhitelistModal";

const activeStyle = { bg: "#FFF", color: "#000" };
const noop = {};

const formatPercentage = (value: number) => value.toFixed(0) + "%";

const FusePoolEditPage = React.memo(
  ({ isNewPool }: { isNewPool?: boolean }) => {
    const { isAuthed } = useRari();

    const isMobile = useIsSemiSmallScreen();

    const {
      isOpen: isAddAssetModalOpen,
      onOpen: openAddAssetModal,
      onClose: closeAddAssetModal,
    } = useDisclosure();

    const {
      isOpen: isAddToWhitelistModalOpen,
      onOpen: openAddToWhitelistModal,
      onClose: closeAddToWhitelistModal,
    } = useDisclosure();

    const { t } = useTranslation();

    return (
      <>
        <ForceAuthModal />

        <AddAssetModal
          isOpen={isAddAssetModalOpen}
          onClose={closeAddAssetModal}
        />

        <AddToWhitelistModal
          isOpen={isAddToWhitelistModalOpen}
          onClose={closeAddToWhitelistModal}
        />

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
              <PoolConfiguration
                isNewPool={isNewPool}
                openAddToWhitelistModal={openAddToWhitelistModal}
              />
            </DashboardBox>

            <Box pl={isMobile ? 0 : 4} width={isMobile ? "100%" : "50%"}>
              <DashboardBox
                width="100%"
                mt={DASHBOARD_BOX_SPACING.asPxString()}
                height="auto"
              >
                <AssetConfiguration
                  isNewPool={isNewPool}
                  openAddAssetModal={openAddAssetModal}
                />
              </DashboardBox>
            </Box>
          </RowOrColumn>

          <DashboardBox
            width="100%"
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height="auto"
            fontSize="xl"
            py={3}
          >
            <Center expand fontWeight="bold">
              {isNewPool ? t("Create") : t("Apply")}
            </Center>
          </DashboardBox>
        </Column>

        <CopyrightSpacer forceShow />
      </>
    );
  }
);

export default FusePoolEditPage;

const PoolConfiguration = React.memo(
  ({
    isNewPool,
    openAddToWhitelistModal,
  }: {
    isNewPool?: boolean;
    openAddToWhitelistModal: () => any;
  }) => {
    const isMobile = useIsSemiSmallScreen();

    const { t } = useTranslation();

    const poolTokens = [
      {
        symbol: "SUSHI",
        icon:
          "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png?1606986688",
      },

      {
        symbol: "UNI",
        icon:
          "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
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

    const [interestFee, setInterestFee] = useState(10);

    return (
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        height={isMobile ? "auto" : "440px"}
      >
        <Heading size="sm" px={4} py={4}>
          {t("Pool Configuration")}
        </Heading>

        <ModalDivider />

        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          my={4}
          px={4}
          height="40px"
          overflowX="auto"
        >
          <Text fontWeight="bold" mr={2}>
            {t("Assets:")}
          </Text>

          <AvatarGroup color="#000" size="sm" max={5} mr={2}>
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

          <Text pr={2} lineHeight={1} whiteSpace="nowrap">
            {poolTokens.map(({ symbol }, index, array) => {
              return symbol + (index !== array.length - 1 ? " / " : "");
            })}
          </Text>
        </Row>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
        >
          <Row
            my={4}
            px={4}
            width="100%"
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
          >
            <Text fontWeight="bold">{t("Private")}:</Text>

            <Switch
              h="20px"
              className="black-switch"
              colorScheme="#121212"
              isChecked
            />
          </Row>

          <ModalDivider />

          <Row
            width="100%"
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            my={4}
            px={4}
          >
            <Text fontWeight="bold">{t("Whitelist")}:</Text>

            <DashboardBox
              height="35px"
              ml={2}
              as="button"
              onClick={openAddToWhitelistModal}
            >
              <Center expand px={2} fontWeight="bold">
                {t("Add Address")}
              </Center>
            </DashboardBox>
          </Row>

          <ModalDivider />

          <Row
            my={4}
            px={4}
            width="100%"
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
          >
            <Text fontWeight="bold">{t("Editable")}:</Text>

            <Switch h="20px" className="black-switch" colorScheme="whatsapp" />
          </Row>

          <ModalDivider />

          <Row
            width="100%"
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            my={4}
            px={4}
          >
            <Text fontWeight="bold">{t("Interest Fee")}:</Text>

            <SliderWithLabel
              value={interestFee}
              setValue={setInterestFee}
              formatValue={formatPercentage}
            />
          </Row>
        </Column>
      </Column>
    );
  }
);

const AssetConfiguration = React.memo(
  ({
    openAddAssetModal,
    isNewPool,
  }: {
    openAddAssetModal: () => any;
    isNewPool?: boolean;
  }) => {
    const isMobile = useIsSemiSmallScreen();

    let { poolId } = useParams();

    const { t } = useTranslation();

    const [selectedAsset, setSelectedAsset] = useState("SUSHI");

    const poolTokens = [
      {
        symbol: "SUSHI",
        icon:
          "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png?1606986688",
      },

      {
        symbol: "UNI",
        icon:
          "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
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

    const [collateralFactor, setCollateralFactor] = useState(75);
    const [reserveFactor, setReserveFactor] = useState(10);

    return (
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        height={isMobile ? "auto" : "440px"}
        width="100%"
        flexShrink={0}
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          height="55px"
          flexShrink={0}
        >
          <Heading size="sm" ml={4}>
            {t("Asset Configurations", { num: poolId })}
          </Heading>

          <DashboardBox
            mr={4}
            height="35px"
            width="110px"
            flexShrink={0}
            ml={2}
            as="button"
            onClick={openAddAssetModal}
          >
            <Center expand px={2} fontWeight="bold">
              {t("Add Asset")}
            </Center>
          </DashboardBox>
        </Row>

        <ModalDivider />

        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          py={3}
          px={4}
          overflowX="scroll"
          flexShrink={0}
        >
          <Text fontWeight="bold" mr={2}>
            {t("Assets:")}
          </Text>

          {poolTokens.map(({ symbol }) => {
            return (
              <Box pr={2} key={symbol}>
                <DashboardBox
                  as="button"
                  onClick={() => setSelectedAsset(symbol)}
                  {...(symbol === selectedAsset ? activeStyle : noop)}
                >
                  <Center expand px={4} py={1} fontWeight="bold">
                    {symbol}
                  </Center>
                </DashboardBox>
              </Box>
            );
          })}
        </Row>

        <AssetSettings
          collateralFactor={collateralFactor}
          setCollateralFactor={setCollateralFactor}
          reserveFactor={reserveFactor}
          setReserveFactor={setReserveFactor}
          selectedAsset={selectedAsset}
        />
      </Column>
    );
  }
);

export const AssetSettings = React.memo(
  ({
    collateralFactor,
    setCollateralFactor,
    reserveFactor,
    setReserveFactor,
    selectedAsset,
  }: {
    collateralFactor: number;
    setCollateralFactor: (value: number) => any;
    reserveFactor: number;
    setReserveFactor: (value: number) => any;
    selectedAsset: string;
  }) => {
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

    const assetColors: any = { SUSHI: "#DD2D44" };

    return (
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        overflowY="auto"
        width="100%"
        height="100%"
      >
        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          my={4}
          px={4}
        >
          <Text fontWeight="bold">{t("Collateral Factor")}:</Text>

          <SliderWithLabel
            value={collateralFactor}
            setValue={setCollateralFactor}
            formatValue={formatPercentage}
          />
        </Row>

        <ModalDivider />

        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          my={4}
          px={4}
        >
          <Text fontWeight="bold">{t("Reserve Factor")}:</Text>

          <SliderWithLabel
            value={reserveFactor}
            setValue={setReserveFactor}
            formatValue={formatPercentage}
          />
        </Row>

        <ModalDivider />

        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          my={4}
          px={4}
        >
          <Text fontWeight="bold">{t("Oracle")}:</Text>

          <Select
            {...DASHBOARD_BOX_PROPS}
            borderRadius="7px"
            fontWeight="bold"
            width="auto"
            _focus={{ outline: "none" }}
          >
            <option className="black-bg-option" value="chainlink">
              {t("Chainlink")}
            </option>
          </Select>
        </Row>

        <ModalDivider />

        <Row
          width="100%"
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          my={4}
          px={4}
        >
          <Text fontWeight="bold">{t("Interest Model")}:</Text>

          <Select
            {...DASHBOARD_BOX_PROPS}
            borderRadius="7px"
            fontWeight="bold"
            width="auto"
            _focus={{ outline: "none" }}
          >
            <option className="black-bg-option" value="dai">
              {t("Dai Interest Rate Model")}
            </option>
          </Select>
        </Row>

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
          <Chart
            options={{
              ...InterestRateChartOptions,
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
  }
);

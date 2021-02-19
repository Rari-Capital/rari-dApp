import {
  Avatar,
  Heading,
  Spinner,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Column, Center, Row, RowOrColumn } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
// import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";
import { useTokenData } from "../../../hooks/useTokenData";
import { shortUsdFormatter, smallUsdFormatter } from "../../../utils/bigUtils";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";
import { filterOnlyObjectProperties, FuseAsset } from "./FusePoolsPage";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import PoolModal from "./Modals/PoolModal";

export interface USDPricedFuseAsset extends FuseAsset {
  supplyUSD: number;
  borrowUSD: number;
}

const FusePoolPage = React.memo(() => {
  const { isAuthed, fuse, address, rari } = useRari();

  const isMobile = useIsSemiSmallScreen();

  let { poolId } = useParams();

  const { data } = useQuery(poolId + " poolData " + address, async () => {
    const comptroller = (
      await fuse.contracts.FusePoolDirectory.methods.pools(poolId).call()
    ).comptroller;

    let assets: USDPricedFuseAsset[] = (
      await fuse.contracts.FusePoolDirectory.methods
        .getPoolAssetsWithData(comptroller)
        .call({ from: address })
    ).map(filterOnlyObjectProperties);

    let totalSuppliedUSD = 0;
    let totalBorrowedUSD = 0;

    const ethPrice: number = rari.web3.utils.fromWei(
      await rari.getEthUsdPriceBN()
    ) as any;

    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      asset.supplyUSD =
        ((asset.supplyBalance * asset.underlyingPrice) /
          10 ** (asset.underlyingDecimals * 2)) *
        ethPrice;

      asset.borrowUSD =
        ((asset.borrowBalance * asset.underlyingPrice) /
          10 ** (asset.underlyingDecimals * 2)) *
        ethPrice;

      totalBorrowedUSD += asset.borrowUSD;
      totalSuppliedUSD += asset.supplyUSD;
    }

    return { assets, totalSuppliedUSD, totalBorrowedUSD };
  });

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
          crossAxisAlignment="center"
          isRow={!isMobile}
        >
          <DashboardBox
            width={isMobile ? "100%" : "50%"}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height={isMobile ? "auto" : "500px"}
          >
            {data ? (
              <SupplyList
                assets={data.assets}
                totalSuppliedUSD={data.totalSuppliedUSD}
              />
            ) : (
              <Center expand>
                <Spinner />
              </Center>
            )}
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            width={isMobile ? "100%" : "50%"}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height={isMobile ? "auto" : "500px"}
          >
            <BorrowList />
          </DashboardBox>
        </RowOrColumn>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolPage;

const SupplyList = ({
  assets,
  totalSuppliedUSD,
}: {
  assets: USDPricedFuseAsset[];
  totalSuppliedUSD: number;
}) => {
  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="md" px={4} py={3}>
        {t("Supply Balance:")} {smallUsdFormatter(totalSuppliedUSD)}
      </Heading>
      <ModalDivider />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="100%"
        px={4}
        mt={4}
      >
        <Text width="27%" fontWeight="bold" pl={1}>
          {t("Asset")}
        </Text>

        <Text width="27%" fontWeight="bold" textAlign="right">
          {t("Interest")}
        </Text>

        <Text width="27%" fontWeight="bold" textAlign="right">
          {t("Balance")}
        </Text>

        <Text width="20%" fontWeight="bold" textAlign="right">
          {t("Collateral")}
        </Text>
      </Row>

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        overflowY="auto"
        mt={1}
      >
        {assets.map((asset) => {
          return <AssetSupplyRow key={asset.underlyingToken} asset={asset} />;
        })}
      </Column>
    </Column>
  );
};

const AssetSupplyRow = ({ asset }: { asset: USDPricedFuseAsset }) => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const tokenData = useTokenData(asset.underlyingToken);

  const { t } = useTranslation();

  return (
    <>
      <PoolModal
        depositSide
        token={asset.underlyingToken}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        mb={3}
        as="button"
        onClick={openModal}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="27%"
        >
          <Avatar
            bg="#FFF"
            boxSize="37px"
            name={tokenData?.symbol ?? "Loading..."}
            src={
              tokenData?.logoURL ??
              "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
            }
          />
          <Text fontWeight="bold" fontSize="lg" ml={2}>
            {asset.underlyingSymbol}
          </Text>
        </Row>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
        >
          <Text
            color={tokenData?.color ?? "#FF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {((asset.supplyRatePerBlock * 2372500) / 1e16).toFixed(3)}%
          </Text>

          <Text fontSize="sm">{t("Supply APY")}</Text>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
        >
          <Text
            color={tokenData?.color ?? "#FFF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {smallUsdFormatter(asset.supplyUSD)}
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(
              asset.supplyBalance / 10 ** asset.underlyingDecimals
            ).replace("$", "")}{" "}
            {asset.underlyingSymbol}
          </Text>
        </Column>

        <Row
          width="20%"
          mainAxisAlignment="flex-end"
          crossAxisAlignment="center"
        >
          <style>
            {`
            
            .${
              asset.underlyingSymbol + "-switch"
            } > .chakra-switch__track[data-checked] {
              background-color: ${tokenData?.color ?? "#282727"} !important;
            }

            `}
          </style>
          <Switch
            isChecked={asset.membership}
            className={asset.underlyingSymbol + "-switch"}
            size="md"
            mt={1}
            mr={5}
          />
        </Row>
      </Row>
    </>
  );
};

const BorrowList = () => {
  const { t } = useTranslation();

  const isMobile = useIsSemiSmallScreen();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="md" px={4} py={3}>
        {t("Borrow Balance:")} {"$10,000"}
      </Heading>
      <ModalDivider />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="100%"
        px={4}
        mt={4}
      >
        <Text width="27%" fontWeight="bold" pl={1}>
          {t("Asset")}
        </Text>

        <Text width="27%" fontWeight="bold" textAlign="right">
          {t("APY/Accrued")}
        </Text>

        <Text width="27%" fontWeight="bold" textAlign="right">
          {t("Borrowed")}
        </Text>

        <Text width="20%" fontWeight="bold" textAlign="right">
          {t("Liquidity")}
        </Text>
      </Row>

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        overflowY="auto"
        mt={1}
      >
        <AssetBorrowRow
          symbol="RGT"
          icon="https://assets.coingecko.com/coins/images/12900/small/rgt_logo.png?1603340632"
          apy={15.2}
          accrued={0}
          borrowed={0}
          liquidity={12200000}
        />
        <AssetBorrowRow
          symbol="SFI"
          icon="https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144"
          color="#C34535"
          apy={90.2}
          accrued={30.2}
          borrowed={1500}
          liquidity={15423003}
        />
      </Column>
    </Column>
  );
};

const AssetBorrowRow = ({
  symbol,
  icon,
  apy,
  accrued,
  borrowed,
  liquidity,
  color,
}: {
  symbol: string;
  icon: string;
  apy: number;
  accrued: number;
  borrowed: number;
  liquidity: number;
  color?: string;
}) => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  return (
    <>
      <PoolModal
        depositSide={false}
        token={symbol}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        mb={3}
        as="button"
        onClick={openModal}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="27%"
        >
          <Avatar bg="#FFF" boxSize="37px" name="RGT" src={icon} />
          <Text fontWeight="bold" fontSize="lg" ml={2}>
            {symbol}
          </Text>
        </Row>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
        >
          <Text color={color ?? "#FFF"} fontWeight="bold" fontSize="17px">
            {apy}%
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(accrued).replace("$", "")} {symbol}
          </Text>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
        >
          <Text color={color ?? "#FFF"} fontWeight="bold" fontSize="17px">
            {smallUsdFormatter(borrowed * Math.random() * 10)}
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(borrowed).replace("$", "")} {symbol}
          </Text>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="20%"
        >
          <Text color={color ?? "#FFF"} fontWeight="bold" fontSize="17px">
            {shortUsdFormatter(liquidity * Math.random() * 10)}
          </Text>

          <Text fontSize="sm">
            {shortUsdFormatter(liquidity).replace("$", "")} {symbol}
          </Text>
        </Column>
      </Row>
    </>
  );
};

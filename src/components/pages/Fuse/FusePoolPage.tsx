import {
  Avatar,
  Heading,
  Progress,
  Spinner,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Column, Center, Row, RowOrColumn } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryCache } from "react-query";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useBorrowLimit } from "../../../hooks/useBorrowLimit";
import { useFusePoolData } from "../../../hooks/useFusePoolData";
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";
import { useTokenData } from "../../../hooks/useTokenData";
import { shortUsdFormatter, smallUsdFormatter } from "../../../utils/bigUtils";
import { createComptroller } from "../../../utils/createComptroller";
import { USDPricedFuseAsset } from "../../../utils/fetchFusePoolData";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";
import { SimpleTooltip } from "../../shared/SimpleTooltip";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import PoolModal, { Mode } from "./Modals/PoolModal";

const FusePoolPage = React.memo(() => {
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
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar />

        <FuseTabBar />

        {data?.totalBorrowBalanceUSD ? (
          <CollateralRatioBar
            assets={data.assets}
            borrowUSD={data.totalBorrowBalanceUSD}
          />
        ) : null}

        <RowOrColumn
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          mt={4}
          isRow={!isMobile}
        >
          <DashboardBox
            width={isMobile ? "100%" : "50%"}
            height={isMobile ? "auto" : "500px"}
          >
            {data ? (
              <SupplyList
                assets={data.assets}
                comptrollerAddress={data.comptroller}
                supplyBalanceUSD={data.totalSupplyBalanceUSD}
              />
            ) : (
              <Center height={!isMobile ? "100%" : "200px"}>
                <Spinner />
              </Center>
            )}
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            mt={isMobile ? 4 : 0}
            width={isMobile ? "100%" : "50%"}
            height={isMobile ? "auto" : "500px"}
          >
            {data ? (
              <BorrowList
                comptrollerAddress={data.comptroller}
                assets={data.assets}
                borrowBalanceUSD={data.totalBorrowBalanceUSD}
              />
            ) : (
              <Center height={!isMobile ? "100%" : "200px"}>
                <Spinner />
              </Center>
            )}
          </DashboardBox>
        </RowOrColumn>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolPage;

const CollateralRatioBar = ({
  assets,
  borrowUSD,
}: {
  assets: USDPricedFuseAsset[];
  borrowUSD: number;
}) => {
  const { t } = useTranslation();

  const maxBorrow = useBorrowLimit(assets);

  const ratio = (borrowUSD / maxBorrow) * 100;

  return (
    <DashboardBox width="100%" height="65px" mt={4} p={4}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" expand>
        <SimpleTooltip
          label={t("Keep this bar from filling up to avoid being liquidated!")}
        >
          <Text flexShrink={0} mr={4}>
            {t("Borrow Limit")}
          </Text>
        </SimpleTooltip>

        <Text flexShrink={0} mt="2px" mr={3} fontSize="10px">
          0%
        </Text>

        <Progress
          size="xs"
          width="100%"
          colorScheme={
            ratio <= 40
              ? "whatsapp"
              : ratio <= 60
              ? "yellow"
              : ratio <= 80
              ? "orange"
              : "red"
          }
          borderRadius="10px"
          value={ratio}
        />

        <SimpleTooltip
          label={t(
            "If your borrow amount reaches this value, you will be liquidated."
          )}
        >
          <Text flexShrink={0} mt="2px" ml={3} fontSize="10px">
            {smallUsdFormatter(maxBorrow)}
          </Text>
        </SimpleTooltip>
      </Row>
    </DashboardBox>
  );
};

const SupplyList = ({
  assets,
  supplyBalanceUSD,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  supplyBalanceUSD: number;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="md" px={4} py={3}>
        {t("Supply Balance:")} {smallUsdFormatter(supplyBalanceUSD)}
      </Heading>
      <ModalDivider />

      {assets.length > 0 ? (
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
            {t("APY/Weekly")}
          </Text>

          <Text width="27%" fontWeight="bold" textAlign="right">
            {t("Balance")}
          </Text>

          <Text width="20%" fontWeight="bold" textAlign="right">
            {t("Collateral")}
          </Text>
        </Row>
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        overflowY="auto"
        mt={1}
      >
        {assets.length > 0 ? (
          assets.map((asset, index) => {
            return (
              <AssetSupplyRow
                comptrollerAddress={comptrollerAddress}
                key={asset.underlyingToken}
                assets={assets}
                index={index}
              />
            );
          })
        ) : (
          <Center expand my={8}>
            {t("There are no assets in this pool.")}
          </Center>
        )}
      </Column>
    </Column>
  );
};

const AssetSupplyRow = ({
  assets,
  index,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
}) => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const asset = assets[index];

  const { fuse, address } = useRari();

  const tokenData = useTokenData(asset.underlyingToken);

  const supplyAPY = (asset.supplyRatePerBlock * 2372500) / 1e16;

  const queryCache = useQueryCache();

  const toast = useToast();

  const onToggleCollateral = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    let call;
    if (asset.membership) {
      call = comptroller.methods.exitMarket(asset.cToken);
    } else {
      call = comptroller.methods.enterMarkets([asset.cToken]);
    }

    let response = await call.call({ from: address });
    // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
    if (response[0] !== "0") {
      if (asset.membership) {
        toast({
          title: "Error! Code: " + response,
          description:
            "You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        toast({
          title: "Error! Code: " + response,
          description:
            "You cannot enable this asset as collateral at this time.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      }

      return;
    }

    await call.send({ from: address });

    queryCache.refetchQueries();
  };

  return (
    <>
      <PoolModal
        defaultMode={Mode.SUPPLY}
        comptrollerAddress={comptrollerAddress}
        assets={assets}
        index={index}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        mb={3}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="27%"
          as="button"
          onClick={openModal}
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
          <Text fontWeight="bold" fontSize="lg" ml={2} flexShrink={0}>
            {asset.underlyingSymbol}
          </Text>
        </Row>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
          as="button"
          onClick={openModal}
        >
          <Text
            color={tokenData?.color ?? "#FF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {supplyAPY.toFixed(3)}%
          </Text>

          <Text fontSize="sm">{(supplyAPY / 52).toFixed(3)}%</Text>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="27%"
          as="button"
          onClick={openModal}
        >
          <Text
            color={tokenData?.color ?? "#FFF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {smallUsdFormatter(asset.supplyBalanceUSD)}
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
              background-color: ${
                tokenData?.color
                  ? tokenData.color === "#FFFFFF"
                    ? "#282727"
                    : tokenData.color
                  : "#282727"
              } !important;
            }

            `}
          </style>
          <Switch
            isChecked={asset.membership}
            className={asset.underlyingSymbol + "-switch"}
            onChange={onToggleCollateral}
            size="md"
            mt={1}
            mr={5}
          />
        </Row>
      </Row>
    </>
  );
};

const BorrowList = ({
  assets,
  borrowBalanceUSD,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  borrowBalanceUSD: number;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Heading size="md" px={4} py={3}>
        {t("Borrow Balance:")} {smallUsdFormatter(borrowBalanceUSD)}
      </Heading>
      <ModalDivider />

      {assets.length > 0 ? (
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
            {t("APY/Weekly")}
          </Text>

          <Text width="27%" fontWeight="bold" textAlign="right">
            {t("Borrowed")}
          </Text>

          <Text width="20%" fontWeight="bold" textAlign="right">
            {t("Liquidity")}
          </Text>
        </Row>
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        overflowY="auto"
        mt={1}
      >
        {assets.length > 0 ? (
          assets.map((asset, index) => {
            return (
              <AssetBorrowRow
                comptrollerAddress={comptrollerAddress}
                key={asset.underlyingToken}
                assets={assets}
                index={index}
              />
            );
          })
        ) : (
          <Center expand my={8}>
            {t("There are no assets in this pool.")}
          </Center>
        )}
      </Column>
    </Column>
  );
};

const AssetBorrowRow = ({
  assets,
  index,
  comptrollerAddress,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
}) => {
  const asset = assets[index];

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const tokenData = useTokenData(asset.underlyingToken);

  const borrowAPY = (asset.borrowRatePerBlock * 2372500) / 1e16;

  return (
    <>
      <PoolModal
        comptrollerAddress={comptrollerAddress}
        defaultMode={Mode.BORROW}
        assets={assets}
        index={index}
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
          <Text fontWeight="bold" fontSize="lg" ml={2} flexShrink={0}>
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
            {borrowAPY.toFixed(3)}%
          </Text>

          <Text fontSize="sm">{(borrowAPY / 52).toFixed(3)}%</Text>
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
            {smallUsdFormatter(asset.borrowBalanceUSD)}
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(
              asset.borrowBalance / 10 ** asset.underlyingDecimals
            ).replace("$", "")}{" "}
            {asset.underlyingSymbol}
          </Text>
        </Column>

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width="20%"
        >
          <Text
            color={tokenData?.color ?? "#FFF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {shortUsdFormatter(asset.liquidityUSD)}
          </Text>

          <Text fontSize="sm">
            {shortUsdFormatter(
              asset.liquidity / 10 ** asset.underlyingDecimals
            ).replace("$", "")}{" "}
            {asset.underlyingSymbol}
          </Text>
        </Column>
      </Row>
    </>
  );
};

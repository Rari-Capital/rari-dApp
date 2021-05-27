/* eslint-disable no-loop-func */
import {
  AvatarGroup,
  Box,
  Link,
  Spinner,
  Switch,
  Text,
} from "@chakra-ui/react";
import { Center, Column, Row, RowOrColumn, useIsMobile } from "utils/buttered-chakra";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { smallUsdFormatter } from "utils/bigUtils";

import DashboardBox from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import { Link as RouterLink } from "react-router-dom";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";

import { filterOnlyObjectProperties, FuseAsset } from "utils/fetchFusePoolData";

import { SimpleTooltip } from "components/shared/SimpleTooltip";

import Footer from "components/shared/Footer";
import { memo, useState } from "react";

// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { CTokenIcon } from "./FusePoolsPage";
import { useQuery } from "react-query";

export type LiquidatablePosition = {
  account: string;
  totalBorrow: number;
  totalCollateral: number;
  totalSupplied: number;
  health: number;
  assets: FuseAsset[];
  poolID: number;
};

export type LiquidationEvent = {
  borrower: string;
  cTokenBorrowed: string;
  cTokenCollateral: string;
  borrowedTokenAddress: string;
  suppliedTokenAddress: string;
  liquidator: string;

  borrowedTokenUnderlyingDecimals: number;
  borrowedTokenUnderlyingSymbol: number;

  repayAmount: number;
  seizeTokens: number;
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  transactionIndex: number;
  poolID: number;
};

const FuseLiquidationsPage = memo(() => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();

  const { fuse, rari } = useRari();

  const [showAtRiskPositions, setShowAtRiskPositions] = useState(false);

  const { data: positions } = useQuery(
    showAtRiskPositions ? "atRiskPositions" : "liquidateablePositions",
    async () => {
      const [response, ethPriceBN] = await Promise.all([
        fuse.contracts.FusePoolLens.methods
          .getPublicPoolUsersWithData(
            fuse.web3.utils.toBN(showAtRiskPositions ? 1.1e18 : 1e18)
          )
          .call(),
        rari.getEthUsdPriceBN(),
      ]);

      const ethPrice: number = fuse.web3.utils.fromWei(ethPriceBN) as any;

      const comptrollers = response[0];
      const poolUsers = response[1];

      let positions: LiquidatablePosition[] = [];

      let userFetches: Promise<any>[] = [];

      for (let poolID = 0; poolID < comptrollers.length; poolID++) {
        const comptroller = comptrollers[poolID];
        const filteredUsers: LiquidatablePosition[] = poolUsers[poolID].filter(
          (position: LiquidatablePosition) => {
            // Filter out users that are borrowing less than 0.1 ETH
            return (
              position.totalBorrow / 1e18 > 0.1 &&
              // If we want to show at risk positions, don't show liquidatable ones.
              (showAtRiskPositions ? position.health / 1e18 > 1 : true) &&
              // Hide positions that are only one asset.
              position.assets.filter(
                // Must be borrowing/supplying more than $1 for this to count as an asset.
                (a) => {
                  const price = a.underlyingPrice;

                  return (
                    ((a.supplyBalance * price) / 1e36) * ethPrice > 1 ||
                    ((a.borrowBalance * price) / 1e36) * ethPrice > 1
                  );
                }
              ).length > 1
            );
          }
        );

        for (let userIndex = 0; userIndex < filteredUsers.length; userIndex++) {
          const user = filteredUsers[userIndex];

          userFetches.push(
            fuse.contracts.FusePoolLens.methods
              .getPoolUserSummary(comptroller, user.account)
              .call()
              .then((userSummary: number[]) => {
                // Add the positions to the list with extra details:
                positions.push({
                  ...user,
                  totalCollateral: (user.totalCollateral / 1e18) * ethPrice,
                  totalBorrow: (user.totalBorrow / 1e18) * ethPrice,
                  totalSupplied: (userSummary[0] / 1e18) * ethPrice,
                  assets: user.assets.map(filterOnlyObjectProperties),

                  poolID,
                });
              })
          );
        }
      }

      await Promise.all(userFetches);

      // Sort the positions by borrow balance in descending order.
      return positions.sort((a, b) => b.totalBorrow - a.totalBorrow);
    }
  );

  const { data: liquidations } = useQuery("liquidations", async () => {
    const pools = await fuse.contracts.FusePoolDirectory.methods
      .getAllPools()
      .call();

    let liquidationEvents: LiquidationEvent[] = [];

    let poolFetches: Promise<any>[] = [];

    for (let poolID = 0; poolID < pools.length; poolID++) {
      const pool = pools[poolID];

      poolFetches.push(
        fuse.contracts.FusePoolLens.methods
          .getPoolAssetsWithData(pool.comptroller)
          .call()
          .then(async (assets: FuseAsset[]) => {
            let eventFetches: Promise<any>[] = [];

            for (const asset of assets) {
              // If the asset has no borrowers, just skip it.
              if (parseInt(asset.totalBorrow as any) === 0) {
                continue;
              }

              const cToken = new fuse.web3.eth.Contract(
                JSON.parse(
                  fuse.compoundContracts[
                    "contracts/CEtherDelegate.sol:CEtherDelegate"
                  ].abi
                ),
                asset.cToken
              );

              eventFetches.push(
                cToken
                  .getPastEvents("LiquidateBorrow", {
                    fromBlock: 12060000,
                    toBlock: "latest",
                  })
                  .then(async (events) => {
                    let promises: Promise<any>[] = [];

                    for (const event of events) {
                      const suppliedToken = assets.find((a) => {
                        return (
                          a.cToken.toLowerCase() ===
                          event.returnValues.cTokenCollateral.toLowerCase()
                        );
                      })!;

                      promises.push(
                        fuse.web3.eth
                          .getBlock(event.blockNumber)
                          .then((blockInfo) => {
                            liquidationEvents.push({
                              ...filterOnlyObjectProperties(event.returnValues),
                              cTokenBorrowed: asset.cToken,

                              borrowedTokenAddress: asset.underlyingToken,
                              suppliedTokenAddress:
                                suppliedToken.underlyingToken,

                              borrowedTokenUnderlyingDecimals:
                                asset.underlyingDecimals,
                              borrowedTokenUnderlyingSymbol:
                                asset.underlyingSymbol,

                              poolID,

                              blockNumber: event.blockNumber,
                              timestamp: blockInfo.timestamp,

                              transactionHash: event.transactionHash,
                              transactionIndex: event.transactionIndex,
                            });
                          })
                      );
                    }

                    await Promise.all(promises);
                  })
              );
            }

            await Promise.all(eventFetches);
          })
      );
    }

    await Promise.all(poolFetches);

    return liquidationEvents.sort((a, b) => {
      if (b.blockNumber !== a.blockNumber) {
        return b.blockNumber - a.blockNumber;
      } else {
        return b.transactionIndex - a.transactionIndex;
      }
    });
  });

  const [liquidationsToShow, setLiquidationsToShow] = useState(1);
  const limitedLiquidations = liquidations?.slice(0, liquidationsToShow);

  const [positionsToShow, setPositionsToShow] = useState(-1);
  const limitedPositions = positions?.slice(
    0,
    positionsToShow === -1 ? positions.length : positionsToShow
  );

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        height="100%"
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />
        <FuseStatsBar />

        <FuseTabBar />

        <RowOrColumn
          isRow={!isMobile}
          mt={4}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height={isMobile ? "400px" : "200px"}
        >
          <DashboardBox
            height={isMobile ? "70%" : "100%"}
            width={isMobile ? "100%" : "70%"}
            overflow="hidden"
            bg="#141619"
          >
            <iframe
              height="100%"
              width="100%"
              src="https://rari.grafana.net/d-solo/NlUs6DwGk/fuse-overview?orgId=1&refresh=5m&panelId=16"
              title="Leverage"
            />
          </DashboardBox>

          <DashboardBox
            height={isMobile ? "30%" : "100%"}
            width={isMobile ? "100%" : "30%"}
            mt={isMobile ? 4 : 0}
            ml={isMobile ? 0 : 4}
            overflow="hidden"
            bg="#141619"
          >
            <iframe
              src="https://rari.grafana.net/d-solo/NlUs6DwGk/fuse-overview?orgId=1&refresh=5m&panelId=19"
              height="100%"
              width="100%"
              title="Liquidation Count"
            />
          </DashboardBox>
        </RowOrColumn>

        <DashboardBox width="100%" mt={4}>
          <LiquidationEventsList
            liquidations={limitedLiquidations}
            totalLiquidations={liquidations?.length ?? 0}
            setLiquidationsToShow={setLiquidationsToShow}
          />
        </DashboardBox>

        <DashboardBox width="100%" mt={4}>
          <LiquidatablePositionsList
            setShowAtRiskPositions={setShowAtRiskPositions}
            showAtRiskPositions={showAtRiskPositions}
            positions={limitedPositions}
            setPositionsToShow={setPositionsToShow}
            totalPositions={positions?.length ?? 0}
          />
        </DashboardBox>

        <Footer />
      </Column>
    </>
  );
});

export default FuseLiquidationsPage;

const LiquidationEventsList = ({
  liquidations,
  totalLiquidations,
  setLiquidationsToShow,
}: {
  liquidations?: LiquidationEvent[];
  totalLiquidations: number;
  setLiquidationsToShow: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
    >
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        pl={4}
        pr={1}
      >
        <Text fontWeight="bold" width={isMobile ? "100%" : "30%"}>
          {t("Recent Liquidations")}
        </Text>

        {isMobile ? null : (
          <>
            <Text fontWeight="bold" textAlign="center" width="23%">
              {t("Collateral Seized")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="23%">
              {t("Borrow Repaid")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="25%">
              {t("Timestamp")}
            </Text>
          </>
        )}
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        {liquidations ? (
          <>
            {liquidations.map((liquidation, index) => {
              return (
                <LiquidationRow
                  key={liquidation.transactionHash}
                  liquidation={liquidation}
                  noBottomDivider={index === liquidations.length - 1}
                />
              );
            })}

            <RowsControl
              totalAmount={totalLiquidations}
              setAmountToShow={setLiquidationsToShow}
            />
          </>
        ) : (
          <Spinner my={8} />
        )}
      </Column>
    </Column>
  );
};

const LiquidationRow = ({
  noBottomDivider,
  liquidation,
}: {
  noBottomDivider?: boolean;
  liquidation: LiquidationEvent;
}) => {
  const isMobile = useIsMobile();

  const { t } = useTranslation();

  const date = new Date(liquidation.timestamp * 1000);
  return (
    <>
      <Link
        isExternal
        width="100%"
        className="no-underline"
        href={"https://etherscan.io/tx/" + liquidation.transactionHash}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height="100px"
          className="hover-row"
          pl={4}
          pr={1}
        >
          <Column
            width={isMobile ? "100%" : "30%"}
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Box boxSize="23px">
                <Jazzicon
                  diameter={23}
                  seed={jsNumberForAddress(liquidation.liquidator)}
                />
              </Box>

              <Text ml={2} mr={2} fontWeight="bold">
                <Text as="span" color="#EE1E45">
                  {" → "}
                </Text>
                {t("Liquidated")}
                <Text as="span" color="#73BF69">
                  {" → "}
                </Text>
              </Text>

              <Box boxSize="23px">
                <Jazzicon
                  diameter={23}
                  seed={jsNumberForAddress(liquidation.borrower)}
                />
              </Box>

              <Text ml={3} mr={2} fontWeight="bold">
                (Pool #{liquidation.poolID})
              </Text>
            </Row>

            <Text mt={2} fontSize="11px" color="#EE1E45">
              {liquidation.liquidator}
            </Text>
            <Text mt={1} fontSize="11px" color="#73BF69">
              {liquidation.borrower}
            </Text>
          </Column>

          {isMobile ? null : (
            <>
              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                height="100%"
                width="23%"
              >
                <CTokenIcon
                  size="md"
                  mb={2}
                  address={liquidation.suppliedTokenAddress}
                />
              </Column>

              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                height="100%"
                width="23%"
                fontWeight="bold"
              >
                <CTokenIcon
                  size="sm"
                  mb={2}
                  address={liquidation.borrowedTokenAddress}
                />
                {smallUsdFormatter(
                  liquidation.repayAmount /
                    10 ** liquidation.borrowedTokenUnderlyingDecimals
                ).replace("$", "")}{" "}
                {liquidation.borrowedTokenUnderlyingSymbol}
              </Column>

              <Column
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                height="100%"
                width="25%"
              >
                <Text fontWeight="bold">{date.toLocaleTimeString()}</Text>

                <Text mt={1}>{date.toLocaleDateString()}</Text>
              </Column>
            </>
          )}
        </Row>
      </Link>

      {noBottomDivider ? null : <ModalDivider />}
    </>
  );
};

const LiquidatablePositionsList = ({
  positions,
  totalPositions,
  setPositionsToShow,
  showAtRiskPositions,
  setShowAtRiskPositions,
}: {
  positions?: LiquidatablePosition[];
  totalPositions: number;
  setPositionsToShow: React.Dispatch<React.SetStateAction<number>>;
  showAtRiskPositions: boolean;
  setShowAtRiskPositions: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
    >
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        pl={4}
        pr={1}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width={isMobile ? "100%" : "30%"}
        >
          <SimpleTooltip
            label={
              showAtRiskPositions
                ? t(
                    "At risk positions are positions that are less than 110% collateralized."
                  )
                : t(
                    "Liquidatable positions are positions less than 100% collateralized."
                  )
            }
          >
            <Text fontWeight="bold">
              {showAtRiskPositions
                ? t("At Risk Positions")
                : t("Liquidatable Positions")}
            </Text>
          </SimpleTooltip>
          <SimpleTooltip
            label={
              showAtRiskPositions
                ? t("Disable the switch to just view liquidatable positions.")
                : t("Enable the switch to view 'at risk' positions.")
            }
          >
            <Box ml={3}>
              <Switch
                size="sm"
                colorScheme="yellow"
                checked={showAtRiskPositions}
                onChange={() => setShowAtRiskPositions((past) => !past)}
              />
            </Box>
          </SimpleTooltip>
        </Row>

        {isMobile ? null : (
          <>
            <Text fontWeight="bold" textAlign="center" width="14%">
              {t("Supplied")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="14%">
              {t("Borrowed")}
            </Text>

            <Text textAlign="center" width="14%">
              {t("Borrow Ratio")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="14%">
              {t("Borrow Limit")}
            </Text>

            <Text textAlign="center" width="14%">
              {t("Limit Used")}
            </Text>
          </>
        )}
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        {positions ? (
          <>
            {" "}
            {positions.map((position, index) => {
              return (
                <PositionRow
                  key={position.account + position.poolID}
                  position={position}
                  noBottomDivider={index === positions.length - 1}
                />
              );
            })}
            <RowsControl
              totalAmount={totalPositions}
              setAmountToShow={setPositionsToShow}
            />
          </>
        ) : (
          <Spinner my={8} />
        )}
      </Column>
    </Column>
  );
};

const PositionRow = ({
  position,
  noBottomDivider,
}: {
  position: LiquidatablePosition;
  noBottomDivider?: boolean;
}) => {
  const isMobile = useIsMobile();

  const borrowRatio = (position.totalBorrow / position.totalSupplied) * 100;
  const limitUsed = (position.totalBorrow / position.totalCollateral) * 100;

  return (
    <>
      <Link
        /* @ts-ignore */
        as={RouterLink}
        width="100%"
        className="no-underline"
        to={"/fuse/pool/" + position.poolID + `?address=${position.account}`}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height="90px"
          className="hover-row"
          pl={4}
          pr={1}
        >
          <Column
            pt={1}
            width={isMobile ? "100%" : "30%"}
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Jazzicon
                diameter={23}
                seed={jsNumberForAddress(position.account)}
              />

              <Text ml={3} fontWeight="bold">
                Pool #{position.poolID}
              </Text>

              <SimpleTooltip
                label={position.assets
                  .map((t) => t.underlyingSymbol)
                  .join(" / ")}
              >
                <AvatarGroup size="xs" max={30} ml={2} mr={2}>
                  {position.assets.map(({ underlyingToken }) => {
                    return (
                      <CTokenIcon
                        key={underlyingToken}
                        address={underlyingToken}
                      />
                    );
                  })}
                </AvatarGroup>
              </SimpleTooltip>
            </Row>

            <Text mt={2} fontSize="11px">
              {position.account}
            </Text>
          </Column>

          {isMobile ? null : (
            <>
              <Center height="100%" width="14%">
                <b>{smallUsdFormatter(position.totalSupplied)}</b>
              </Center>

              <Center height="100%" width="14%">
                <b>{smallUsdFormatter(position.totalBorrow)}</b>
              </Center>
              <Center
                height="100%"
                width="14%"
                color={borrowRatio > 100 ? "#EE1E45" : "#73BF69"}
              >
                {borrowRatio.toFixed(2) + "%"}
              </Center>
              <Center height="100%" width="14%">
                <b>{smallUsdFormatter(position.totalCollateral)}</b>
              </Center>
              <Center height="100%" width="14%">
                {limitUsed.toFixed(2) + "%"}
              </Center>
            </>
          )}
        </Row>
      </Link>

      {noBottomDivider ? null : <ModalDivider />}
    </>
  );
};

const RowsControl = ({
  setAmountToShow,
  totalAmount,
}: {
  totalAmount: number;
  setAmountToShow: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation();

  return (
    <Row
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
    >
      <DashboardBox
        fontWeight="bold"
        as="button"
        px={2}
        py={1}
        onClick={() =>
          setAmountToShow((past) =>
            Math.min(
              past === 0 ? 1 : past === -1 ? totalAmount : past + 5,
              totalAmount
            )
          )
        }
      >
        {t("View More")}
      </DashboardBox>

      <DashboardBox
        fontWeight="bold"
        as="button"
        ml={4}
        px={2}
        py={1}
        onClick={() => setAmountToShow((past) => Math.max(past - 5, 0))}
      >
        {t("View Less")}
      </DashboardBox>

      <DashboardBox
        as="button"
        ml={4}
        px={2}
        py={1}
        onClick={() => setAmountToShow(totalAmount)}
      >
        {t("View All")}
      </DashboardBox>

      <DashboardBox
        as="button"
        ml={4}
        px={2}
        py={1}
        onClick={() => setAmountToShow(0)}
      >
        {t("Collapse All")}
      </DashboardBox>
    </Row>
  );
};

/* eslint-disable no-loop-func */
import {
  AvatarGroup,
  Box,
  Link,
  Spinner,
  Switch,
  Text,
} from "@chakra-ui/react";
import { Center, Column, Row, RowOrColumn, useIsMobile } from "buttered-chakra";
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

const FuseLiquidationsPage = memo(() => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();

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
          <PoolList />
        </DashboardBox>

        <Footer />
      </Column>
    </>
  );
});

export default FuseLiquidationsPage;

export type LiquidatablePositions = {
  account: string;
  totalBorrow: number;
  totalCollateral: number;
  totalSupplied: number;
  assets: FuseAsset[];
  poolID: number;
};

const PoolList = () => {
  const { fuse, rari } = useRari();
  const { t } = useTranslation();

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

      let positions: LiquidatablePositions[] = [];

      // Wait until we fetch all pools before returning.
      await new Promise((resolvePools) => {
        let poolsCompleted = 0;

        // Loop over each pool to get its users:
        for (let poolID = 0; poolID < comptrollers.length; poolID++) {
          const comptroller = comptrollers[poolID];
          const filteredUsers: LiquidatablePositions[] = poolUsers[
            poolID
          ].filter((user: any) => {
            // Filter out users that are borrowing less than 0.1 ETH
            return (
              user.totalBorrow / 1e18 > 0.1 &&
              // If we want to show at risk positions, don't show liquidatable ones.
              (showAtRiskPositions ? user.health / 1e18 > 1 : true)
            );
          });

          // If this pool has no filteredUsers, consider this pool fetched:
          if (filteredUsers.length === 0) {
            // Increment the pools completed counter.
            poolsCompleted++;

            // If this was the last pool we needed to fetch, we're done!
            if (poolsCompleted === comptrollers.length) {
              resolvePools(true);
            }
          }

          let usersCompleted = 0;

          // Loop over each user:
          for (
            let userIndex = 0;
            userIndex < filteredUsers.length;
            userIndex++
          ) {
            const user = filteredUsers[userIndex];

            // Fetch more details about the user:
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

                // Increment the users completed counter.
                usersCompleted++;

                // If this was the last user in the pool we need to fetch, we're done with this pool:
                if (usersCompleted === filteredUsers.length) {
                  // Increment the pools completed counter.
                  poolsCompleted++;

                  // If this was the last pool we needed to fetch, we're done!
                  if (poolsCompleted === comptrollers.length) {
                    resolvePools(true);
                  }
                }
              });
          }
        }
      });

      // Sort the positions by borrow balance in descending order.
      return positions.sort((a, b) => b.totalBorrow - a.totalBorrow);
    }
  );

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
          positions.map((position, index) => {
            return (
              <UserRow
                key={position.account + position.poolID}
                poolNumber={position.poolID}
                address={position.account}
                supplied={position.totalSupplied}
                borrowLimit={position.totalCollateral}
                borrowed={position.totalBorrow}
                tokens={position.assets.map((asset) => ({
                  symbol: asset.underlyingSymbol,
                  address: asset.underlyingToken,
                }))}
                noBottomDivider={index === positions.length - 1}
              />
            );
          })
        ) : (
          <Spinner my={8} />
        )}
      </Column>
    </Column>
  );
};

const UserRow = ({
  tokens,
  poolNumber,
  borrowLimit,
  borrowed,
  supplied,
  address,
  noBottomDivider,
}: {
  tokens: { symbol: string; address: string }[];
  poolNumber: number;
  borrowLimit: number;
  borrowed: number;
  supplied: number;
  address: string;
  noBottomDivider?: boolean;
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <Link
        /* @ts-ignore */
        as={RouterLink}
        width="100%"
        className="no-underline"
        to={"/fuse/pool/" + poolNumber + `?address=${address}`}
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
            pt={2}
            width={isMobile ? "100%" : "30%"}
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />

              <Text ml={3} fontWeight="bold">
                Pool #{poolNumber}
              </Text>

              <SimpleTooltip label={tokens.map((t) => t.symbol).join(" / ")}>
                <AvatarGroup size="xs" max={30} ml={2} mr={2}>
                  {tokens.map(({ address }) => {
                    return <CTokenIcon key={address} address={address} />;
                  })}
                </AvatarGroup>
              </SimpleTooltip>
            </Row>

            <Text mt={2} fontSize="11px">
              {address}
            </Text>
          </Column>

          {isMobile ? null : (
            <>
              <Center height="100%" width="14%">
                <b>{smallUsdFormatter(supplied)}</b>
              </Center>

              <Center height="100%" width="14%">
                <b>{smallUsdFormatter(borrowed)}</b>
              </Center>
              <Center height="100%" width="14%">
                {((borrowed / supplied) * 100).toFixed(2) + "%"}
              </Center>
              <Center height="100%" width="14%">
                <b> {smallUsdFormatter(borrowLimit)}</b>
              </Center>
              <Center height="100%" width="14%">
                {((borrowed / borrowLimit) * 100).toFixed(2) + "%"}
              </Center>
            </>
          )}
        </Row>
      </Link>

      {noBottomDivider ? null : <ModalDivider />}
    </>
  );
};

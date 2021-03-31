import { Avatar, AvatarGroup, Link, Spinner, Text } from "@chakra-ui/react";
import { Center, Column, Row } from "buttered-chakra";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter } from "../../../utils/bigUtils";

import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import { Link as RouterLink } from "react-router-dom";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar, { useFilter } from "./FuseTabBar";
import { useQuery } from "react-query";
import { useTokenData } from "../../../hooks/useTokenData";
import Fuse from "fuse.js";
import {
  filter as wordFilter,
  filterOnlyObjectProperties,
} from "../../../utils/fetchFusePoolData";
import { letterScore, usePoolRSS } from "../../../hooks/useRSS";
import { SimpleTooltip } from "../../shared/SimpleTooltip";

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  isPrivate: boolean;
}

interface MergedPool {
  id: number;
  pool: FusePool;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  suppliedUSD: number;
  borrowedUSD: number;
}

const poolSort = (pools: MergedPool[]) => {
  return pools.sort((a, b) => {
    if (b.suppliedUSD > a.suppliedUSD) {
      return 1;
    }

    if (b.suppliedUSD < a.suppliedUSD) {
      return -1;
    }

    // They're equal, let's sort by pool number:

    return b.id > a.id ? 1 : -1;
  });
};

const FusePoolsPage = React.memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSmallScreen();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar />

        <FuseTabBar />

        <DashboardBox width="100%" mt={4}>
          <PoolList />
        </DashboardBox>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolsPage;

const PoolList = () => {
  const filter = useFilter();

  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";

  const { t } = useTranslation();

  const { fuse, rari, address } = useRari();

  const { data: _pools } = useQuery(
    address + " fusePoolList" + (isMyPools || isCreatedPools ? filter : ""),
    async () => {
      const [
        {
          0: ids,
          1: fusePools,
          2: totalSuppliedETH,
          3: totalBorrowedETH,
          4: underlyingTokens,
          5: underlyingSymbols,
        },
        ethPrice,
      ] = await Promise.all([
        isMyPools
          ? fuse.contracts.FusePoolLens.methods
              .getPoolsBySupplierWithData(address)
              .call({ gas: 1e18 })
          : isCreatedPools
          ? fuse.contracts.FusePoolLens.methods
              .getPoolsByAccountWithData(address)
              .call({ gas: 1e18 })
          : fuse.contracts.FusePoolLens.methods
              .getPublicPoolsWithData()
              .call({ gas: 1e18 }),

        rari.web3.utils.fromWei(await rari.getEthUsdPriceBN()),
      ]);

      const merged: MergedPool[] = [];
      for (let id = 0; id < ids.length; id++) {
        merged.push({
          // I don't know why we have to do this but for some reason it just becomes an array after a refetch for some reason, so this forces it to be an object.
          underlyingTokens: underlyingTokens[id],
          underlyingSymbols: underlyingSymbols[id],
          pool: filterOnlyObjectProperties(fusePools[id]),
          id: ids[id],
          suppliedUSD: (totalSuppliedETH[id] / 1e18) * parseFloat(ethPrice),
          borrowedUSD: (totalBorrowedETH[id] / 1e18) * parseFloat(ethPrice),
        });
      }

      return merged;
    }
  );

  const filteredPools = useMemo(() => {
    if (!_pools) {
      return undefined;
    }

    if (!filter) {
      return poolSort(_pools);
    }

    if (isMyPools || isCreatedPools) {
      return poolSort(_pools);
    }

    const options = {
      keys: ["pool.name", "id", "underlyingTokens", "underlyingSymbols"],
      threshold: 0.3,
    };

    const filtered = new Fuse(_pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [_pools, filter, isMyPools, isCreatedPools]);

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
        <Text fontWeight="bold" width="40%">
          {t("Pool Assets")}
        </Text>

        <Text fontWeight="bold" textAlign="center" width="13%">
          {t("Pool Number")}
        </Text>

        <Text fontWeight="bold" textAlign="center" width="16%">
          {t("Total Supplied")}
        </Text>

        <Text fontWeight="bold" textAlign="center" width="16%">
          {t("Total Borrowed")}
        </Text>

        <Text fontWeight="bold" textAlign="center" width="15%">
          {t("Pool Risk Score")}
        </Text>
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        {filteredPools ? (
          filteredPools.map((pool, index) => {
            return (
              <PoolRow
                key={pool.id}
                poolNumber={pool.id}
                name={wordFilter.clean(pool.pool.name)}
                tvl={pool.suppliedUSD}
                borrowed={pool.borrowedUSD}
                tokens={pool.underlyingTokens.map((address, index) => ({
                  symbol: pool.underlyingSymbols[index],
                  address,
                }))}
                noBottomDivider={index === filteredPools.length - 1}
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

const PoolRow = ({
  tokens,
  poolNumber,
  tvl,
  borrowed,
  name,
  noBottomDivider,
}: {
  tokens: { symbol: string; address: string }[];
  poolNumber: number;
  tvl: number;
  borrowed: number;
  name: string;
  noBottomDivider?: boolean;
}) => {
  const isEmpty = tokens.length === 0;

  const rss = usePoolRSS(poolNumber);

  const rssScore = rss ? letterScore(rss.totalScore) : "?";

  return (
    <>
      <Link
        /* @ts-ignore */
        as={RouterLink}
        width="100%"
        className="no-underline"
        to={"/fuse/pool/" + poolNumber}
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
            width="40%"
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
          >
            {isEmpty ? null : (
              <SimpleTooltip label={tokens.map((t) => t.symbol).join(" / ")}>
                <AvatarGroup size="xs" max={30} mr={2}>
                  {tokens.map(({ address }) => {
                    return <CTokenIcon key={address} address={address} />;
                  })}
                </AvatarGroup>
              </SimpleTooltip>
            )}

            <Text mt={isEmpty ? 0 : 2}>{name}</Text>
          </Column>

          <Center height="100%" width="13%">
            <b>{poolNumber}</b>
          </Center>

          <Center height="100%" width="16%">
            <b>{smallUsdFormatter(tvl)}</b>
          </Center>

          <Center height="100%" width="16%">
            <b>{smallUsdFormatter(borrowed)}</b>
          </Center>
          <Center height="100%" width="15%">
            <SimpleTooltip
              label={
                "Underlying RSS: " +
                (rss ? rss.totalScore.toFixed(2) : "?") +
                "%"
              }
            >
              <b>{rssScore}</b>
            </SimpleTooltip>
          </Center>
        </Row>
      </Link>

      {noBottomDivider ? null : <ModalDivider />}
    </>
  );
};

export const CTokenIcon = ({
  address,
  ...avatarProps
}: {
  address: string;
  [key: string]: any;
}) => {
  const tokenData = useTokenData(address);

  return (
    <Avatar
      {...avatarProps}
      key={address}
      bg="#FFF"
      borderWidth="1px"
      name={tokenData?.symbol ?? "Loading..."}
      src={
        tokenData?.logoURL ??
        "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
      }
    />
  );
};

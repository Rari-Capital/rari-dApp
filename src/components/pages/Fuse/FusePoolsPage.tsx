import { ChevronDownIcon } from "@chakra-ui/icons";
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

        <DashboardBox width="100%" mt={4} height={isMobile ? "auto" : "600px"}>
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

      const merged: {
        id: number;
        pool: FusePool;
        underlyingTokens: string[];
        underlyingSymbols: string[];
        suppliedUSD: number;
        borrowedUSD: number;
      }[] = [];
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
      return _pools.sort((a, b) => (b.suppliedUSD > a.suppliedUSD ? 1 : -1));
    }

    if (isMyPools || isCreatedPools) {
      return _pools.sort((a, b) => (b.suppliedUSD > a.suppliedUSD ? 1 : -1));
    }

    const options = {
      keys: ["pool.name", "id", "underlyingTokens", "underlyingSymbols"],
    };

    const filtered = new Fuse(_pools, options).search(filter);
    return filtered
      .map((item) => item.item)
      .sort((a, b) => (b.suppliedUSD > a.suppliedUSD ? 1 : -1));
  }, [_pools, filter, isMyPools, isCreatedPools]);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      pb={4}
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

        <Row mainAxisAlignment="center" crossAxisAlignment="center" width="15%">
          <Text fontWeight="bold" textAlign="center">
            {t("Total Supplied")}
          </Text>
          <ChevronDownIcon ml={1} />
        </Row>

        <Text fontWeight="bold" width="15%" textAlign="center">
          {t("Pool Number")}
        </Text>

        <Text fontWeight="bold" width="15%" textAlign="center">
          {t("Total Borrowed")}
        </Text>

        <Text fontWeight="bold" width="15%" textAlign="center">
          {t("Pool Risk Score")}
        </Text>
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        pl={4}
        pr={1}
        pt="6px"
        overflow="scroll"
      >
        {filteredPools ? (
          filteredPools.map((pool) => {
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
                mt={2}
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

  mt,
  name,
}: {
  tokens: { symbol: string; address: string }[];
  poolNumber: number;
  tvl: number;
  borrowed: number;

  mt?: number | string;
  name: string;
}) => {
  const isEmpty = tokens.length === 0;

  const rss = usePoolRSS(poolNumber);

  const rssScore = rss ? letterScore(rss.totalScore) : "?";

  return (
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
        height="30px"
        mt={mt ?? 0}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          height="100%"
          width="38%"
          mr="2%"
          overflow="scroll"
        >
          {isEmpty ? null : (
            <AvatarGroup size="xs" max={30} mr={2}>
              {tokens.map(({ address }) => {
                return <CTokenIcon key={address} address={address} />;
              })}
            </AvatarGroup>
          )}

          <Text flexShrink={0}>{name}</Text>

          {isEmpty ? null : (
            <Text ml={2} mb="3px" fontWeight="bold" flexShrink={0}>
              <b>
                (
                {tokens.map(({ symbol }, index, array) => {
                  return symbol + (index !== array.length - 1 ? " / " : "");
                })}
                )
              </b>
            </Text>
          )}
        </Row>

        <Center height="100%" width="15%">
          <b>{smallUsdFormatter(tvl)}</b>
        </Center>

        <Center height="100%" width="15%">
          <b>{poolNumber}</b>
        </Center>

        <Center height="100%" width="15%">
          <b>{smallUsdFormatter(borrowed)}</b>
        </Center>
        <Center height="100%" width="15%">
          <SimpleTooltip
            label={
              "Underlying RSS: " + (rss ? rss.totalScore.toFixed(2) : "?") + "%"
            }
          >
            <b>{rssScore}</b>
          </SimpleTooltip>
        </Center>
      </Row>
    </Link>
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

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar, AvatarGroup, Link, Spinner, Text } from "@chakra-ui/react";
import { Center, Column, Row } from "buttered-chakra";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter } from "../../../utils/bigUtils";

import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import { Link as RouterLink } from "react-router-dom";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar, { useFilter } from "./FuseTabBar";
import { useQuery } from "react-query";
import { useTokenData } from "../../../hooks/useTokenData";
import Fuse from "fuse.js";

export function filterOnlyObjectProperties(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => isNaN(k as any))
  ) as any;
}

export interface FuseAsset {
  cToken: string;

  borrowBalance: number;
  supplyBalance: number;
  liquidity: number;

  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: string;
  underlyingDecimals: number;
  underlyingPrice: number;

  borrowRatePerBlock: number;
  supplyRatePerBlock: number;
}

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
        px={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar />

        <FuseTabBar />

        <DashboardBox
          width="100%"
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height={isMobile ? "auto" : "600px"}
        >
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

  const { t } = useTranslation();

  const { fuse, rari, address } = useRari();

  const { data: _pools } = useQuery(
    address + " fusePoolList" + (isMyPools ? " my-pools" : ""),
    async () => {
      const {
        0: ids,
        1: fusePools,
        2: totalSuppliedETH,
        3: totalBorrowedETH,
      } = await (filter === "my-pools"
        ? fuse.contracts.FusePoolDirectory.methods
            .getPoolsBySupplierWithData(address)
            .call()
        : fuse.contracts.FusePoolDirectory.methods
            .getPublicPoolsWithData()
            .call());

      const merged: {
        id: number;
        pool: FusePool;
        cTokens: FuseAsset[];
        suppliedUSD: number;
        borrowedUSD: number;
      }[] = [];

      const ethPrice = rari.web3.utils.fromWei(await rari.getEthUsdPriceBN());

      for (let id = 0; id < ids.length; id++) {
        const cTokens = await fuse.contracts.FusePoolDirectory.methods
          .getPoolAssetsWithData(fusePools[id].comptroller)
          .call({ from: address });

        merged.push({
          // I don't know why we have to do this but for some reason it just becomes an array after a refetch for some reason, so this forces it to be an object.
          cTokens: cTokens.map(filterOnlyObjectProperties),
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

    const nonEmptyPools = _pools.filter((pool) => pool.cTokens.length > 0);

    if (!filter) {
      return nonEmptyPools.sort((a, b) =>
        b.suppliedUSD > a.suppliedUSD ? 1 : -1
      );
    }

    if (isMyPools) {
      return nonEmptyPools.sort((a, b) =>
        b.suppliedUSD > a.suppliedUSD ? 1 : -1
      );
    }

    const options = {
      keys: [
        "pool.name",
        "id",
        "cToken.cToken",
        "cTokens.underlyingName",
        "cTokens.underlyingSymbol",
        "cTokens.underlyingToken",
      ],
    };

    const filtered = new Fuse(nonEmptyPools, options).search(filter);
    return filtered
      .map((item) => item.item)
      .sort((a, b) => (b.suppliedUSD > a.suppliedUSD ? 1 : -1));
  }, [_pools, filter, isMyPools]);

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
          {t("RSS Pool Score")}
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
                name={pool.pool.name}
                tvl={pool.suppliedUSD}
                borrowed={pool.borrowedUSD}
                rss={"A"}
                tokens={pool.cTokens.map((token) => ({
                  symbol: token.underlyingSymbol,
                  address: token.underlyingToken,
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
  rss,
  mt,
  name,
}: {
  tokens: { symbol: string; address: string }[];
  poolNumber: number;
  tvl: number;
  borrowed: number;
  rss: string;
  mt?: number | string;
  name: string;
}) => {
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
          width="40%"
        >
          <AvatarGroup size="xs" max={5}>
            {tokens.map(({ address }) => {
              return <CTokenIcon key={address} address={address} />;
            })}
          </AvatarGroup>

          <Text ml={2}>
            {name}&nbsp;
            <b>
              (
              {tokens.map(({ symbol }, index, array) => {
                return symbol + (index !== array.length - 1 ? " / " : "");
              })}
              )
            </b>
          </Text>
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
          <b>{rss}</b>
        </Center>
      </Row>
    </Link>
  );
};

const CTokenIcon = ({
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

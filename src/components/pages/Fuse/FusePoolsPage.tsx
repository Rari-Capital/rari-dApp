import React from "react";
import { Avatar, AvatarGroup, Link, Spinner, Text } from "@chakra-ui/react";
import { Center, Column, Row, useIsMobile } from "buttered-chakra";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { smallUsdFormatter } from "utils/bigUtils";

import DashboardBox from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import { Link as RouterLink } from "react-router-dom";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar, { useFilter } from "./FuseTabBar";
import { useTokenData } from "hooks/useTokenData";

import { filterPoolName } from "utils/fetchFusePoolData";

import { letterScore, usePoolRSS } from "hooks/useRSS";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { useFusePools } from "hooks/fuse/useFusePools";
import Footer from "components/shared/Footer";

const FusePoolsPage = React.memo(() => {
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

        <DashboardBox width="100%" mt={4}>
          <PoolList />
        </DashboardBox>

        <Footer/>
      </Column>
    </>
  );
});

export default FusePoolsPage;

const PoolList = () => {
  const filter = useFilter();
  const { t } = useTranslation();

  const { filteredPools } = useFusePools(filter);
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
        <Text fontWeight="bold" width="40%">
          {!isMobile ? t("Pool Assets") : t("Pool Directory")}
        </Text>

        {isMobile ? null : (
          <>
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
          </>
        )}
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
                name={filterPoolName(pool.pool.name)}
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

  const isMobile = useIsMobile();

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
          height={isMobile ? "120px" : "90px"}
          className="hover-row"
          pl={4}
          pr={1}
        >
          <Column
            pt={2}
            width={isMobile ? "100%" : "40%"}
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

          {isMobile ? null : (
            <>
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
            </>
          )}
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

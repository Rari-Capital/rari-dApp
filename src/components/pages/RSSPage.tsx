import {
  Column,
  PercentageSize,
  Row,
  useSpacedLayout,
  Center,
  useWindowSize,
  useIsMobile,
} from "buttered-chakra";
import React from "react";
import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";

import { Header, HeaderHeightWithTopPadding } from "../shared/Header";
import { Text, Image, Spinner, SimpleGrid, Heading } from "@chakra-ui/react";
import { useTokenData } from "../../hooks/useTokenData";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { useTranslation } from "react-i18next";
import { SimpleTooltip } from "../shared/SimpleTooltip";

const useRSS = (address: string) => {
  const { data } = useQuery(
    address + " rss",
    () => {
      return fetch("/api/rss?address=" + address)
        .then((res) => res.json())
        .catch((e) => {
          console.log("Could not fetch RSS!");
          console.log(e);
        }) as Promise<{
        mcap: number;
        volatility: number;
        liquidity: number;
        swapCount: number;
        coingeckoMetadata: number;
        exchanges: number;
        transfers: number;

        lastUpdated: string;
        totalScore: number;
      }>;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 7 days
      cacheTime: 8.64e7,
    }
  );

  return data;
};

const RSSPage = React.memo(() => {
  const { isAuthed } = useRari();

  const { data: tokenList } = useQuery(
    "topCoins",
    () => {
      return fetch(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
        {
          method: "post",

          body: JSON.stringify({
            query: `{
            tokens(first: 80, orderBy: tradeVolumeUSD, orderDirection: desc) {
              id
            }
          }`,
          }),

          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => res.json())
        .then((res) => res.data.tokens) as Promise<
        { id: string; symbol: string }[]
      >;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const { height } = useWindowSize();

  const isMobile = useIsMobile();

  const {
    childSizes: [, bodySize],
  } = useSpacedLayout({
    parentHeight: height,
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [HeaderHeightWithTopPadding, new PercentageSize(1)],
  });

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Header padding isAuthed={isAuthed} />

      <SimpleGrid
        {...(isMobile ? { columns: 1 } : { minChildWidth: "400px" })}
        spacing={4}
        width="100%"
        height={bodySize.asPxString()}
        overflow="scroll"
        px={4}
      >
        {tokenList
          ? tokenList.map((token) => (
              <TokenRSS key={token.id} address={token.id} />
            ))
          : null}
        <CopyrightSpacer />
      </SimpleGrid>
    </Column>
  );
});

const TokenRSS = React.memo(({ address }: { address: string }) => {
  const tokenData = useTokenData(address);

  const rss = useRSS(address);

  console.log(rss);

  const { t } = useTranslation();

  return (
    <DashboardBox width="100%" height="250px" p={4} bg="#FFF">
      {tokenData && rss ? (
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
        >
          <Column
            flexShrink={0}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
          >
            <Text>
              <b>{t("Market Cap")}:</b> {rss.mcap.toFixed(0)} / 33
            </Text>
            <Text mt={2}>
              <b>{t("Liquidity")}:</b> {rss.liquidity.toFixed(1)} / 32
            </Text>
            <Text mt={2}>
              <b>{t("Volatility")}:</b> {rss.volatility.toFixed(1)} / 20
            </Text>
            <Text mt={2}>
              <b>{t("Swap Volume")}:</b> {rss.swapCount.toFixed(0)} / 7
            </Text>
            <Text mt={2}>
              <b>{t("Exchanges")}:</b> {rss.exchanges.toFixed(1)} / 3
            </Text>
            <Text mt={2}>
              <b>{t("Transfers")}:</b> {rss.transfers.toFixed(2)} / 3
            </Text>
            <Text mt={2}>
              <b>{t("Social Media")}:</b> {rss.coingeckoMetadata.toFixed(0)} / 2
            </Text>
          </Column>

          <Column
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            expand
            pr={2}
          >
            <Image mb={2} src={tokenData.logoURL!} boxSize="40px" />

            <SimpleTooltip
              label={t("Last Updated") + ": " + rss?.lastUpdated ?? "?"}
            >
              <Heading
                fontSize={{ md: "50px", base: "40px" }}
                lineHeight={1}
                color={
                  tokenData.color === "#FFFFFF"
                    ? "#000"
                    : tokenData.color ?? "#000"
                }
              >
                {rss.totalScore.toFixed(0)}%
              </Heading>
            </SimpleTooltip>

            <Text
              mt={-1}
              color={
                tokenData.color === "#FFFFFF"
                  ? "#000"
                  : tokenData.color ?? "#000"
              }
            >
              {tokenData!.symbol}
            </Text>
          </Column>
        </Row>
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </DashboardBox>
  );
});

export default RSSPage;

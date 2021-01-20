import {
  Column,
  PercentageSize,
  Row,
  useSpacedLayout,
  Center,
  useWindowSize,
  useIsMobile,
} from "buttered-chakra";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";

import { Header, HeaderHeightWithTopPadding } from "../shared/Header";
import {
  Text,
  Image,
  Spinner,
  SimpleGrid,
  Heading,
  Input,
  IconButton,
  useToast,
  Link,
} from "@chakra-ui/react";
import { useTokenData } from "../../hooks/useTokenData";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { useTranslation } from "react-i18next";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import { SearchIcon } from "@chakra-ui/icons";

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

const RSSAssetsPage = React.memo(() => {
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
            tokens(first: 50, orderBy: tradeVolumeUSD, orderDirection: desc) {
              id
            }
          }`,
          }),

          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => res.json())
        .then((res) => res.data.tokens) as Promise<{ id: string }[]>;
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

  const [customAssets, setCustomAssets] = useState<{ id: string }[]>([]);

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
    >
      <Header padding isAuthed={isAuthed} />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height={bodySize.asPxString()}
        overflow="scroll"
        px={4}
        width="100%"
      >
        <Heading color="#FFF">{t("Asset RSS")}</Heading>

        <Heading color="#FFF" size="sm" mb={6} textAlign="center">
          <Link
            isExternal
            href="https://docs.google.com/spreadsheets/d/1YyONj9N22cCWXnHMAMkcWSx3qag5yQBl0bO8VDqEr3I/edit?usp=sharing"
          >
            {t(
              "Rari Safety Scores for top ERC20 assets. Click here for information on the calculations."
            )}
          </Link>
        </Heading>

        <SearchBar
          onSearch={(address: string) => {
            const asset = { id: address };

            if (
              !customAssets.some((customAsset) => customAsset.id === address)
            ) {
              setCustomAssets((past) => [asset, ...past]);
            }
          }}
        />
        <SimpleGrid
          {...(isMobile ? { columns: 1 } : { minChildWidth: "400px" })}
          spacing={4}
          width="100%"
        >
          {tokenList
            ? [...customAssets, ...tokenList].map((token) => (
                <TokenRSS key={token.id} address={token.id} />
              ))
            : null}
          <CopyrightSpacer />
        </SimpleGrid>
      </Column>
    </Column>
  );
});

const SearchBar = ({ onSearch }: { onSearch: (address: string) => any }) => {
  const [address, setAddress] = useState("");

  const { rari } = useRari();

  const toast = useToast();

  const { t } = useTranslation();

  return (
    <Row
      width="100%"
      mb={4}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
    >
      <Input
        placeholder={t(
          "Search for a valid ERC20 address here in a format like: 0x0000000000000000000000000000000000000000"
        )}
        variant="filled"
        bg="#FFF"
        _hover={{}}
        _focus={{}}
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />

      <IconButton
        ml={2}
        onClick={() => {
          if (rari.web3.utils.isAddress(address)) {
            onSearch(address);
          } else {
            toast({
              title: "Error!",
              description: t("This is not a valid Ethereum address!"),
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          }
        }}
        icon={<SearchIcon />}
        bg="#FFF"
        boxSize="40px"
        aria-label="Search"
      />
    </Row>
  );
};

const TokenRSS = React.memo(({ address }: { address: string }) => {
  const tokenData = useTokenData(address);

  const rss = useRSS(address);

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
              {tokenData!.symbol ?? "NOT_A_TOKEN"}
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

export default RSSAssetsPage;

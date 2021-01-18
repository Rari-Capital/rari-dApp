import { Column } from "buttered-chakra";
import React from "react";
import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";
import ForceAuthModal from "../shared/ForceAuthModal";
import { Header } from "../shared/Header";
import { Text } from "@chakra-ui/react";

const useRSS = (address: string) => {
  const { data } = useQuery(address + " rss", () => {
    return fetch("/api/rss?address=" + address)
      .then((res) => res.json())
      .catch((e) => {
        console.log(e);
      }) as Promise<{ totalScore: number }>;
  });

  return data;
};

const RSSPage = React.memo(() => {
  const { isAuthed } = useRari();

  const { data: tokenList } = useQuery("topCoins", () => {
    return fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", {
      method: "post",

      body: JSON.stringify({
        query: `{
            tokens(first: 50, orderBy: tradeVolumeUSD, orderDirection: desc) {
              id
              symbol
            }
          }`,
      }),

      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => res.data.tokens) as Promise<
      { id: string; symbol: string }[]
    >;
  });

  return (
    <>
      <ForceAuthModal />

      <Header padding isAuthed={isAuthed} />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        color="#FFFFFF"
        p={4}
      >
        {isAuthed && tokenList
          ? tokenList.map((token) => (
              <TokenRSS
                key={token.id}
                address={token.id}
                symbol={token.symbol}
              />
            ))
          : null}
      </Column>
    </>
  );
});

const TokenRSS = React.memo(
  ({ address, symbol }: { address: string; symbol: string }) => {
    const rss = useRSS(address);

    return (
      <Text mt={2}>
        {symbol} - {rss ? rss.totalScore : "Loading.."}
      </Text>
    );
  }
);

export default RSSPage;

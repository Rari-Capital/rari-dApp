import { Avatar, Text } from "@chakra-ui/react";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";
import { Column, Row } from "lib/chakraUtils";
import { DEFAULT_SEARCH_RETURN } from "pages/api/search";
import React, { useCallback } from "react";
import { APISearchReturn } from "types/search";
import { intersect } from "utils/arrayUtils";
import { shortUsdFormatter } from "utils/bigUtils";
import AppLink from "../AppLink";
import AvatarWithBadge from "../Icons/AvatarWithBadge";

const SearchResults = ({
  results = DEFAULT_SEARCH_RETURN,
  hasResults,
  handleResultsClick,
  smaller,
  balances,
}: {
  results?: APISearchReturn;
  hasResults: boolean;
  handleResultsClick: () => void;
  smaller: boolean;
  balances?: { [address: string]: number };
}) => {
  const { tokens, fuse, tokensData, fuseTokensMap } = results;

  const renderFuseOpportunities = useCallback(() => {
    // Which token do we want to display for this fuse pool in the Searchbar?
    // 1.) Tokens you have a balance of 2.) Tokens you searched 3.) Any other token the pool supports
    const getDisplayedUnderlyingForFusePool = (
      supportedUnderlyings: string[],
      i: number
    ) => {
      // First find the intersection of the balances and the supportedUnderlyings to see if user has any of these tokens
      const intersection = intersect(
        Object.keys(balances ?? {}),
        supportedUnderlyings
      );
      // Alternate between logos
      return tokensData[
        intersection[i % intersection.length] ??
          supportedUnderlyings[i % supportedUnderlyings.length]
      ];
    };

    return fuse.map((fusePool, i: number) => {
      const route = `/fuse/pool/${fusePool.index}`;
      const supportedUnderlyings = fuseTokensMap[fusePool.comptroller];
      return (
        <AppLink href={route} w="100%" h="100%" key={i}>
          <Row
            p={2}
            pl={5}
            w="100%"
            h="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            key={i}
            _hover={{ bg: "grey" }}
            expand
            onClick={handleResultsClick}
            fontWeight={smaller ? "normal" : "bold"}
          >
            <AvatarWithBadge
              outerImage={
                getDisplayedUnderlyingForFusePool(supportedUnderlyings, i)
                  ?.logoURL
              }
              badgeImage="/static/fuseicon.png"
            />
            <Text ml={2}>{fusePool.name}</Text>
            {!smaller && (
              <Text ml={"auto"}>
                {shortUsdFormatter(fusePool.totalLiquidityUSD)} Liquidity
              </Text>
            )}
          </Row>
        </AppLink>
      );
    });
  }, [fuse, tokensData, fuseTokensMap, balances]);

  const renderTokens = useCallback(() => {
    return tokens.map((token, i: number) => {
      const route =
        token.id === ETH_TOKEN_DATA.address
          ? `/token/eth`
          : `/token/${token.id}`;
      return (
        <AppLink
          as={Row}
          href={route}
          w="100%"
          h="100%"
          key={i}
          p={2}
          pl={5}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          _hover={{ bg: "grey" }}
          expand
          onClick={handleResultsClick}
          fontWeight={smaller ? "normal" : "bold"}
        >
          <Avatar src={tokensData[token.id]?.logoURL} boxSize={8} />
          <Text ml={2}>{token.symbol}</Text>
          {!smaller && balances && balances[token.id] && (
            <Text ml={"auto"}>{balances[token.id].toFixed(2)}</Text>
          )}
        </AppLink>
      );
    });
  }, [tokens, tokensData, balances]);

  return (
    <Column
      position="relative"
      w="100%"
      h="100%"
      maxHeight={smaller ? "200px" : "300px"}
      minHeight="100px"
      color="black"
      fontWeight="bold"
      zIndex={2}
      top={0}
      left={0}
      boxShadow="0 4.5px 3.6px rgba(0, 0, 0, 0.08), 0 12.5px 10px rgba(0, 0, 0, 0.18)"
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="scroll"
    >
      {/* Tokens */}
      <Row
        pt={3}
        pl={2}
        mb={1}
        w="100%"
        h="100%"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        expand
        color="grey"
      >
        <Text ml={2} fontWeight="bold" fontSize="sm">
          Tokens
        </Text>
      </Row>
      {renderTokens()}

      <Row
        pt={3}
        pl={2}
        mb={1}
        w="100%"
        h="100%"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        expand
        color="grey"
      >
        <Text ml={2} fontSize="sm">
          Opportunities
        </Text>
      </Row>
      {renderFuseOpportunities()}
    </Column>
  );
};

export default SearchResults;

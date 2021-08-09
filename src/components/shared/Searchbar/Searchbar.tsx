import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Button,
  Collapse,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Spinner } from "@chakra-ui/spinner";
import AppLink from "../AppLink";

// Hooks
import useDebounce from "hooks/useDebounce";
import { useState } from "react";
import useSWR from "swr";

// Utils
import axios from "axios";
import { Column, Row } from "lib/chakraUtils";
import {
  CTokenSearchReturnWithTokenData,
  FinalSearchReturn,
} from "types/search";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";
import { useMemo } from "react";
import { DEFAULT_SEARCH_RETURN } from "pages/api/search";
import { shortUsdFormatter } from "utils/bigUtils";
import { useEffect } from "react";
import AvatarWithBadge from "../Icons/AvatarWithBadge";

// Fetchers
const searchFetcher = async (
  search: string
): Promise<FinalSearchReturn | undefined> => {
  if (!search) return undefined;
  return (await axios.get(`/api/search?query=${search}`)).data;
};

const Searchbar = ({
  width,
  height = "55px",
  smaller = false,
  ...inputProps
}: {
  width?: any;
  height?: any;
  smaller?: boolean;
  [x: string]: any;
}) => {
  const [val, setVal] = useState<string>("");
  const debouncedSearch = useDebounce(val, 200);

  const { data } = useSWR(debouncedSearch, searchFetcher);

  const hasResults = useMemo(() => {
    if (!val || !data) return false;
    // If any of the values in the `data` object has items, then we have some results.
    return Object.values(data).some((arr) => !!arr.length);
  }, [data, val]);

  const loading = !data;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      width="100%"
      position="relative"
      bg="white"
      border="4px solid"
      borderRadius="xl"
      borderColor="grey"
      zIndex={3}
      id="Searchbox"
    >
      <InputGroup width={width ?? "100%"} h={height}>
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={
            !!val && !!loading ? (
              <Spinner />
            ) : (
              <SearchIcon color="gray.300" boxSize={5} />
            )
          }
          ml={1}
          mr={2}
        />
        <Input
          height="100%"
          width="100%"
          placeholder="Search by token, pool or product..."
          _placeholder={{
            color: "grey",
            fontWeight: "bold",
            fontSize: smaller ? "sm" : "md",
            width: "100%",
          }}
          _focus={{ borderColor: "grey" }}
          onChange={({ target: { value } }) => setVal(value)}
          border="none"
          borderBottom={hasResults ? "1px solid grey" : ""}
          borderBottomRadius={hasResults ? "none" : "xl"}
          value={val}
          color="grey"
          {...inputProps}
        />
        {!smaller && (
          <Column
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            h="100%"
            width="100px"
            position="absolute"
            zIndex="5"
            right="0"
            mr={1}
          >
            <AppLink href="/explore">
              <Button
                colorScheme="purple"
                _hover={{ transform: "scale(1.04)" }}
              >
                Explore
              </Button>
            </AppLink>
          </Column>
        )}
      </InputGroup>
      <Collapse in={hasResults} unmountOnExit style={{ width: "100%" }}>
        <SearchResults
          results={data}
          handleClick={() => setVal("")}
          hasResults={hasResults}
          smaller={smaller}
        />
      </Collapse>

      {/* )} */}
    </Column>
  );
};

export default Searchbar;

const SearchResults = ({
  results = DEFAULT_SEARCH_RETURN,
  hasResults,
  handleClick,
  smaller,
}: {
  results?: FinalSearchReturn;
  hasResults: boolean;
  handleClick: () => void;
  smaller: boolean;
}) => {
  const { tokens, fuse, tokensData } = results;

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
      {tokens.map((token, i: number) => {
        const route =
          token.underlyingAddress === ETH_TOKEN_DATA.address
            ? `/token/eth`
            : `/token/${token.underlyingAddress}`;
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
              onClick={handleClick}
              fontWeight={smaller ? "normal" : "bold"}
            >
              <Avatar
                src={tokensData[token.underlyingAddress]?.logoURL}
                boxSize={8}
              />
              <Text ml={2}>{token.underlyingSymbol}</Text>
            </Row>
          </AppLink>
        );
      })}

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

      {fuse.map((fusePool, i: number) => {
        const route = `/fuse/pool/${fusePool.id}`;
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
              onClick={handleClick}
              fontWeight={smaller ? "normal" : "bold"}
            >
              <AvatarWithBadge
                outerImage={tokensData[tokens[0].underlyingAddress]?.logoURL}
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
      })}
    </Column>
  );
};

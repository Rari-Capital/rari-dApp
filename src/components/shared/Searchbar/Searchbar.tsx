import { SearchIcon } from "@chakra-ui/icons";
import { Avatar, Collapse, InputRightElement, Text } from "@chakra-ui/react";
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
  ...inputProps
}: {
  width?: any;
  height?: any;
  [x: string]: any;
}) => {
  const [val, setVal] = useState("");
  const debouncedSearch = useDebounce(val, 200);

  const { data } = useSWR(debouncedSearch, searchFetcher);

  const hasResults = useMemo(() => {
    if (!val || !data) return false;
    // If any of the values in the `data` object has items, then we have some results.
    return Object.values(data).some((arr) => !!arr.length);
  }, [data, val]);

  // const hasResults = !!val && !!data?.length;
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
      id="Searchbox"
    >
      <InputGroup
        width={width ?? ""}
        h={height}
        // pl={2}
      >
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
          mr={1}
        />
        <Input
          height="100%"
          width="100%"
          placeholder="Search by token, pool or product..."
          _placeholder={{ color: "grey", fontWeight: "bold" }}
          onChange={({ target: { value } }) => setVal(value)}
          border="none"
          borderBottom={hasResults ? "1px solid grey" : ""}
          borderBottomRadius={hasResults ? "none" : "xl"}
          value={val}
          color="grey"
          {...inputProps}
        />
        <InputRightElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={
            null
            // !!val ? loading ? <Spinner /> : null : null
            //  (
            //   <IconButton
            //     icon={<CloseIcon />}
            //     aria-label="Close"
            //     color="gray.300"
            //     bg="none"
            //     height=""
            //     _hover={{ cursor: "pointer" }}
            //     onClick={() => setVal("")}
            //   />
            // )
          }
          ml={1}
        />
      </InputGroup>
      {/* {hasResults && ( */}
      <Collapse in={hasResults} unmountOnExit style={{ width: "100%" }}>
        <SearchResults results={data} handleClick={() => setVal("")} />
      </Collapse>

      {/* )} */}
    </Column>
  );
};

export default Searchbar;

const SearchResults = ({
  results = DEFAULT_SEARCH_RETURN,
  handleClick,
}: {
  results?: FinalSearchReturn;
  handleClick: () => void;
}) => {
  const { tokens, fuse } = results;

  return (
    <Column
      position="relative"
      w="100%"
      h="100%"
      maxHeight="100px"
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
      {tokens.map((token, i: number) => {
        const route =
          token.underlyingAddress === ETH_TOKEN_DATA.address
            ? `/token/eth`
            : `/token/${token.underlyingAddress}`;
        return (
          <AppLink href={route} w="100%" h="100%" key={i}>
            <Row
              p={3}
              w="100%"
              h="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              key={i}
              _hover={{ bg: "grey" }}
              expand
              onClick={handleClick}
            >
              <Avatar src={token.tokenData.logoURL} boxSize={8} />
              <Text ml={2}>{token.underlyingSymbol}</Text>
            </Row>
          </AppLink>
        );
      })}
    </Column>
  );
};

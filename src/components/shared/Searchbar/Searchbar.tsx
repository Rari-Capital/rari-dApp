import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  IconButton,
  InputRightElement,
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
import { Column, Row } from "utils/chakraUtils";
import { FinalSearchReturn } from "types/search";
import { ETH_TOKEN_DATA } from "hooks/useTokenData";

// Fetchers
const searchFetcher = async (
  search: string
): Promise<FinalSearchReturn[] | undefined> => {
  if (!search) return undefined;
  return (await axios.get(`/api/search?query=${search}`)).data;
};

const Searchbar = ({
  width,
  ...inputProps
}: {
  width?: any;
  [x: string]: any;
}) => {
  const [val, setVal] = useState("");
  const debouncedSearch = useDebounce(val, 200);

  const { data } = useSWR(debouncedSearch, searchFetcher);

  const hasResults = !!val && !!data?.length;
  const loading = !data;

  return (
    <Box width={width ?? ""} position="relative">
      <InputGroup
        width="100%"
        h="55px"
        // pl={2}
      >
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={<SearchIcon color="gray.300" boxSize={5} />}
          ml={1}
        />
        <Input
          border="3px solid"
          borderColor="grey"
          height="100%"
          placeholder="Search by token, pool or product..."
          _placeholder={{ color: "grey", fontWeight: "bold" }}
          onChange={({ target: { value } }) => setVal(value)}
          value={val}
          color="grey"
          {...inputProps}
        />
        <InputRightElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={
            !!val ? loading ? <Spinner /> : null : null
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
      {hasResults && (
        <SearchResults results={data!} handleClick={() => setVal("")} />
      )}
    </Box>
  );
};

export default Searchbar;

const SearchResults = ({
  results,
  handleClick,
}: {
  results: FinalSearchReturn[];
  handleClick: () => void;
}) => {
  return (
    <Column
      position="absolute"
      w="100%"
      h="100%"
      maxHeight="100px"
      mt="55px"
      bg="white"
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
      {results.map((result: FinalSearchReturn, i: number) => {
        const route =
          result.underlyingAddress === ETH_TOKEN_DATA.address
            ? `/token/eth`
            : `/token/${result.underlyingAddress}`;
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
              <Avatar src={result.tokenData.logoURL} boxSize={8} />
              <Text ml={2}>{result.underlyingSymbol}</Text>
            </Row>
          </AppLink>
        );
      })}
    </Column>
  );
};

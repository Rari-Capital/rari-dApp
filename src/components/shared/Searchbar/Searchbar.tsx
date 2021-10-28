import { SearchIcon } from "@chakra-ui/icons";
import { Button, Collapse } from "@chakra-ui/react";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Spinner } from "@chakra-ui/spinner";
import AppLink from "../AppLink";

// Hooks
import useDebounce from "hooks/useDebounce";
import useSWR from "swr";

// Utils
import axios from "axios";
import { Column, useIsMobile } from "lib/chakraUtils";
import { APISearchReturn } from "types/search";
import { useMemo, useState } from "react";
import { useAccountBalances } from "context/BalancesContext";
import { useRari } from "context/RariContext";
import SearchResults from "./SearchResults";

// Fetchers
const searchFetcher = async (
  text: string,
  ...addresses: string[]
): Promise<APISearchReturn | undefined> => {
  let url = `/api/search`;

  if (!text && !addresses.length) return undefined;
  if (text) url += `?text=${text}`;
  if (addresses.length) {
    for (let i = 0; i < addresses.length; i++) {
      url += `${url.includes("?") ? "&" : "?"}address=${addresses[i]}`;
    }
  }

  // if (!text) return undefined;
  return (await axios.get(url)).data;
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
  const { isAuthed } = useRari();
  const isMobile = useIsMobile();

  const [val, setVal] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const [balances, balancesToSearchWith] = useAccountBalances();

  const debouncedSearch = useDebounce([val, ...balancesToSearchWith], 200);

  const { data } = useSWR(debouncedSearch, searchFetcher, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const hasResults = useMemo(() => {
    if (!data) return false;
    // If any of the values in the `data` object has items, then we have some results.
    return Object.values(data).some((arr) => !!arr.length);
  }, [data, val]);

  const loading = !data;
  const authedLoading = !data && isAuthed;

  // If it has results, and focused is true
  const shouldShowDropdown = hasResults && focused;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      width="100%"
      position="relative"
      bg="white"
      border={smaller ? "2px solid" : "4px solid"}
      borderRadius="xl"
      borderColor="grey"
      zIndex={2}
      id="Searchbox"
    >
      <InputGroup width={width ?? "100%"} h={height}>
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={
            // If there is a value typed in AND it is loading
            !!val && !!loading ? (
              <Spinner />
            ) : (
              <SearchIcon
                color={authedLoading ? "yellow.5  00" : "gray.300"}
                boxSize={5}
              />
            )
          }
          ml={1}
          mr={2}
        />
        <Input
          height="100%"
          width="100%"
          placeholder={
            isMobile ? "Search..." : "Search by token, pool or product..."
          }
          _placeholder={{
            color: "grey",
            fontWeight: "bold",
            fontSize: smaller
              ? "sm"
              : {
                  base: "sm",
                  sm: "sm",
                  md: "md",
                },
            width: "100%",
          }}
          _focus={{ borderColor: "grey" }}
          onChange={({ target: { value } }) => setVal(value)}
          border="none"
          borderBottom={shouldShowDropdown ? "1px solid grey" : ""}
          borderBottomRadius={hasResults ? "none" : "xl"}
          value={val}
          color="grey"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
              <Button colorScheme="green" _hover={{ transform: "scale(1.04)" }}>
                Explore
              </Button>
            </AppLink>
          </Column>
        )}
      </InputGroup>
      <Collapse in={shouldShowDropdown} unmountOnExit style={{ width: "100%" }}>
        <SearchResults
          results={data}
          handleResultsClick={() => setVal("")}
          hasResults={hasResults}
          smaller={smaller}
          balances={balances}
        />
      </Collapse>

      {/* )} */}
    </Column>
  );
};

export default Searchbar;

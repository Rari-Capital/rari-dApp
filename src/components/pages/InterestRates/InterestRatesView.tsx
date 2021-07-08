import { useEffect, useMemo, useState, createContext } from "react";

// Components
import { Box, Center, Flex, Heading, Spacer, Spinner } from "@chakra-ui/react";
import { Column } from "utils/chakraUtils";
// import InterestRatesRow from "./InterestRatesRow";
import MultiPicker from "./MultiPicker";
import TokenSearch from "./TokenSearch";
import InterestRatesTable from "./InterestRatesTable";

// Hooks
import { TokenData, fetchTokenData } from "hooks/useTokenData";
import useReserves from "hooks/interestRates/aave/useReserves";
import useCompoundMarkets from "hooks/interestRates/compound/useCompoundMarkets";
import useFuseMarkets from "hooks/interestRates/fuse/useFuseMarkets";
// import useTokensOrderedByMarketCap from "hooks/useTokensOrderedByMarketCap";

// Util
// import { fetchTokenMarketCapOrder } from "utils/coingecko";

// Types
import { MarketInfo } from "hooks/interestRates/types";
import { MergedPool } from "hooks/fuse/useFusePools";

export enum InterestRatesTableOptions {
  Lending = "lending",
  Borrowing = "borrowing",
}

type FuseMarket = {
  [id: string]: MarketInfo[];
};

type InterestRatesContextType = {
  selectedTable: InterestRatesTableOptions;
  tokens: TokenData[];
  fusePools?: MergedPool[];
  markets: {
    aave: MarketInfo[];
    compound: MarketInfo[];
    fuse: FuseMarket;
  };
  marketDataLoaded: boolean; // whether or not the market data has loaded
};
export const InterestRatesContext = createContext<InterestRatesContextType>({
  selectedTable: InterestRatesTableOptions.Lending,
  tokens: [],
  fusePools: [],
  markets: {
    aave: [],
    compound: [],
    fuse: {},
  },
  marketDataLoaded: false,
});

export default function InterestRatesView() {
  // name of table in view (current)
  const [tableName, setTableName] = useState<InterestRatesTableOptions>(
    InterestRatesTableOptions.Lending
  );
  // search term in TokenSearch component
  const [tokenSearchValue, setTokenSearchValue] = useState("");
  // information about each token
  const [tokenData, setTokenData] = useState<TokenData[]>([]);

  // Aave
  const aaveReserves = useReserves();
  // Compound
  const compoundMarkets = useCompoundMarkets();
  // Fuse
  const { pools: fusePools, markets: fuseMarkets } = useFuseMarkets();

  useEffect(() => {
    let isUnmounting = false;

    async function getTokenData() {
      // gather list of all tokens
      const allTokens = [
        ...aaveReserves.map((reserve) => reserve.tokenAddress),
        ...compoundMarkets.map((market) => market.tokenAddress),
      ];

      // add fuse pools if available
      if (fusePools)
        allTokens.push(
          ...fusePools.map((pool) => pool.underlyingTokens).flat()
        );

      // isolate unique tokens only
      const tokenAddresses = [...new Set(allTokens)];

      // fetch token data asynchronously
      const tokenDataList: TokenData[] = [];
      await Promise.all(
        tokenAddresses.map(async (address) => {
          tokenDataList.push(await fetchTokenDataWithCache(address));
        })
      );

      // sort token data
      tokenDataList.sort(
        (a, b) =>
          tokenAddresses.indexOf(a.address!) -
          tokenAddresses.indexOf(b.address!)
      );

      // set list in state if conditions are met
      if (!isUnmounting && tokenDataList.length === tokenAddresses.length)
        setTokenData(tokenDataList);
    }

    getTokenData();

    // set isUnmounting to true when unmounting
    return () => {
      isUnmounting = false;
    };
  }, [aaveReserves, compoundMarkets, setTokenData, fusePools]);

  // const orderedTokenData = useTokensOrderedByMarketCap(tokenData);

  // token list filtered by search term
  const filteredTokenData = useMemo(
    () =>
      tokenSearchValue === ""
        ? tokenData
        : tokenData // filter token by search term
            .filter(
              (token) =>
                token
                  .name!.toLowerCase()
                  .includes(tokenSearchValue.toLowerCase()) ||
                token
                  .symbol!.toLowerCase()
                  .includes(tokenSearchValue.toLowerCase())
            ),
    [tokenSearchValue, tokenData]
  );

  return (
    <InterestRatesContext.Provider
      value={{
        selectedTable: tableName,
        tokens: filteredTokenData,
        fusePools: fusePools,
        markets: {
          aave: aaveReserves,
          compound: compoundMarkets,
          fuse: fuseMarkets,
        },
        marketDataLoaded: aaveReserves.length > 0 && compoundMarkets.length > 0,
      }}
    >
      <Column
        width="100%"
        mainAxisAlignment="center"
        crossAxisAlignment="flex-start"
        mt="3"
        p={15}
      >
        {/* TODO (Zane): Add i18n */}
        <Heading size="lg" mb="5">
          Interest Rates
        </Heading>
        {tokenData.length === 0 ||
        !fusePools ||
        !fuseMarkets ||
        !aaveReserves ||
        !compoundMarkets ? (
          <Center w="100%" h="100px">
            <Spinner size="xl" />
          </Center>
        ) : (
          <>
            <Flex w="100%">
              <Box flex="3">
                <MultiPicker
                  options={{
                    lending: "Lending Rates",
                    borrowing: "Borrowing Rates",
                  }}
                  // set table on change
                  onChange={(value) =>
                    setTableName(value as InterestRatesTableOptions)
                  }
                />
              </Box>
              <Spacer flex="2" />
              <Box flex="3">
                <TokenSearch onChange={setTokenSearchValue} />
              </Box>
            </Flex>
            <Box mt="4" w="100%" position="relative">
              <InterestRatesTable />
            </Box>
          </>
        )}
      </Column>
    </InterestRatesContext.Provider>
  );
}

async function fetchTokenDataWithCache(address: string) {
  const storageKey = "tokenInfo:" + address;
  if (window.sessionStorage.getItem(storageKey)) {
    return JSON.parse(window.sessionStorage.getItem(storageKey) as string);
  }

  // if not in storage, fetch it fresh
  const tokenData = await fetchTokenData(address);
  window.sessionStorage.setItem(storageKey, JSON.stringify(tokenData));

  return tokenData;
}

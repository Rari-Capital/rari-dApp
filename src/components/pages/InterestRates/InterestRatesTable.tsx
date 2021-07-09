import { useContext, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

// Components
import { Avatar, Box, Link, Spinner } from "@chakra-ui/react";
import { Table, Td, Th, Tr, Thead, Tbody } from "@chakra-ui/table";
import { WindowTable } from "window-table";

// Context
import {
  InterestRatesContext,
  InterestRatesTableOptions,
} from "./InterestRatesView";

// Types
import { MarketInfo } from "hooks/interestRates/types";
import { TokenData } from "hooks/useTokenData";

const DEFAULT_COLUMNS: any = [
  {
    title: "Asset",
    key: "asset",
    width: 375,
    Component: AssetTitle,
  },
  {
    title: "Compound",
    key: "compound",
    width: 150,
    Component: PercentageComponent,
  },
  {
    title: "Aave",
    key: "aave",
    width: 150,
    Component: PercentageComponent,
  },
];

export default function InterestRatesTable() {
  const { fusePools, tokens, markets } = useContext(InterestRatesContext);

  const columns = useMemo(
    () => [
      ...DEFAULT_COLUMNS,
      ...(fusePools?.map((pool) => {
        return {
          key: pool.id.toString(),
          width: 150,
          title: pool.pool.name,
          Component: PercentageComponent,
        };
      }) || []),
    ],
    [fusePools]
  );

  const data = useMemo(
    () => [
      ...tokens.map((token) => {
        return {
          asset: JSON.stringify(token),
          compound: JSON.stringify(
            markets.compound.find(
              (market) => market.tokenAddress === token.address
            )
          ),
          aave: JSON.stringify(
            markets.aave.find((market) => market.tokenAddress === token.address)
          ),
          fuse: JSON.stringify(
            fusePools
              ?.map((pool) => {
                return {
                  id: pool.id.toString(),
                  marketInfo: markets.fuse[pool.id.toString()]?.find(
                    (market) => market.tokenAddress === token.address
                  ),
                };
              })
              // filter out empty items
              .filter(
                (item) =>
                  item.marketInfo && Object.keys(item.marketInfo).length !== 0
              )
          ),
        };
      }),
      // last couple items are here to add additional padding
      {
        asset: "NO_ASSET",
        compound: "",
        aave: "",
        fuse: "",
      },
      {
        asset: "NO_ASSET",
        compound: "",
        aave: "",
        fuse: "",
      },
    ],
    [tokens, fusePools, markets]
  );

  return (
    <Box w="100%" mt="5">
      <WindowTable
        Table={CustomTable}
        HeaderRow={Tr}
        Row={TableRow}
        HeaderCell={HeaderCell}
        Cell={TableCell}
        Header={Thead}
        Body={Tbody}
        columns={columns}
        data={data}
        rowHeight={55}
        style={{
          width: "100%",
          height: 600,
          position: "relative",
          overflowY: "hidden",
        }}
      ></WindowTable>
      {/* gradient at rightmost edge of scroll to hint at scrolling functionality */}
      <Box
        w="100px"
        h="100%"
        pointerEvents="none"
        position="absolute"
        background="linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)"
        // opacity={scrolledToEnd ? 0 : 1}
        transition="opacity 200ms ease"
        top={0}
        right={0}
        zIndex={2}
      />
    </Box>
  );
}

function CustomTable({ children, ...props }: any) {
  const { tokens } = useContext(InterestRatesContext);

  return (
    <Table {...props}>
      {children}
      {tokens.length === 0 ? (
        <Tbody>
          <Tr>
            <Td colSpan={10000}>No assets match your search.</Td>
          </Tr>
        </Tbody>
      ) : null}
    </Table>
  );
}

function TableCell({ children, column, ...props }: any) {
  return (
    <Td
      position={column.key === "asset" ? "sticky" : null}
      left={0}
      zIndex={2}
      {...props}
    >
      {children}
    </Td>
  );
}

function TableRow({ children, row, ...props }: any) {
  // NO_ASSET is for blank rows (added jankily to provide padding at the end of the list)
  return row.asset === "NO_ASSET" ? (
    <Tr {...props}>
      <Td colSpan={10000} userSelect="none" pointerEvents="none" border="none">
        &nbsp;
      </Td>
    </Tr>
  ) : (
    <Tr {...props}>{children}</Tr>
  );
}

function HeaderCell({ children, column, ...props }: any) {
  const poolLink = useMemo(() => {
    switch (column.key) {
      case "asset":
        return "";
      case "aave":
        return "https://app.aave.com/markets";
      case "compound":
        return "https://app.compound.finance/";
      default:
        // column.key is the pool ID for Fuse pools
        return "/fuse/pool/" + column.key;
    }
  }, [column.key]);

  return (
    // janky way to make exception for asset column
    <Th
      textAlign={column.key === "asset" ? "left" : "center"}
      position={column.key === "asset" ? "sticky" : null}
      color="#fff"
      {...props}
    >
      {column.key === "asset" ? (
        children
      ) : column.key === "aave" || column.key === "compound" ? (
        // external (out) links (Aave, Compound)
        <Link href={poolLink} isExternal={true}>
          {children}
        </Link>
      ) : (
        // internal router links (Fuse)
        <Link to={poolLink} as={RouterLink}>
          {children}
        </Link>
      )}
    </Th>
  );
}

function AssetTitle({ row, column }: any) {
  const asset = useMemo(
    () => JSON.parse(row[column.key] || "null") as TokenData | null,
    [row, column.key]
  );

  const [hasLogoLoaded, setHasLogoLoaded] = useState(false);

  return asset ? (
    <>
      <Spinner size="xs" hidden={hasLogoLoaded} />
      <Box hidden={!hasLogoLoaded}>
        <Avatar
          bg="#fff"
          borderWidth="1px"
          src={asset?.logoURL!}
          name={asset?.name!}
          size="xs"
          display="inline-block"
          mr="7px"
          position="relative"
          transform="translateY(-2px)"
          onLoad={() => setHasLogoLoaded(true)}
        />
        <strong>
          {shortenString(25, asset?.name!)} ({asset?.symbol})
        </strong>
      </Box>
    </>
  ) : (
    // no data yet, so show spinner
    <Spinner size="xs" />
  );
}

const shortenString = (length: number, str?: string) =>
  (str?.length || 0) <= length
    ? str
    : str?.substring(0, length).trim() + "\u2026";

function PercentageComponent({ row, column }: any) {
  const datum = useMemo(
    () =>
      column.key === "compound" || column.key === "aave"
        ? (JSON.parse(row[column.key] || "null") as MarketInfo | null)
        : // logic to get Fuse pool (sorry it's janky--it's 2 AM rip)
          (JSON.parse(row.fuse).find((item: any) => item.id === column.key)
            ?.marketInfo as MarketInfo),
    [row, column.key]
  );

  const { selectedTable } = useContext(InterestRatesContext);

  // current rate in view (either lending or borrowing)
  const rate = useMemo(
    () =>
      selectedTable === InterestRatesTableOptions.Lending
        ? datum?.rates.lending
        : datum?.rates.borrowing,
    [selectedTable, datum]
  );

  return (
    <div style={{ textAlign: "center", width: "100%", height: "100%" }}>
      {datum ? formatPercentage(rate as number) : "\u2013"}
    </div>
  );
}

// format percentage with 2 decimal places
const formatPercentage = (rate: number) => (rate * 100).toFixed(2) + "%";

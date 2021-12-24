import { Table, Thead, Tr, Th, Tbody } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTable, useSortBy } from "react-table";

import { useFusePools } from "hooks/fuse/useFusePools";
import { useFusePoolsData } from "hooks/useFusePoolData";

import { smallUsdFormatter } from "utils/bigUtils";
import { filterPoolName, FusePoolData } from "utils/fetchFusePoolData";

import PoolTr from "./PoolTr";
import { thStyle } from "./styles";

type TableRow = {
  name: string;
  supplied: number;
  borrowed: number;
};

/**
 * Displays the pools in which the currently-authed user has an active position
 * in.
 */
const PoolsTable = () => {
  const { t } = useTranslation();
  const { filteredPools: myPools } = useFusePools("my-pools");
  const poolIds: number[] = useMemo(
    () => myPools?.map(({ id }) => id) ?? [],
    [myPools]
  );
  const fusePoolsData: FusePoolData[] | null = useFusePoolsData(poolIds);

  // Based on Chakra UI + React Table example here:
  // https://chakra-ui.com/guides/integrations/with-react-table

  const columns = useMemo(
    () => [
      // Add casts to `TableRow` due to this issue:
      // https://github.com/tannerlinsley/react-table/discussions/2664
      {
        Header: t("Fuse Pool"),
        accessor: "name" as keyof TableRow,
        isNumeric: false,
      },
      {
        Header: t("Supplied"),
        accessor: "supplied" as keyof TableRow,
        isNumeric: true,
      },
      {
        Header: t("Borrowed"),
        accessor: "borrowed" as keyof TableRow,
        isNumeric: true,
      },
    ],
    [t]
  );

  const data = useMemo(() => {
    const poolsData = [...(fusePoolsData ?? [])];

    return (myPools ?? []).map<TableRow>((pool, index) => {
      const poolData = fusePoolsData?.[index];

      return {
        name: filterPoolName(pool.name),
        supplied: poolData?.totalSupplyBalanceUSD,
        borrowed: poolData?.totalBorrowBalanceUSD,
      };
    });
  }, [myPools, fusePoolsData]);

  // TODO(nathanhleung) fix react-table integration
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<TableRow>({ columns, data });

  return (
    <Table variant="simple" {...getTableProps()}>
      <Thead>
        {headerGroups.map((headerGroup) => (
          <Tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => {
              <Th style={thStyle} {...column.getHeaderProps()}>
                {column.render("Header")}
                {(column as any).isSorted ? (
                  (column as any).isSortedDesc ? (
                    <TriangleDownIcon aria-label="sorted descending" />
                  ) : (
                    <TriangleUpIcon aria-label="sorted ascending" />
                  )
                ) : null}
              </Th>;
            })}
            <Th style={thStyle} />
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {myPools.map((pool, index) => {
          const fusePoolData = fusePoolsData?.[index];

          return fusePoolData ? (
            <PoolTr key={pool.id} pool={pool} poolData={fusePoolData} />
          ) : null;
        })}
      </Tbody>
    </Table>
  );
};

export default PoolsTable;

import { Table, Thead, Tr, Th, Tbody } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTable, useSortBy } from "react-table";

import { useFusePools } from "hooks/fuse/useFusePools";
import { useFusePoolsData } from "hooks/useFusePoolData";

import { filterPoolName, FusePoolData } from "utils/fetchFusePoolData";

import PoolTr from "./PoolTr";
import { thStyle } from "./styles";
import { TableRow } from "./types/react-table-config";

/**
 * Displays the pools in which the currently-authed user has an active position.
 * Uses React Table to make the table sortable.
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
    return (myPools ?? []).map<TableRow>((pool, index) => {
      const poolData = fusePoolsData?.[index];

      return {
        name: filterPoolName(pool.name),
        supplied: poolData?.totalSupplyBalanceUSD ?? 0,
        borrowed: poolData?.totalBorrowBalanceUSD ?? 0,
        poolData,
      };
    });
  }, [myPools, fusePoolsData]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<TableRow>(
      {
        columns,
        data,
        // Prevent "Maximum update depth" error
        // https://github.com/tannerlinsley/react-table/issues/2369#issuecomment-644481605
        autoResetSortBy: false,
        initialState: {
          hiddenColumns: ["poolData"],
        },
      },
      useSortBy
    );

  return (
    <Table variant="simple" {...getTableProps()}>
      <Thead>
        {headerGroups.map((headerGroup) => (
          <Tr {...headerGroup.getHeaderGroupProps()}>
            <Th style={thStyle} />
            {headerGroup.headers.map((column) => (
              <Th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
              >
                {column.render("Header")}&nbsp;
                {column.isSorted ? (
                  column.isSortedDesc ? (
                    <TriangleDownIcon aria-label="sorted descending" />
                  ) : (
                    <TriangleUpIcon aria-label="sorted ascending" />
                  )
                ) : null}
              </Th>
            ))}
            <Th style={thStyle} />
          </Tr>
        ))}
      </Thead>
      <Tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);

          return <PoolTr row={row} key={row.id} />;
        })}
      </Tbody>
    </Table>
  );
};

export default PoolsTable;

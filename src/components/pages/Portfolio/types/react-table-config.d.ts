// See https://github.com/tannerlinsley/react-table/issues/2970
// for why this file is necessary.

import {
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByHooks,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
} from "react-table";

import { FusePoolData } from "utils/fetchFusePoolData";

declare module "react-table" {
  export interface TableOptions<D extends Record<string, unknown>>
    extends UseSortByOptions<D> {}

  export interface Hooks<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseSortByHooks<D> {}

  export interface TableInstance<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseSortByInstanceProps<D> {}

  export interface TableState<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseSortByState<D> {}

  export interface ColumnInterface<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseSortByColumnOptions<D> {}

  export interface ColumnInstance<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseSortByColumnProps<D> {}
}

export interface TableRow {
  name: string;
  supplied: number;
  borrowed: number;
  poolData?: FusePoolData;
}

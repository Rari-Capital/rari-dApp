import { useCallback, useState } from "react";
import {
  ChevronDownIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";

interface IObject {
  [x: string]: any;
}

export type SortDir = "asc" | "desc";

// Returns the sort icon based on whether this column is actively sorted and sort dir
export const getSortIcon = (isActive: boolean, sortDir?: SortDir) => {
  // If inactive, render ChevronDownArrow
  if (!isActive) return ChevronDownIcon;
  // If actively sorting desc, render TriangleDownIcon
  if (sortDir === "desc") return TriangleDownIcon;
  // If actively sorting asc, render TriangleDownIcon
  else if (sortDir === "asc") return TriangleUpIcon;
  else return ChevronDownIcon;
};

// Helpers for sortable list
export const useSortableList = <T extends IObject>(items: Array<T> = []) => {
  const [sortBy, setSortBy] = useState<keyof T>();
  const [sortDir, setSortDir] = useState<SortDir | undefined>();

  const handleSortClick = useCallback(
    (sortKey: keyof T) => {
      // We're already sorting on this key, flip the direction
      if (sortBy === sortKey) {
        // undefined -> "asc" -> "desc" -> undefined
        const newSortDir = !sortDir
          ? "asc"
          : sortDir === "asc"
          ? "desc"
          : undefined;
        setSortDir(newSortDir);
      } else {
        setSortBy(sortKey);
        setSortDir("asc");
      }
    },
    [setSortDir, setSortBy, sortBy, sortDir]
  );

  const sorted = sortItems(items, sortBy, sortDir);
  return { sorted, handleSortClick, sortBy, sortDir };
};

// Sorts an object array
export const sortItems = <T extends IObject>(
  items: Array<T> = [],
  key?: keyof T,
  dir?: SortDir
) => {
  if (
    !key || // no key specified
    !items.length || // empty array
    typeof items[0][key] === typeof {} // value is not a number or string
  ) {
    return items;
  }

  if (dir === "asc") return items.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  if (dir === "desc") return items.sort((a, b) => (a[key] < b[key] ? 1 : -1));
  return items;
};

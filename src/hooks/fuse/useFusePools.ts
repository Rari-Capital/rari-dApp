import { useMemo } from "react";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "lib/rari-sdk/index";
import Fuse from "lib/fuse-sdk";
import FuseJs from "fuse.js";

import { filterOnlyObjectProperties } from "utils/fetchFusePoolData";
import { formatDateToDDMMYY } from "utils/api/dateUtils";
import { blockNumberToTimeStamp } from "utils/web3Utils";
import { fetchCurrentETHPrice, fetchETHPriceAtDate } from "utils/coingecko";

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  isPrivate: boolean;
}

export interface MergedPool {
  id: number;
  pool: FusePool;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  suppliedUSD: number;
  borrowedUSD: number;
}

const poolSort = (pools: MergedPool[]) => {
  return pools.sort((a, b) => {
    if (b.suppliedUSD > a.suppliedUSD) {
      return 1;
    }

    if (b.suppliedUSD < a.suppliedUSD) {
      return -1;
    }

    // They're equal, let's sort by pool number:

    return b.id > a.id ? 1 : -1;
  });
};

export const fetchPools = async ({
  rari,
  fuse,
  address,
  filter,
  blockNum,
}: {
  rari: Rari;
  fuse: Fuse;
  address: string;
  filter: string | null;
  blockNum?: number;
}) => {
  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";

  // We need the latest blockNumber
  const latestBlockNumber = await fuse.web3.eth.getBlockNumber();
  const _blockNum = blockNum ? blockNum : latestBlockNumber;

  // Get the unix timestamp of the blockNumber
  const startBlockTimestamp = await blockNumberToTimeStamp(
    fuse.web3,
    _blockNum
  );

  const ddMMYYYY = formatDateToDDMMYY(new Date(startBlockTimestamp * 1000));

  const fetchETHPrice = blockNum
    ? fetchETHPriceAtDate(ddMMYYYY)
    : fetchCurrentETHPrice();

  const [
    {
      0: ids,
      1: fusePools,
      2: totalSuppliedETH,
      3: totalBorrowedETH,
      4: underlyingTokens,
      5: underlyingSymbols,
    },
    ethPrice,
  ] = await Promise.all([
    isMyPools
      ? fuse.contracts.FusePoolLens.methods
          .getPoolsBySupplierWithData(address)
          .call({ gas: 1e18 }, _blockNum)
      : isCreatedPools
      ? fuse.contracts.FusePoolLens.methods
          .getPoolsByAccountWithData(address)
          .call({ gas: 1e18 }, _blockNum)
      : fuse.contracts.FusePoolLens.methods
          .getPublicPoolsWithData()
          .call({ gas: 1e18 }, _blockNum),
    fetchETHPrice,
  ]);

  const merged: MergedPool[] = [];
  for (let id = 0; id < ids.length; id++) {
    merged.push({
      // I don't know why we have to do this but for some reason it just becomes an array after a refetch for some reason, so this forces it to be an object.
      underlyingTokens: underlyingTokens[id],
      underlyingSymbols: underlyingSymbols[id],
      pool: filterOnlyObjectProperties(fusePools[id]),
      id: ids[id],
      suppliedUSD: (totalSuppliedETH[id] / 1e18) * parseFloat(ethPrice),
      borrowedUSD: (totalBorrowedETH[id] / 1e18) * parseFloat(ethPrice),
    });
  }

  return merged;
};

export interface UseFusePoolsReturn {
  pools: MergedPool[] | undefined;
  filteredPools: MergedPool[] | null;
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (filter: string | null): UseFusePoolsReturn => {
  const { fuse, rari, address } = useRari();

  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";

  const { data: pools } = useQuery(
    address + " fusePoolList" + (isMyPools || isCreatedPools ? filter : ""),
    async () => await fetchPools({ rari, fuse, address, filter })
  );

  const filteredPools = useMemo(() => {
    if (!pools) {
      return null;
    }

    if (!filter) {
      return poolSort(pools);
    }

    if (isMyPools || isCreatedPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ["pool.name", "id", "underlyingTokens", "underlyingSymbols"],
      threshold: 0.3,
    };

    const filtered = new FuseJs(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isMyPools, isCreatedPools]);

  return { pools, filteredPools };
};

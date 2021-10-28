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

interface LensFusePool {
  blockPosted: string;
  name: string;
  creator: string;
  comptroller: string;
  timestampPosted: string;
}

interface LensFusePoolData {
  totalBorrow: string;
  totalSupply: string;
  underlyingSymbols: string[];
  underlyingTokens: string[];
  whitelistedAdmin: boolean;
}

export type LensPoolsWithData = [
  ids: string[],
  fusePools: LensFusePool[],
  fusePoolsData: LensFusePoolData[],
  errors: boolean[]
];



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
  filter?: string;
  blockNum?: number
}) => {
  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";
  const isNonWhitelistedPools = filter === "unverified-pools";

  console.log({blockNum})

  const req = isMyPools
    ? fuse.contracts.FusePoolLens.methods
        .getPoolsBySupplierWithData(address)
        .call({ gas: 1e18 })
    : isCreatedPools
    ? fuse.contracts.FusePoolLens.methods
        .getPoolsByAccountWithData(address)
        .call({ gas: 1e18 })
    : isNonWhitelistedPools
    ? fuse.contracts.FusePoolLens.methods
        .getPublicPoolsByVerificationWithData(false)
        .call({ gas: 1e18 })  
    : fuse.contracts.FusePoolLens.methods
        .getPublicPoolsByVerificationWithData(true)
        .call({ gas: 1e18 });

  const {
    0: ids,
    1: fusePools,
    2: fusePoolsData,
    3: errors,
  }: LensPoolsWithData = await req;

  const ethPrice = await rari.web3.utils.fromWei(await rari.getEthUsdPriceBN());

  const merged: MergedPool[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = parseFloat(ids[i]);
    const fusePool = fusePools[i];
    const fusePoolData = fusePoolsData[i];

    const mergedPool = {
      id,
      suppliedUSD:
        (parseFloat(fusePoolData.totalSupply) / 1e18) * parseFloat(ethPrice),
      borrowedUSD:
        (parseFloat(fusePoolData.totalBorrow) / 1e18) * parseFloat(ethPrice),
      ...filterOnlyObjectProperties(fusePool),
      ...filterOnlyObjectProperties(fusePoolData),
    };

    merged.push(mergedPool);
  }

  return merged;
};

interface UseFusePoolsReturn {
  pools: MergedPool[] | undefined;
  filteredPools: MergedPool[];
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (filter?: string): UseFusePoolsReturn => {
  const { fuse, rari, address } = useRari();

  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";

  const { data: pools } = useQuery(
    address + " fusePoolList" + (isMyPools || isCreatedPools ? filter : ""),
    async () => await fetchPools({ rari, fuse, address, filter })
  );

  const filteredPools = useMemo(() => {
    if (!pools) {
      return [];
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

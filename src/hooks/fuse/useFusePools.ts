import { useMemo } from "react";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "rari-sdk/index";
import Fuse from "fuse-sdk";
import FuseJs from "fuse.js";
import { filterOnlyObjectProperties } from "utils/fetchFusePoolData";

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  isPrivate: boolean;
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

export interface MergedPool extends LensFusePoolData, LensFusePool {
  id: number;
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
}: {
  rari: Rari;
  fuse: Fuse;
  address: string;
  filter?: string;
}) => {
  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";
  const isNonWhitelistedPools = filter === "unverified-pools";

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
        .getPublicPoolsWithData()
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
export const useFusePools = (
  filter?: "my-pools" | "created-pools" | string
): UseFusePoolsReturn => {
  const { fuse, rari, address } = useRari();

  const isMyPools = filter === "my-pools";
  const isCreatedPools = filter === "created-pools";
  // const isWhitelistedPools = filter ==="verified-pools"
  const isNonWhitelistedPools = filter === "unverified-pools";

  const { data: pools } = useQuery(
    address +
      " fusePoolList" +
      (isMyPools || isCreatedPools || isNonWhitelistedPools ? filter : ""),
    async () => await fetchPools({ rari, fuse, address, filter })
  );

  const filteredPools = useMemo(() => {

    if (!pools?.length) {
      return [];
    }

    if (!filter) {
      return poolSort(pools);
    }

    if (isMyPools || isCreatedPools || isNonWhitelistedPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ["pool.name", "id", "underlyingTokens", "underlyingSymbols"],
      threshold: 0.3,
    };

    const filtered = new FuseJs(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isMyPools, isCreatedPools, isNonWhitelistedPools]);

  return { pools, filteredPools };
};

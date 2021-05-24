import { useMemo } from "react";
import { useQuery, useQueries } from "react-query";

import { useRari } from "../context/RariContext";
import {
  fetchFusePoolData,
  FusePoolData,
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "../utils/fetchFusePoolData";
import { useAssetsArrayWithTokenData } from "./useAssetsMap";

export const useFusePoolData = (
  poolId: string | undefined
): FusePoolData | undefined => {
  const { fuse, rari, address } = useRari();

  const { data } = useQuery(poolId + " poolData " + address, () => {
    return fetchFusePoolData(poolId, address, fuse, rari);
  });

  return data;
};

// Fetch APYs for all pools
export const useFusePoolsData = (poolIds: number[]): FusePoolData[] | null => {
  const { fuse, rari, address } = useRari();

  const poolsData = useQueries(
    poolIds.map((id: number) => {
      return {
        queryKey: id + " apy",
        queryFn: () => {
          return fetchFusePoolData(id.toString(), address, fuse, rari);
        },
      };
    })
  );

  // Get Fuse Pools Data
  const fusePoolsData: FusePoolData[] | null = useMemo(() => {
    // todo - use type FusePoolData
    const ret: any[] = [];

    // if (!poolsData.length) return null;

    poolsData.forEach(({ data }, i) => {
      if (!data) return null;
      const _data = data as FusePoolData;
      ret.push({
        ..._data,
        id: poolIds[i],
      });
    });

    // if (!ret.length) return null;

    return ret;
  }, [poolsData, poolIds]);


  // Get all the asset arrays for each pool
  const assetsArray: USDPricedFuseAsset[][] | null =
    fusePoolsData?.map((pool) => pool?.assets) ?? null;

  // Construct a hashmap of all the unique assets and their respective tokendata
  const {
    assetsArrayWithTokenData,
  }: {
    assetsArrayWithTokenData: USDPricedFuseAssetWithTokenData[][] | null;
  } = useAssetsArrayWithTokenData(assetsArray);

  return useMemo(() => {
    if (assetsArrayWithTokenData && fusePoolsData) {
      return fusePoolsData.map((fusePoolData, i) => ({
        ...fusePoolData,
        assets: assetsArrayWithTokenData[i],
      }));
    }

    return fusePoolsData;
  }, [fusePoolsData, assetsArrayWithTokenData]);
};

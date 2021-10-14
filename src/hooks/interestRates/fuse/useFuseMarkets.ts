import { useEffect, useState } from "react";

// Hooks
import { useRari } from "context/RariContext";
import { useFusePools } from "hooks/fuse/useFusePools";

// Util
import { fetchFusePoolData, FusePoolData } from "utils/fetchFusePoolData";
import { convertMantissaToAPY } from "utils/apyUtils";

// Types
import { MarketInfo } from "../types";

type FuseMarket = {
  [id: string]: MarketInfo[];
};

export default function useFuseMarkets() {
  const { rari, fuse, address } = useRari();
  const { pools } = useFusePools();
  const [markets, setMarkets] = useState<FuseMarket>({});

  useEffect(() => {
    async function getAllFusePoolData() {
      let marketData: FuseMarket = {};

      if (pools) {
        await Promise.all(
          pools.map(async (pool) => {
            marketData[pool.id.toString()] = [];

            try {
              // fetch fuse pool data
              const poolData = (await fetchFusePoolData(
                pool.id.toString(), // type incorrectly believes pool.id to be number
                address,
                fuse,
                rari
              )) as FusePoolData;

              // add market info
              poolData.assets.forEach((asset) => {
                marketData[pool.id.toString()].push({
                  tokenAddress: asset.underlyingToken,
                  rates: {
                    lending:
                      convertMantissaToAPY(asset.supplyRatePerBlock, 365) / 100,
                    borrowing:
                      convertMantissaToAPY(asset.borrowRatePerBlock, 365) / 100,
                  },
                });
              });
            } catch (e) {
              // replace with empty array in case of error
              marketData[pool.id.toString()] = [];
            }
          })
        );

        // set data in state
        setMarkets(marketData);
      }
    }

    getAllFusePoolData();
  }, [pools, rari, fuse, address]);

  return { pools, markets };
}

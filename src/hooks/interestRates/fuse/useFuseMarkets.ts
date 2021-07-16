import { useEffect, useState } from "react";

// Hooks
import { useRari } from "context/RariContext";
import { useFusePools } from "hooks/fuse/useFusePools";

// Util
import { fetchFusePoolData, FusePoolData } from "utils/fetchFusePoolData";
import { convertMantissaToAPY, convertMantissaToAPR } from "utils/apyUtils";

// Types
import { MarketInfo } from "../types";

type FuseMarket = {
  [id: string]: MarketInfo[];
};

export default function useFuseMarkets() {
  const { rari, fuse, address } = useRari();
  const { pools } = useFusePools(null);
  const [markets, setMarkets] = useState<FuseMarket>({});

  useEffect(() => {
    async function getAllFusePoolData() {
      let marketData: FuseMarket = {};

      if (pools) {
        await Promise.all(
          pools.map(async (pool) => {
            marketData[pool.id.toString()] = [];

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
                    convertMantissaToAPR(asset.borrowRatePerBlock) / 100,
                },
              });
            });
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

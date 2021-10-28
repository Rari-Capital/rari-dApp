import { NextApiRequest, NextApiResponse } from "next";

// GQL
import { TokensDataMap } from "types/tokens";
import { initFuseWithProviders, providerURL } from "utils/web3Providers";
import Web3 from "web3";
import Rari from "lib/rari-sdk";
import { fetchPools } from "hooks/fuse/useFusePools";
import { EmptyAddress } from "context/RariContext";
import {
  fetchFusePoolData,
  FusePoolData,
  USDPricedFuseAsset,
} from "utils/fetchFusePoolData";
import { fetchTokensAPIDataAsMap } from "utils/services";
import redis from "utils/redis";

// Types
export interface ExploreAsset extends USDPricedFuseAsset {
  fusePool: Pick<
    FusePoolData,
    | "id"
    | "name"
    | "totalBorrowedUSD"
    | "totalSuppliedUSD"
    | "totalLiquidityUSD"
  >;
}

export type APIBestOpportunityData = {
  bestAsset: ExploreAsset;
};

export type APIBestOpportunityReturn = {
  bestOpportunity: APIBestOpportunityData;
  tokensData: TokensDataMap;
};

const REDIS_KEY_PREFIX = "explore-bestopportunity-";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBestOpportunityReturn | undefined>
) {
  if (req.method === "GET") {
    const { address } = req.query;

    // // If no search, return
    if (address && typeof address !== "string")
      return res.status(400).json(undefined);

    try {
      // Redis query
      const redisKey = REDIS_KEY_PREFIX + address;
      const redisSearchData = await redis.get(redisKey);
      // If we found Redis data, then send it
      if (!!redisSearchData) {
        console.log("found redis data. returning", redisKey);
        return res
          .status(200)
          .json(JSON.parse(redisSearchData) as APIBestOpportunityReturn);
      }

      // Get Underlying Assets from subgraph
      // Set up SDKs
      const web3 = new Web3(providerURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(providerURL);

      const fusePools = await fetchPools({
        rari,
        fuse,
        address: EmptyAddress,
        filter: "",
      });

      const poolIndices = fusePools
        .filter((pool) => !!pool.underlyingTokens.length) // filter out empty pools
        .map((pool) => pool.id.toString());

      const fusePoolsData = (await Promise.all(
        poolIndices.map((poolIndex) =>
          fetchFusePoolData(poolIndex, EmptyAddress, fuse, rari)
        )
      )) as FusePoolData[];

      if (!fusePoolsData) return res.status(400);

      const bestOpportunity: APIBestOpportunityData =
        iterateThroughFusePoolData(fusePoolsData!, address);

      // Get TokenData (logo, color etc) from Rari API
      const tokensData: TokensDataMap = await fetchTokensAPIDataAsMap([
        address,
      ]);

      const returnObj = {
        bestOpportunity,
        tokensData,
      };

      // Save results to redis every 10 minutes
      await redis.set(redisKey, JSON.stringify(returnObj), "EX", 1800);
      console.log("set redis key", redisKey);

      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(400);
    }
  }
}

const iterateThroughFusePoolData = (
  fusePoolsData: FusePoolData[],
  address: string
): APIBestOpportunityData => {
  let bestAssetIndices: [number, number] = [0, 0];

  // Iterate through literally everything bro
  for (let i = 0; i < fusePoolsData.length; i++) {
    const fusePool = fusePoolsData[i];

    if (fusePool.assets.length) {
      for (let j = 0; j < fusePool.assets.length; j++) {
        const asset = fusePool.assets[j];
        if (
          asset.underlyingToken === address &&
          assetOverLiquidityThreshold(asset) &&
          asset.supplyRatePerBlock >
            getAsset(...bestAssetIndices, fusePoolsData).supplyRatePerBlock
        ) {
          bestAssetIndices = [i, j];
        }
      }
    }
  }

  // finally, return the data
  return {
    bestAsset: constructAsset(bestAssetIndices, fusePoolsData),
  };
};

const constructAsset = (
  [i, j]: [number, number],
  fusePools: FusePoolData[]
): ExploreAsset => ({
  ...fusePools[i].assets[j],
  fusePool: {
    id: fusePools[i].id,
    name: fusePools[i].name,
    totalLiquidityUSD: fusePools[i].totalLiquidityUSD,
    totalBorrowedUSD: fusePools[i].totalBorrowedUSD,
    totalSuppliedUSD: fusePools[i].totalSuppliedUSD,
  },
});

const getAsset = (
  i: number,
  j: number,
  fusePoolsData: FusePoolData[]
): USDPricedFuseAsset => fusePoolsData[i].assets[j];

const assetOverLiquidityThreshold = (asset: USDPricedFuseAsset) =>
  asset.liquidityUSD > 20000;

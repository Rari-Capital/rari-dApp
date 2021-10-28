import { NextApiRequest, NextApiResponse } from "next";
import { queryAllUnderlyingAssets } from "services/gql";
import { RariApiTokenData, TokensDataMap, UnderlyingAsset } from "types/tokens";

import redis from "utils/redis";
import { fetchTokensAPIDataAsMap } from "utils/services";
import { SubgraphUnderlyingAsset } from ".";

export interface AllAssetsResponse {
  assets: SubgraphUnderlyingAsset[];
  tokensData: { [address: string]: RariApiTokenData };
}

const REDIS_KEY_PREFIX = "explore-";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllAssetsResponse>
) {
  if (req.method === "GET") {
    // Get Underlying Assets from subgraph
    try {
      console.log("yo");

      // Redis query
      const redisKey = REDIS_KEY_PREFIX + "assets";
      const redisSearchData = await redis.get(redisKey);
      // If we found Redis data, then send it
      if (!!redisSearchData) {
        console.log("found redis data. returning", redisKey);
        return res
          .status(200)
          .json(JSON.parse(redisSearchData) as AllAssetsResponse);
      }

      const underlyingAssets = await queryAllUnderlyingAssets();

      // Get TokenData (logo, color etc) from Rari API
      const tokensDataMap: TokensDataMap = await fetchTokensAPIDataAsMap(
        underlyingAssets.map((asset) => asset.id)
      );

      const result = {
        assets: underlyingAssets,
        tokensData: tokensDataMap,
      };

      // Save results to redis every 30 minutes
      await redis.set(redisKey, JSON.stringify(result), "EX", 1800);
      console.log("set redis key", redisKey);

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400);
    }
  }
}

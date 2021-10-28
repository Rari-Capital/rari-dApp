import { NextApiRequest, NextApiResponse } from "next";
import { APISearchReturn, GQLSearchReturn } from "types/search";

import { fetchTokensAPIDataAsMap } from "utils/services";

import redis from "../../utils/redis";
import {
  querySearchForToken,
  querySearchForTokenByAddresses,
} from "services/gql";
import { GQLFusePool, GQLUnderlyingAsset } from "types/gql";

export const DEFAULT_SEARCH_RETURN: APISearchReturn = {
  tokens: [],
  fuse: [],
  fuseTokensMap: {},
  tokensData: {},
};

const REDIS_KEY_PREFIX = "search-";

// Takes a search string, makes a graphql request, then stitches on the TokenData by making a second API request
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APISearchReturn | undefined>
) {
  if (req.method === "GET") {
    const { text, address } = req.query;

    // // If no search, return
    if (text && typeof text !== "string")
      return res.status(400).json(undefined);

    const addresses = [];
    if (address !== undefined) {
      if (typeof address === "string") {
        addresses.push(address);
      } else addresses.push(...address);
    }

    try {
      let gqlsearchResults: GQLUnderlyingAsset[] = [];
      const redisKey = REDIS_KEY_PREFIX + text;

      // If we explicitly provided a text input, search with this text
      if (text) {
        // Check redis first
        const redisSearchData = await redis.get(redisKey);
        // If we found Redis data, then send that

        if (!!redisSearchData) {
          console.log("found redis data. returning", redisKey);
          return res
            .status(200)
            .json(JSON.parse(redisSearchData) as APISearchReturn);
        }

        // Make the GQL Request to perform the search for tokens that exist
        const { underlyingAssets: searchTokens }: GQLSearchReturn =
          await querySearchForToken(text);

        if (!searchTokens) return res.status(400).send(undefined);
        if (!searchTokens.length) return res.json(DEFAULT_SEARCH_RETURN);
        gqlsearchResults = searchTokens;
      }

      // If there is no text input but we did provide addresses, then use these addresses to search
      else if (addresses.length) {
        // Make the GQL Request to perform the search for tokens that exist
        const { underlyingAssets: balanceTokens } =
          await querySearchForTokenByAddresses(addresses);

        if (!balanceTokens) return res.status(400).send(undefined);
        if (!balanceTokens.length) return res.json(DEFAULT_SEARCH_RETURN);
        gqlsearchResults = balanceTokens;
      }

      // We are now going to fetch the tokenData and Fuse Pool Data
      const [tokensDataMap] = await Promise.all([
        fetchTokensAPIDataAsMap(gqlsearchResults.map((asset) => asset.id)),
      ]);

      /** Get Fuse Data **/

      // Maps a Fuse Pool's address to an array of its underlyingToken Addresses
      const fuseTokensMap: { [comptroller: string]: string[] } = {};
      // A unique list of fuse pools among the returned tokens
      const fusePoolsSet = new Set<GQLFusePool>();

      // Construct a map of which fuse pools have which assets of the returned search assets
      gqlsearchResults.forEach((result) => {
        result.pools?.forEach((pool) => {
          if (pool) {
            if (!fuseTokensMap[pool.comptroller])
              fuseTokensMap[pool.comptroller] = [];
            // If the Array of underlying assets for this fuse pool already has this
            if (!fuseTokensMap[pool.comptroller].includes(result.id))
              fuseTokensMap[pool.comptroller] = [
                ...fuseTokensMap[pool.comptroller],
                result.id,
              ];

            fusePoolsSet.add(pool);
          }
        });
      });

      // Return only the top 3 fuse pools
      const sortedFusePools = [...Array.from(fusePoolsSet)].sort((a, b) =>
        b.totalLiquidityUSD > a.totalLiquidityUSD ? 1 : -1
      );

      const searchResults: APISearchReturn = {
        tokens: gqlsearchResults.slice(0, 3),
        fuse: sortedFusePools.slice(0, 3),
        fuseTokensMap,
        tokensData: tokensDataMap,
      };

      // Save results to redis every 15 minutes
      if (text) {
        await redis.set(redisKey, JSON.stringify(searchResults), "EX", 900);
        console.log("set redis key", redisKey);
      }

      return res.status(200).json(searchResults);
    } catch (err) {
      console.error(err);
      return res.status(500);
    }
  }
}

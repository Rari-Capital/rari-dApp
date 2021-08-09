import { NextApiRequest, NextApiResponse } from "next";
import { RariApiTokenData } from "types/tokens";
import {
  FinalSearchReturn,
  GQLSearchReturn,
  UnderlyingAssetSearchReturn,
} from "types/search";

import {
  SEARCH_FOR_TOKEN,
  SEARCH_FOR_TOKENS_BY_ADDRESSES,
} from "gql/searchTokens";
import { makeGqlRequest } from "utils/gql";
import { fetchTokensAPIDataAsMap } from "utils/services";
import axios from "axios";
import {
  filterFusePoolsByToken,
  filterFusePoolsByTokens,
} from "hooks/fuse/useFuseDataForAsset";
import { FusePoolData } from "utils/fetchFusePoolData";

export const DEFAULT_SEARCH_RETURN: FinalSearchReturn = {
  tokens: [],
  fuse: [],
  tokensData: {},
};

// Takes a search string, makes a graphql request, then stitches on the TokenData by making a second API request
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FinalSearchReturn | undefined>
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
      let gqlsearchResults: UnderlyingAssetSearchReturn[] = [];

      // If we explicitly provided a text input, search with this
      if (text) {
        // Make the GQL Request to perform the search for tokens that exist
        const { underlyingAssets: searchTokens }: GQLSearchReturn =
          await makeGqlRequest(SEARCH_FOR_TOKEN, {
            search: text.toUpperCase(),
          });

        if (!searchTokens) return res.status(400).send(undefined);
        if (!searchTokens.length) return res.json(DEFAULT_SEARCH_RETURN);
        gqlsearchResults = searchTokens;
      }

      // If there is no text input but we did provide addresses, then use this to search
      else if (addresses.length) {
        // Make the GQL Request to perform the search for tokens that exist
        const { underlyingAssets: balanceTokens }: GQLSearchReturn =
          await makeGqlRequest(SEARCH_FOR_TOKENS_BY_ADDRESSES, {
            addresses,
          });

        if (!balanceTokens) return res.status(400).send(undefined);
        if (!balanceTokens.length) return res.json(DEFAULT_SEARCH_RETURN);
        gqlsearchResults = balanceTokens;
      }

      // We are now going to stitch the tokenData from the API onto the searchData received
      const tokensDataMap: { [address: string]: RariApiTokenData } =
        await fetchTokensAPIDataAsMap(
          gqlsearchResults.map((asset) => asset.id)
        );

      const fusePools = await getFusePoolsByToken(gqlsearchResults[0].id);

      // Return only the top 3 fuse pools
      const sortedFusePools = fusePools.sort((a, b) =>
        b.totalLiquidityUSD > a.totalLiquidityUSD ? 1 : -1
      );

      const searchResults: FinalSearchReturn = {
        tokens: gqlsearchResults.slice(0, 3),
        fuse: sortedFusePools.slice(0, 2),
        tokensData: tokensDataMap,
      };

      return res.status(200).json(searchResults);
    } catch (err) {
      console.error(err);
      return res.status(500);
    }
  }
}

export const getFusePoolsByToken = async (tokenAddress: string) => {
  const { data } = await axios.get("https://beta.rari.capital/api/fuse/pools");
  const { pools } = data;
  const filteredPools = filterFusePoolsByToken(pools, tokenAddress);
  return filteredPools;
};

import { NextApiRequest, NextApiResponse } from "next";
import { RariApiTokenData } from "types/tokens";
import {
  CTokenSearchReturnWithTokenData,
  FinalSearchReturn,
  GQLSearchReturn,
} from "types/search";

import { SEARCH_FOR_TOKEN } from "gql/searchTokens";
import { makeGqlRequest } from "utils/gql";
import { fetchTokensAPIDataAsMap } from "utils/services";
import axios from "axios";
import { filterFusePoolsByToken } from "hooks/fuse/useFuseDataForAsset";
import { FusePoolData } from "utils/fetchFusePoolData";

export const DEFAULT_SEARCH_RETURN: FinalSearchReturn = {
  tokens: [],
  fuse: [],
  tokensData: {},
};

// Takes a search string, makes a graphql request, then stitches on the TokenData by making a second API request
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FinalSearchReturn>
) {
  if (req.method === "GET") {
    const { query } = req.query;

    // If no search, return
    if (!query || typeof query !== "string") return res.status(400);

    try {
      // Make the GQL Request to perform the search for tokens that exist
      const searchTokens: GQLSearchReturn = await makeGqlRequest(
        SEARCH_FOR_TOKEN,
        {
          search: query.toUpperCase(),
        }
      );

      if (!searchTokens) return res.status(400);
      if (!searchTokens.markets.length) return res.json(DEFAULT_SEARCH_RETURN);

      // We are now going to stitch the tokenData from the API onto the searchData received
      const tokensDataMap: { [address: string]: RariApiTokenData } =
        await fetchTokensAPIDataAsMap(
          searchTokens.markets.map((cToken) => cToken.underlyingAddress)
        );

      // Finally, stitch the tokendata onto the search results
      const stitchedSearchTokens: CTokenSearchReturnWithTokenData[] =
        searchTokens.markets.map((cToken) => ({
          ...cToken,
          tokenData: tokensDataMap[cToken.underlyingAddress],
        }));

      const fusePools = await getFusePoolsByToken(
        searchTokens.markets[0].underlyingAddress
      );

      // Return only the top 3 fuse pools
      const sortedFusePools = fusePools
        .sort((a, b) => (b.totalLiquidityUSD > a.totalLiquidityUSD ? 1 : -1))
        .slice(0, 3);

      const searchResults: FinalSearchReturn = {
        tokens: stitchedSearchTokens,
        fuse: sortedFusePools,
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

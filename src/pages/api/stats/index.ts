import { NextApiRequest, NextApiResponse } from "next";
import { RariApiTokenData } from "types/tokens";
import { FinalSearchReturn, GQLSearchReturn } from "types/search";

import { SEARCH_FOR_TOKEN } from "gql/searchTokens";
import { makeGqlRequest } from "utils/gql";
import {
  fetchTokensAPIDataAsMap,
} from "utils/services";

// Takes a search string, makes a graphql request, then stitches on the TokenData by making a second API request
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { query } = req.query;

    // If no search, return
    if (!query || typeof query !== "string") return res.send(400);

    try {
      // Make the GQL Request to perform the search
      const searchData: GQLSearchReturn = await makeGqlRequest(
        SEARCH_FOR_TOKEN,
        {
          search: query.toUpperCase(),
        }
      );

      if (!searchData) return res.send(400);
      if (!searchData.markets.length) return res.json([]);

      // We are now going to stitch the tokenData from the API onto the searchData received
      const tokensDataMap: { [address: string]: RariApiTokenData } =
        await fetchTokensAPIDataAsMap(searchData.markets.map((cToken) => cToken.underlyingAddress));

      // Finally, stitch the tokendata onto the search results
      const stitchedData: FinalSearchReturn[] = searchData.markets.map(
        (cToken) => ({
          ...cToken,
          tokenData: tokensDataMap[cToken.underlyingAddress],
        })
      );

      return res.status(200).json(stitchedData);
    } catch (err) {
      console.error(err);
      return res.status(500);
    }
  }
}

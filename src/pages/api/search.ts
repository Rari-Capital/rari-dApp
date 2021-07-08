import { FinalSearchReturn, GQLSearchReturn } from "types/search";
import { SEARCH_FOR_TOKEN } from "gql/searchTokens";
import { NextApiRequest, NextApiResponse } from "next";
import { makeGqlRequest } from "utils/gql";
import { fetchTokenAPIData } from "utils/services";
import { RariApiTokenData } from "types/tokens";

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
      const uniqueAddresses: string[] = Array.from(
        new Set(searchData.markets.map((cToken) => cToken.underlyingAddress))
      );

      const fetchers = uniqueAddresses.map((addr) =>
        fetchTokenAPIData(addr).then(({ data }) => data as RariApiTokenData)
      );

      const tokenDatas: RariApiTokenData[] = await Promise.all(fetchers);

      // construct a map for easy lookups
      const tokenDataMap: { [address: string]: RariApiTokenData } = {};
      for (let i: number = 0; i < uniqueAddresses.length; i++) {
        tokenDataMap[uniqueAddresses[i]] = tokenDatas[i];
      }

      // Finally, stitch the tokendata onto the search results
      const stitchedData: FinalSearchReturn[] = searchData.markets.map(
        (cToken) => ({
          ...cToken,
          tokenData: tokenDataMap[cToken.underlyingAddress],
        })
      );

      return res.status(200).json(stitchedData);
    } catch (err) {
      console.error(err);
      return res.status(500);
    }
  }
}

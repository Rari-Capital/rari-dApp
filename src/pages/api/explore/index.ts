import { GET_ALL_UNDERLYING_ASSETS } from "gql/getAllUnderlyingAssets";
import {
  RariApiTokenData,
  UnderlyingAsset,
  UnderlyingAssetWithTokenData,
} from "types/tokens";
import { makeGqlRequest } from "utils/gql";
import { fetchTokensAPIDataAsMap } from "utils/services";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    // Get Underlying Assets from subgraph
    try {

        console.log("MAKING GQL")

      const { underlyingAssets }: { underlyingAssets: UnderlyingAsset[] } =
        await makeGqlRequest(GET_ALL_UNDERLYING_ASSETS, {});

        console.log("FETCHED UNDERLYINGASSETS")

      // Get TokenData (logo, color etc) from Rari API
      const tokensDataMap: { [address: string]: RariApiTokenData } =
        await fetchTokensAPIDataAsMap(
          underlyingAssets.map((asset) => asset.id)
        );

        console.log("CREATED tokensDataMap")

      // Stitch tokenData onto underlyingAssets
      const finalUnderlyingAssets: UnderlyingAssetWithTokenData[] =
        underlyingAssets.map((asset) => ({
          ...asset,
          tokenData: tokensDataMap[asset.id],
        }));

      console.log({ finalUnderlyingAssets });

      return res.status(200).json(finalUnderlyingAssets);
    } catch (err) {
      return res.status(400);
    }
  }
}

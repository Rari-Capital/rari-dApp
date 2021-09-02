import { GET_EXPLORE_DATA } from "gql/getExploreData";
import { APIExploreData, SubgraphCToken } from "pages/api/explore";
import { TokensDataMap } from "types/tokens";
import { makeGqlRequest } from "utils/gql";
import { fetchTokensAPIDataAsMap } from "utils/services";
import axios, { AxiosResponse } from "axios";

interface GQLExploreData {
  topEarningFuseAsset: SubgraphCToken[];
  mostPopularFuseAsset: SubgraphCToken[];
  mostBorrowedFuseAsset: SubgraphCToken[];
  topEarningFuseStable: SubgraphCToken[];
  cheapestStableBorrow: SubgraphCToken[];
}

export const getExploreData = async (): Promise<APIExploreData> => {
  const data: APIExploreData = await axios.get("/api/explore");
  return data;

  try {
    const { data }: { data: GQLExploreData } = await makeGqlRequest(
      GET_EXPLORE_DATA
    );

    console.log({ data });

    const topEarningFuseAsset = data.topEarningFuseAsset[0];
    const mostPopularFuseAsset = data.mostPopularFuseAsset[0];
    const mostBorrowedFuseAsset = data.mostBorrowedFuseAsset[0];
    const topEarningFuseStable = data.topEarningFuseStable[0];
    const cheapestStableBorrow = data.cheapestStableBorrow[0];

    const addresses = [];
    addresses.push(
      topEarningFuseStable.underlying.address,
      topEarningFuseAsset.underlying.address,
      mostPopularFuseAsset.underlying.address,
      mostBorrowedFuseAsset.underlying.address,
      cheapestStableBorrow.underlying.address
    );

    //   Get tokensdata
    const tokensData: TokensDataMap = await fetchTokensAPIDataAsMap(addresses);

    const results = {
      topEarningFuseStable,
      topEarningFuseAsset,
      mostPopularFuseAsset,
      mostBorrowedFuseAsset,
      cheapestStableBorrow,
    };

    const returnObj: APIExploreData = {
      results,
      tokensData,
    };

    return returnObj;
  } catch (err) {
    console.error(err);

    const results: APIExploreData = await axios.get("/api/explore");
    return results;
  }
};

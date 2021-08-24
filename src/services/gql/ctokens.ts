import { GET_TOP_PERFORMING_FUSE_ASSET } from "gql/getTopPerformingFuseAsset";
import { GET_TOP_PERFORMING_FUSE_ASSET_OF_UNDERLYING } from "gql/getTopPerformingFuseStable";
import {
  SubgraphCToken,
} from "pages/api/explore";
import { makeGqlRequest } from "utils/gql";

// Returns a single Fuse Asset that matches the highest score of the search criteria
export const queryTopFuseAsset = async (
    orderBy: string,
    orderDirection: "asc" | "desc",
    addresses?: string[]
  ): Promise<SubgraphCToken> => {
    const query = addresses?.length
      ? GET_TOP_PERFORMING_FUSE_ASSET_OF_UNDERLYING
      : GET_TOP_PERFORMING_FUSE_ASSET;
  
    const vars = {
      orderBy,
      orderDirection,
      addresses,
    };
  
    const { ctokens } = await makeGqlRequest(query, vars);
  
    const ctoken: SubgraphCToken = ctokens?.[0];
  
    return ctoken;
  };
  
  // Returns a list of Fuse Assets that matches the search criteria
  export const queryFuseAssets = async (
    orderBy: string,
    orderDirection: "asc" | "desc",
    limit: number = 1
  ): Promise<SubgraphCToken[]> => {
    const query = GET_TOP_PERFORMING_FUSE_ASSET;
  
    const vars = {
      orderBy,
      orderDirection,
      limit,
    };
  
    const { ctokens } = await makeGqlRequest(query, vars);
  
    return ctokens;
  };
  

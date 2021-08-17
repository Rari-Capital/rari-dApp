import { GET_ALL_UNDERLYING_ASSETS } from "gql/getAllUnderlyingAssets";
import { GET_POOLS_BY_IDS } from "gql/getFusePools";
import { GET_TOP_PERFORMING_FUSE_ASSET } from "gql/getTopPerformingFuseAsset";
import { GET_TOP_PERFORMING_FUSE_ASSET_OF_UNDERLYING } from "gql/getTopPerformingFuseStable";
import {
  SEARCH_FOR_TOKEN,
  SEARCH_FOR_TOKENS_BY_ADDRESSES,
} from "gql/searchTokens";
import {
  SubgraphCToken,
  SubgraphPool,
  SubgraphUnderlyingAsset,
} from "pages/api/explore";
import { GQLSearchReturn } from "types/search";
import { makeGqlRequest } from "utils/gql";

export const queryAllUnderlyingAssets = async (): Promise<
  SubgraphUnderlyingAsset[]
> => {
  const { underlyingAssets } = await makeGqlRequest(GET_ALL_UNDERLYING_ASSETS);
  return underlyingAssets;
};

export const querySearchForToken = async (
  text: string
): Promise<GQLSearchReturn> =>
  await makeGqlRequest(SEARCH_FOR_TOKEN, {
    search: text.toUpperCase(),
  });

export const querySearchForTokenByAddresses = async (
  addresses: string[]
): Promise<GQLSearchReturn> =>
  await makeGqlRequest(SEARCH_FOR_TOKENS_BY_ADDRESSES, {
    addresses,
  });

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

export const queryFusePools = async (
  ids: number[]
): Promise<SubgraphPool[]> => {
  const { pools } = await makeGqlRequest(GET_POOLS_BY_IDS, { ids });
  return pools;
};

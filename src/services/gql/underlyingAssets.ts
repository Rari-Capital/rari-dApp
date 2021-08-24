
import { GET_ALL_UNDERLYING_ASSETS } from "gql/getAllUnderlyingAssets";
import {
  SEARCH_FOR_TOKEN,
  SEARCH_FOR_TOKENS_BY_ADDRESSES,
} from "gql/searchTokens";
import {
  SubgraphUnderlyingAsset,
} from "pages/api/explore";
import { GQLSearchReturn } from "types/search";
import { makeGqlRequest } from "utils/gql";

// Gets all UnderlyingAssets
export const queryAllUnderlyingAssets = async (): Promise<
  SubgraphUnderlyingAsset[]
> => {
  const { underlyingAssets } = await makeGqlRequest(GET_ALL_UNDERLYING_ASSETS);
  return underlyingAssets;
};

// Searches for an UnderlyingAsset by its underlying symbol
export const querySearchForToken = async (
  text: string
): Promise<GQLSearchReturn> =>
  await makeGqlRequest(SEARCH_FOR_TOKEN, {
    search: text.toUpperCase(),
  });


// Searches for UnderlyingAssets by their addresses
export const querySearchForTokenByAddresses = async (
  addresses: string[]
): Promise<GQLSearchReturn> =>
  await makeGqlRequest(SEARCH_FOR_TOKENS_BY_ADDRESSES, {
    addresses,
  });
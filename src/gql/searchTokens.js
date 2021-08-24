import { gql } from "graphql-tag";
import { UnderlyingAssetFragment } from "./fragments";

export const SEARCH_FOR_TOKEN = gql`
 query SearchForTokenBySymbol($search: String!) {
    underlyingAssets(where: { symbol_contains: $search } orderBy:symbol) {
      ...UnderlyingAssetFragment
    }
  }
  ${UnderlyingAssetFragment}
`;

export const SEARCH_FOR_TOKENS_BY_ADDRESSES = gql`
  query SearchForTokensByAddresses($addresses: [ID!]!) {
    underlyingAssets(where: { id_in: $addresses }) {
      id
      name
      price
      symbol
    }
  }
  ${UnderlyingAssetFragment}
`;

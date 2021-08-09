import { gql } from "graphql-tag";

export const SEARCH_FOR_TOKEN = gql`
 query SearchForTokenBySymbol($search: String!) {
    underlyingAssets(where: { symbol_contains: $search } orderBy:symbol) {
      id
      name
      price
      symbol
    }
  }
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
`;

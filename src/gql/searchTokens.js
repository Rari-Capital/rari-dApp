import { gql } from "graphql-tag";

export const SEARCH_FOR_TOKEN = gql`
  query SearchForToken($search: String!) {
    markets(where: { underlyingSymbol_contains: $search }, first: 1) {
      id
      underlyingSymbol
      underlyingAddress
      underlyingDecimals
      underlyingName
    }
  }
`;

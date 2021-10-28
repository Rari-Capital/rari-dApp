import { gql } from "graphql-tag";
import { FusePoolFragment, UnderlyingAssetFragment } from "./fragments";

export const SEARCH_FOR_TOKEN = gql`
  query SearchForTokenBySymbol($search: String!) {
    underlyingAssets(where: { symbol_contains: $search }, orderBy: symbol) {
      ...UnderlyingAssetFragment
      pools {
        ...FusePoolFragment
      }
    }
  }
  ${UnderlyingAssetFragment}
  ${FusePoolFragment}
`;

export const SEARCH_FOR_TOKENS_BY_ADDRESSES = gql`
  query SearchForTokensByAddresses($addresses: [ID!]!) {
    underlyingAssets(where: { id_in: $addresses }) {
      ...UnderlyingAssetFragment
      pools {
        ...FusePoolFragment
      }
    }
  }
  ${UnderlyingAssetFragment}
  ${FusePoolFragment}
`;

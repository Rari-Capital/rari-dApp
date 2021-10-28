import gql from "graphql-tag";
import {
  CTokenFragment,
  FusePoolFragment,
  UnderlyingAssetFragment,
} from "../fragments";

export const GET_CTOKEN_BY_IDS = gql`
  query GetCtokenByUnderlyingAddresses($ids: [String!]) {
    ctokens(where: { underlying_in: $ids }) {
      ...CTokenFragment
      pool {
        ...FusePoolFragment
      }
      underlying {
        ...UnderlyingAssetFragment
      }
    }
  }
  ${CTokenFragment}
  ${FusePoolFragment}
  ${UnderlyingAssetFragment}
`;
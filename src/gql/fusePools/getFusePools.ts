import gql from "graphql-tag";
import { CTokenFragment, FusePoolFragment, UnderlyingAssetFragment } from "../fragments";

export const GET_POOLS_BY_IDS = gql`
  query GetPoolsByIds($ids: [BigInt!]!) {
    pools(orderBy: index, orderDirection: asc, where: { index_in: $ids }) {
      ...FusePoolFragment
      assets {
        ...CTokenFragment
        underlying {
          ...UnderlyingAssetFragment
        }
      }
    }
  }
  ${CTokenFragment}
  ${FusePoolFragment}
  ${UnderlyingAssetFragment}
`;

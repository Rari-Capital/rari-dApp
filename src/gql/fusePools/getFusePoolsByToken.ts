import gql from "graphql-tag";
import { CTokenFragment, FusePoolFragment } from "../fragments";

export const GET_POOLS_BY_IDS = gql`
  query GetPoolsByIndices($indices: [BigInt!]!) {
    pools(orderBy: index, orderDirection: asc, where: { index_in: $indices }) {
      ...FusePoolFragment
      assets {
        ...CTokenFragment
      }
    }
  }
  ${FusePoolFragment}
  ${CTokenFragment}
`;

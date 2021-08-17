import { gql } from "graphql-tag";
import { CTokenFragment } from "./fragments";

// TODO: Use GQL Fragments
export const GET_TOP_PERFORMING_FUSE_ASSET = gql`
  query GetTopPerformingFuseAsset(
    $orderBy: Ctoken_orderBy = supplyAPY
    $orderDirection: OrderDirection! = desc
    $liquidityThreshold: BigInt = 10000
    $limit: Int = 1
  ) {
    ctokens(
      where: {liquidityUSD_gte: $liquidityThreshold}
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $limit
    ) {
      ...CToken
    }
  }
  ${CTokenFragment}
`;

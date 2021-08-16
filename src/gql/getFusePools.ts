import gql from "graphql-tag";
import { CTokenFragment } from "./fragments";

export const GET_POOLS_BY_IDS = gql`
  query GetPoolsByIds($ids: [BigInt!]!) {
    pools(orderBy: index, orderDirection: asc, where: { index_in: $ids }) {
      index
      totalBorrowUSD
      totalSupplyUSD
      totalLiquidityUSD
      name
      closeFactor
      comptroller
      id
      maxAssets
      liquidationIncentive
      priceOracle
      address
      assets {
        ...CToken
      }
    }
  }

  ${CTokenFragment}
`;

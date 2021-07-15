import { gql } from "graphql-tag";

export const GET_FUSE_POOL_WITH_MARKET_IDS = gql`
  query GetPoolWithMarketIds($marketIds: [String!]) {
    pools(where: { markets_contains: $marketIds }) {
      id
      index
    }
  }
`;

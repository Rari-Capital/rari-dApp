import { gql } from "graphql-tag";
import { CTokenFragment } from "./fragments";

export const stables = [
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
  "0x6b175474e89094c44da98b954eedeac495271d0f",
];

// TODO: Use GQL Fragments
export const GET_TOP_PERFORMING_FUSE_ASSET_OF_UNDERLYING = gql`
  query GetMostPopularAssetByUnderlying(
    $orderBy: Ctoken_orderBy = supplyAPY
    $orderDirection: OrderDirection! = desc
    $liquidityThreshold: BigInt = 10000
    $addresses: [String!]!
  ) {
    ctokens(
      where: {
        underlying_in: $addresses,
        liquidityUSD_gte: $liquidityThreshold
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: 1
    ) {
      ...CToken
    }
  }
  ${CTokenFragment}
`;

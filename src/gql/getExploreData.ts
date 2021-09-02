import { gql } from "graphql-tag";
import { FuseAssetFragment } from "./fragments";

export const GET_EXPLORE_DATA = gql`
  query GetExploreData(
    $liquidityThreshold: BigInt = 10000
    $stables: [String!] = [
      "0xdac17f958d2ee523a2206206994597c13d831ec7"
      "0xa47c8bf37f92abed4a126bda807a7b7498661acd"
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      "0x956f47f50a910163d8bf957cf5846d573e7f87ca"
      "0x6b175474e89094c44da98b954eedeac495271d0f"
    ]
  ) {
    topEarningFuseAsset: ctokens(
      where: { liquidityUSD_gte: $liquidityThreshold }
      orderBy: supplyAPY
      orderDirection: desc
      first: 1
    ) {
      ...FuseAssetFragment
    }
    mostPopularFuseAsset: ctokens(
      where: { liquidityUSD_gte: $liquidityThreshold }
      orderBy: liquidityUSD
      orderDirection: desc
      first: 1
    ) {
      ...FuseAssetFragment
    }
    mostBorrowedFuseAsset: ctokens(
      where: { liquidityUSD_gte: $liquidityThreshold }
      orderBy: totalBorrowUSD
      orderDirection: desc
      first: 1
    ) {
      ...FuseAssetFragment
    }
    topEarningFuseStable: ctokens(
      where: { liquidityUSD_gte: $liquidityThreshold, underlying_in: $stables }
      orderBy: supplyAPY
      orderDirection: desc
      first: 1
    ) {
      ...FuseAssetFragment
    }
    cheapestStableBorrow: ctokens(
      where: { liquidityUSD_gte: $liquidityThreshold, underlying_in: $stables }
      orderBy: borrowAPR
      orderDirection: asc
      first: 1
    ) {
      ...FuseAssetFragment
    }
  }
  ${FuseAssetFragment}
`;

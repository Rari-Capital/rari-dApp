import { gql } from "graphql-tag";


// Gets most popular asset
// TODO: Use GQL Fragments
export const GET_MOST_POPULAR_FUSE_ASSET = gql`
query GetMostPopularAsset($orderBy: Market_orderBy! = "supplyRate", $orderDirection: OrderDirection! ="desc"){
  markets(orderBy: $orderBy, first: 1, orderDirection: $orderDirection) {
      id
      supplyRate
      borrowRate
      symbol
      totalBorrows
      totalSupply
      name
      borrowIndex
      underlyingAddress
      underlyingSymbol
      underlyingDecimals    	
      underlyingPrice
  }
}
`;

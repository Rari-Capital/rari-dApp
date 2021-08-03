
import { gql } from "graphql-tag";


// TODO: Use GQL Fragments
export const GET_TOP_PERFORMING_FUSE_STABLE = gql`
  query GetMostPopularStable($orderBy: Market_orderBy! = supplyRate, $orderDirection: OrderDirection! = desc){
    markets(
      where: { underlyingSymbol_in: ["USDC", "DAI", "FEI"] }
      orderBy: $orderBy,
      orderDirection: $orderDirection
      first: 1
    ) {
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

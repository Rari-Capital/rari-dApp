import gql from "graphql-tag";

export const CTokenFragment = gql`
  fragment CToken on Ctoken {
    id
    name
    symbol
    supplyRatePerBlock
    borrowRatePerBlock
    supplyAPY
    borrowAPR
    liquidity
    liquidityUSD
    totalSupply
    totalBorrow
    totalSupplyUSD
    totalBorrowUSD
    adminFee
    fuseFee
    reserveFactor
    underlyingBalance
    underlying {
      symbol
      name
      id
      decimals
      address
    }
    pool {
      id
      name
      index
      comptroller
      address
      totalBorrowUSD
      totalLiquidityUSD
      totalSupplyUSD
    }
  }
`;

export const UnderlyingAssetFragment = gql`
  fragment UnderlyingAsset on UnderlyingAsset {
    address
    id
    name
    price
    symbol
    totalBorrow
    totalBorrowUSD
    totalLiquidity
    totalLiquidityUSD
    totalSupply
    totalSupplyUSD
  }
`;

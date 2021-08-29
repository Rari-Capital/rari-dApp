import gql from "graphql-tag";

export const CTokenFragment = gql`
  fragment CTokenFragment on Ctoken {
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
  }
`;

export const UnderlyingAssetFragment = gql`
  fragment UnderlyingAssetFragment on UnderlyingAsset {
    address
    id
    name
    price
    symbol
    decimals
    totalBorrow
    totalBorrowUSD
    totalLiquidity
    totalLiquidityUSD
    totalSupply
    totalSupplyUSD
  }
`;

export const FusePoolFragment = gql`
  fragment FusePoolFragment on Pool {
    address
    closeFactor
    comptroller
    id
    index
    maxAssets
    liquidationIncentive
    name
    priceOracle
    totalBorrowUSD
    totalLiquidityUSD
    totalSupplyUSD
  }
`;

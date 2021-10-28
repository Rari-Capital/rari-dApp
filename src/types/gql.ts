export interface GQLCToken {
  id: string;
  name: string;
  symbol: string;
  supplyRatePerBlock: number;
  borrowRatePerBlock: number;
  supplyAPY: number;
  borrowAPR: number;
  liquidity: number;
  liquidityUSD: number;
  totalSupply: number;
  totalBorrow: number;
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  adminFee: number;
  fuseFee: number;
  reserveFactor: number;
  underlyingBalance: number;
  underlying? : GQLUnderlyingAsset;
  pool?: GQLFusePool;
}

export interface GQLUnderlyingAsset {
  address: string;
  id: string;
  name: string;
  symbol: string;
  price: number;
  totalBorrow: number;
  totalBorrowUSD: number;
  totalLiquidity: number;
  totalLiquidityUSD: number;
  totalSupply: number;
  totalSupplyUSD: number;
  pools?: GQLFusePool[];
  ctokens?: GQLCToken[];
}

export interface GQLFusePool {
  address: string;
  closeFactor: number;
  comptroller: string;
  id: string;
  index: number;
  maxAssets: number;
  liquidationIncentive: number;
  name: string;
  priceOracle: string;
  totalBorrowUSD: number;
  totalLiquidityUSD: number;
  totalSupplyUSD: number;
  assets?: GQLCToken[];
}

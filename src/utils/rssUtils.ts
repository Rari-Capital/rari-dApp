import { USDPricedFuseAsset } from "./fetchFusePoolData";

export interface rssAsset extends USDPricedFuseAsset {
    scores: {
      overall: number;
      historical: number;
      crash: number;
      volatility: number;
      liquidity: number;
    } | false;
    comptroller: any;
}

export type resultSet = {
  TOKEN0DOWN: number
}

export type point = {
  reserve0: number;
  reserve1: number;
  token0Price: number;
  token1Price: number;
  blocknumber: number;
}

export type score = {
  symbol: string;
  g: number;
  h: number;
  c: number;
  v: number;
  l: number;
}

export function biggerblockno (a: { blockno: number }, b: { blockno: number }) {
  if (a.blockno > b.blockno)
    return 1;
  else if (a.blockno < b.blockno)
    return -1;
  else
    return 0;
}

export async function parse (data: any[]) {
  return await Promise.all(data.map(async (raw_point): Promise<point> => {
    let point: point = {
      blocknumber: raw_point.block,
      token0Price: raw_point.data.token0Price,
      token1Price: raw_point.data.token1Price,
      reserve0   : raw_point.data.reserve0,
      reserve1   : raw_point.data.reserve1
    }
    return point;
  }));
}

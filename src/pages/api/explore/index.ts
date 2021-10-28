import { NextApiRequest, NextApiResponse } from "next";

// GQL
import { fetchTokensAPIDataAsMap } from "utils/services";
import { queryTopFuseAsset } from "services/gql";
import { TokensDataMap } from "types/tokens";
import { stables } from "gql/getTopPerformingFuseStable";

// Types
export type SubgraphPool = {
  index: string;
  id: string;
  name: string;
  totalBorrowUSD: number;
  totalLiquidityUSD: number;
  totalSupplyUSD: number;
  assets: SubgraphCToken[];
};

export type SubgraphUnderlyingAsset = {
  id: string;
  name: string;
  symbol: string;
  address: string;
  price: number;
  decimals: number;
  totalBorrow: number;
  totalBorrowUSD: number;
  totalLiquidity: number;
  totalLiquidityUSD: number;
  totalSupply: number;
  totalSupplyUSD: number;
  ctokens?: SubgraphCToken[];
};

export type SubgraphCToken = {
  id: string;
  name: string;
  symbol: string;
  supplyRatePerBlock: string;
  borrowRatePerBlock: string;
  supplyAPY: string;
  borrowAPR: string;
  totalSupplyUSD: string;
  totalBorrowUSD: string;
  liquidityUSD: string;
  underlying: SubgraphUnderlyingAsset;
  pool?: SubgraphPool;
};

export type APIExploreData = {
  results: {
    topEarningFuseStable: SubgraphCToken;
    topEarningFuseAsset: SubgraphCToken;
    mostPopularFuseAsset: SubgraphCToken;
    mostBorrowedFuseAsset: SubgraphCToken;
    cheapestStableBorrow: SubgraphCToken;
  };
  tokensData: TokensDataMap;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIExploreData>
) {
  if (req.method === "GET") {
    // Get Underlying Assets from subgraph
    try {
      const [
        topEarningFuseStable,
        topEarningFuseAsset,
        mostPopularFuseAsset,
        mostBorrowedFuseAsset,
        cheapestStableBorrow,
      ] = await Promise.all([
        getTopEarningFuseStable(),
        getTopEarningFuseAsset(),
        getMostPopularFuseAsset(),
        getMostBorrowedFuseAsset(),
        getCheapestStablecoinBorrow(),
      ]);

      const addresses = [];
      addresses.push(
        topEarningFuseStable.underlying.address,
        topEarningFuseAsset.underlying.address,
        mostPopularFuseAsset.underlying.address,
        mostBorrowedFuseAsset.underlying.address,
        cheapestStableBorrow.underlying.address
      );

      const tokensData: TokensDataMap = await fetchTokensAPIDataAsMap(
        addresses
      );


      const results = {
        topEarningFuseStable,
        topEarningFuseAsset,
        mostPopularFuseAsset,
        mostBorrowedFuseAsset,
        cheapestStableBorrow,
      };

      const returnObj = {
        results,
        tokensData,
      };

      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(400);
    }
  }
}

// Top Earning Stable = highest lending rate Stablecoin
const getTopEarningFuseStable = async (): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("supplyAPY", "desc", stables);

// Top Earning = highest lending rate Fuse Asset
const getTopEarningFuseAsset = async (): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("supplyAPY", "desc");

// Most Popular = Highest lending liquidity Fuse Asset
const getMostPopularFuseAsset = async (): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("liquidityUSD", "desc");

// Most Popular = Highest borrow liquidity Fuse Asset
const getMostBorrowedFuseAsset = async (): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("totalBorrowUSD", "desc");

// Cheapest stablecoin borrow
const getCheapestStablecoinBorrow = async (): Promise<SubgraphCToken> =>
  await queryTopFuseAsset("borrowAPR", "asc", stables);

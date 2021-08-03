import { NextApiRequest, NextApiResponse } from "next";

// GQL
import { GET_MOST_POPULAR_FUSE_ASSET } from "gql/getMostPopularAsset";
import { GET_FUSE_POOL_WITH_MARKET_IDS } from "gql/getPoolWithMarketIds";
import { GET_TOP_PERFORMING_FUSE_ASSET } from "gql/getTopPerformingFuseAsset";
import { GET_TOP_PERFORMING_FUSE_STABLE } from "gql/getTopPerformingFuseStable";
import { makeGqlRequest } from "utils/gql";
import { fetchTokenAPIData } from "utils/services";
import { RariApiTokenData } from "types/tokens";

// Types
export type SubgraphPool = {
  index: string;
  id: string;
};

export type SubgraphMarket = {
  id: string;
  supplyRate: number;
  borrowRate: number;
  symbol: string;
  totalBorrows: number;
  totalSupply: number;
  name: string;
  borrowIndex: number;
  underlyingAddress: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  underlyingPrice: number;
  pool?: SubgraphPool;
  tokenData?: RariApiTokenData;
};

export type APIExploreData = {
  topEarningFuseStable: SubgraphMarket;
  topEarningFuseAsset: SubgraphMarket;
  mostPopularAsset: SubgraphMarket;
  mostBorrowedFuseAsset: SubgraphMarket;
  cheapestStableBorrow: SubgraphMarket;
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
        mostPopularAsset,
        mostBorrowedFuseAsset,
        cheapestStableBorrow
      ] = await Promise.all([
        getTopEarningFuseStable(),
        getTopEarningFuseAsset(),
        getMostPopularFuseAsset(),
        getMostBorrowedFuseAsset(),
        getCheapestStablecoinBorrow()
      ]);

      const returnObj: APIExploreData = {
        topEarningFuseStable,
        topEarningFuseAsset,
        mostPopularAsset,
        mostBorrowedFuseAsset,
        cheapestStableBorrow
      };

      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(400);
    }
  }
}

const getPoolWithMarketId = async (
  marketId: string
): Promise<SubgraphPool | undefined> =>
  (
    await makeGqlRequest(GET_FUSE_POOL_WITH_MARKET_IDS, {
      marketIds: [marketId],
    })
  ).pools[0] ?? undefined;

// Top Earning Stable = highest lending rate Stablecoin
const getTopEarningFuseStable = async (): Promise<SubgraphMarket> => {
  const { markets } = await makeGqlRequest(GET_TOP_PERFORMING_FUSE_STABLE);
  const topPerformingFuseStable: SubgraphMarket = markets?.[0];

  const pool = await getPoolWithMarketId(topPerformingFuseStable.id);

  const tokenData = await fetchTokenAPIData(
    topPerformingFuseStable.underlyingAddress
  );

  return {
    ...topPerformingFuseStable,
    pool,
    tokenData,
  };
};

// Top Earning = highest lending rate Fuse Asset
const getTopEarningFuseAsset = async (): Promise<SubgraphMarket> => {
  const { markets } = await makeGqlRequest(GET_TOP_PERFORMING_FUSE_ASSET);
  const topPerformingFuseAsset: SubgraphMarket = markets?.[0];

  const pool = await getPoolWithMarketId(topPerformingFuseAsset.id);
  const tokenData = await fetchTokenAPIData(
    topPerformingFuseAsset.underlyingAddress
  );

  return {
    ...topPerformingFuseAsset,
    pool,
    tokenData,
  };
};

// Most Popular = Highest lending liquidity Fuse Asset
const getMostPopularFuseAsset = async (): Promise<SubgraphMarket> => {
  const { markets } = await makeGqlRequest(GET_MOST_POPULAR_FUSE_ASSET, {
    orderBy: "totalSupply",
    orderDirection: "desc",
  });
  const mostPopularFuseAsset = markets?.[0];

  const pool = await getPoolWithMarketId(mostPopularFuseAsset.id);
  const tokenData = await fetchTokenAPIData(
    mostPopularFuseAsset.underlyingAddress
  );

  return {
    ...mostPopularFuseAsset,
    pool,
    tokenData,
  };
};

// Most Popular = Highest borrow liquidity Fuse Asset
const getMostBorrowedFuseAsset = async (): Promise<SubgraphMarket> => {
  const { markets } = await makeGqlRequest(GET_MOST_POPULAR_FUSE_ASSET, {
    orderBy: "totalBorrows",
    orderDirection: "desc",
  });
  const mostBorrowedFuseAsset = markets?.[0];

  const pool = await getPoolWithMarketId(mostBorrowedFuseAsset.id);
  const tokenData = await fetchTokenAPIData(
    mostBorrowedFuseAsset.underlyingAddress
  );

  return {
    ...mostBorrowedFuseAsset,
    pool,
    tokenData,
  };
};

// Most Popular = Highest borrow liquidity Fuse Asset
const getCheapestStablecoinBorrow = async (): Promise<SubgraphMarket> => {
  const { markets } = await makeGqlRequest(GET_TOP_PERFORMING_FUSE_STABLE, {
    orderBy: "borrowRate",
    orderDirection: "asc",
  });

  const mostBorrowedFuseAsset = markets?.[0];
  const pool = await getPoolWithMarketId(mostBorrowedFuseAsset.id);
  const tokenData = await fetchTokenAPIData(
    mostBorrowedFuseAsset.underlyingAddress
  );

  return {
    ...mostBorrowedFuseAsset,
    pool,
    tokenData,
  };
};


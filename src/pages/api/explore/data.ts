import { NextApiRequest, NextApiResponse } from "next";

// GQL
import { TokensDataMap } from "types/tokens";
import { initFuseWithProviders, turboGethURL } from "utils/web3Providers";
import Web3 from "web3";
import Rari from "lib/rari-sdk";
import { fetchPools } from "hooks/fuse/useFusePools";
import { EmptyAddress } from "context/RariContext";
import {
  fetchFusePoolData,
  FusePoolData,
  USDPricedFuseAsset,
} from "utils/fetchFusePoolData";
import { fetchTokensAPIDataAsMap } from "utils/services";

// Types
export interface ExploreAsset extends USDPricedFuseAsset {
  fusePool: Pick<
    FusePoolData,
    | "id"
    | "name"
    | "totalBorrowedUSD"
    | "totalSuppliedUSD"
    | "totalLiquidityUSD"
  >;
}

export type APIExploreData2 = {
  topEarningFuseStable: ExploreAsset;
  topEarningFuseAsset: ExploreAsset;
  mostPopularAsset: ExploreAsset;
  mostBorrowedFuseAsset: ExploreAsset;
  cheapestStableBorrow: ExploreAsset;
};

export type APIExploreReturn = {
  results: APIExploreData2;
  tokensData: TokensDataMap;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIExploreReturn>
) {
  if (req.method === "GET") {
    try {
      // Get Underlying Assets from subgraph
      // Set up SDKs
      const web3 = new Web3(turboGethURL);
      const rari = new Rari(web3);
      const fuse = initFuseWithProviders(turboGethURL);

      const fusePools = await fetchPools({
        rari,
        fuse,
        address: EmptyAddress,
        filter: "",
      });

      const poolIndices = fusePools
        .filter((pool) => !!pool.underlyingTokens.length) // filter out empty pools
        .map((pool) => pool.id.toString());

      const fusePoolsData = (await Promise.all(
        poolIndices.map((poolIndex) =>
          fetchFusePoolData(poolIndex, EmptyAddress, fuse, rari)
        )
      )) as FusePoolData[];

      if (!fusePoolsData) return res.status(400);

      const exploreData: APIExploreData2 = iterateThroughFusePoolData(
        fusePoolsData!
      );

      // Get TokenData (logo, color etc) from Rari API
      const tokensData: TokensDataMap = await fetchTokensAPIDataAsMap(
        Object.values(exploreData).map((asset) => asset.underlyingToken)
      );

      return res.status(200).json({
        results: exploreData,
        tokensData,
      });
    } catch (err) {
      return res.status(400);
    }
  }
}

const iterateThroughFusePoolData = (
  fusePoolsData: FusePoolData[]
): APIExploreData2 => {
  let topEarningAssetIndices: [number, number] = [0, 0];
  let mostPopularIndices: [number, number] = [0, 0];
  let mostBorrowedIndices: [number, number] = [0, 0];
  let topEarningStableIndices: [number, number] = [0, 0];
  let cheapestStableIndices: [number, number] = [0, 0];

  const assetIsStablecoin = (asset: USDPricedFuseAsset) =>
    ["DAI", "USDC", "FEI"].includes(asset.underlyingSymbol);

  // Iterate through literally everything bro
  for (let i = 0; i < fusePoolsData.length; i++) {
    const fusePool = fusePoolsData[i];

    if (fusePool.assets.length) {
      for (let j = 0; j < fusePool.assets.length; j++) {
        const asset = fusePool.assets[j];

        // Most popular asset
        if (
          asset.liquidityUSD >
          getAsset(...mostPopularIndices, fusePoolsData).liquidityUSD
        ) {
          mostPopularIndices = [i, j];
        }

        // Most borrowed asset
        if (
          assetOverLiquidityThreshold(asset) &&
          asset.totalBorrowUSD >
            getAsset(...mostBorrowedIndices, fusePoolsData).totalBorrowUSD
        ) {
          mostBorrowedIndices = [i, j];
        }

        // Top earning non-stablecoin Fuse Asset
        if (
          !assetIsStablecoin(asset) &&
          assetOverLiquidityThreshold(asset) &&
          asset.supplyRatePerBlock >
            getAsset(...topEarningAssetIndices, fusePoolsData)
              .supplyRatePerBlock
        ) {
          topEarningAssetIndices = [i, j];
        }

        // Only for stablecoins
        if (assetIsStablecoin(asset)) {
          // Cheapest stable borrow
          if (
            assetOverLiquidityThreshold(asset) &&
            asset.borrowRatePerBlock <
              getAsset(...cheapestStableIndices, fusePoolsData)
                .borrowRatePerBlock
          ) {
            cheapestStableIndices = [i, j];
          }

          // Top Earning Stable
          if (
            assetOverLiquidityThreshold(asset) &&
            asset.supplyRatePerBlock >
              getAsset(...topEarningStableIndices, fusePoolsData)
                .supplyRatePerBlock
          ) {
            topEarningStableIndices = [i, j];
          }
        }
      }
    }
  }

  // finally, return the data
  return {
    topEarningFuseAsset: constructAsset(topEarningAssetIndices, fusePoolsData),
    topEarningFuseStable: constructAsset(
      topEarningStableIndices,
      fusePoolsData
    ),
    mostBorrowedFuseAsset: constructAsset(mostBorrowedIndices, fusePoolsData),
    mostPopularAsset: constructAsset(mostPopularIndices, fusePoolsData),
    cheapestStableBorrow: constructAsset(cheapestStableIndices, fusePoolsData),
  };
};

const constructAsset = (
  [i, j]: [number, number],
  fusePools: FusePoolData[]
): ExploreAsset => ({
  ...fusePools[i].assets[j],
  fusePool: {
    id: fusePools[i].id,
    name: fusePools[i].name,
    totalLiquidityUSD: fusePools[i].totalLiquidityUSD,
    totalBorrowedUSD: fusePools[i].totalBorrowedUSD,
    totalSuppliedUSD: fusePools[i].totalSuppliedUSD,
  },
});

const getAsset = (
  i: number,
  j: number,
  fusePoolsData: FusePoolData[]
): USDPricedFuseAsset => fusePoolsData[i].assets[j];

const assetOverLiquidityThreshold = (asset: USDPricedFuseAsset) =>
  asset.liquidityUSD > 20000;

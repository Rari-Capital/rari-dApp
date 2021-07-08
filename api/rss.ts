import { VercelRequest, VercelResponse } from "@vercel/node";

import { variance, max } from "mathjs";
import fetch from "node-fetch";

import { fetchFusePoolData } from "../src/utils/fetchFusePoolData";
import { resultSet, rssAsset, score } from "../src/utils/rssUtils";
import { initFuseWithProviders, turboGethURL } from "../src/utils/web3Providers";

import backtest from "./backtest/historical";

const fuse = initFuseWithProviders(turboGethURL);

const scorePool = async (assets: rssAsset[]) => {

  let promises: Promise<any>[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      console.time(asset.underlyingSymbol);
      promises.push(

        (async () => {

          // pass for ETH
          if (asset.underlyingToken === "0x0000000000000000000000000000000000000000") {
            return {
              symbol: asset.underlyingSymbol,
              address: asset.underlyingToken,
              g: 0,
              h: 0,
              c: 0,
              v: 0,
              l: 0
            } as score;
          } else if (await checkAddress(asset.underlyingToken)) {
            const assetData = await fetchAssetData(asset.underlyingToken);
            const score = await scoreAsset(asset, assetData);
  
            return score;
          } else {
            // asset not listed on apis
            // mostly yearn and curve vaults, staked OHM, etc
            // bypass for now
            return {
              symbol: asset.underlyingSymbol,
              address: asset.underlyingToken,
              g: 0,
              h: 0,
              c: 0,
              v: 0,
              l: 0
            } as score;
          }
          
        })()
        
      );
    }

  return await Promise.all(promises);
}

const scoreAsset = async (asset: rssAsset, assetData: any) => {

  let logs:any = {}

  const comptrollerContract = new fuse.web3.eth.Contract(
    JSON.parse(
      fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
    ),
    asset.comptroller
  );

  const liquidationIncentive = ((await comptrollerContract.methods.liquidationIncentiveMantissa().call()) / 1e18) - 1;

  console.log('uni',assetData.uniData);
  console.log('sushi',assetData.sushiData);

  const uniswapLiquidity = assetData.uniData.data.token.totalLiquidity;
  const sushiswapLiquidity = assetData.sushiData.data.token.totalLiquidity;

  const totalLiquidity = uniswapLiquidity + sushiswapLiquidity;

  const calcHistorical = async () => {
    let h = 0;

    const collateralFactor = asset.collateralFactor / 1e18;
    const slippage = collateralFactor / 2;

    const historical = await backtest(asset.underlyingToken, {liquidationIncentive, slippage}) as resultSet;

    logs.liquidationIncentive = liquidationIncentive;

    if (historical) {

      logs.tokenDown = historical.TOKEN0DOWN;

      if (collateralFactor < 1 - liquidationIncentive - historical.TOKEN0DOWN) {
        h++;
      }
    } else {
      console.log('historical test failed');
    }

    return h;
  }

  const calcCrash = () => {
    let c = 0;

    const market_cap = assetData.asset_market_cap;

    logs.market_cap = market_cap;

    logs.fdv = assetData.fully_diluted_value;

    if (market_cap < .03 * assetData.fully_diluted_value) c++;
    if (assetData.twitter_followers === 0 || assetData.twitter_followers < 50) c++;

    logs.twitter_followers = assetData.twitter_followers;

    let reputableExchanges: any[] = [];
    for (const exchange of assetData.tickers) {
      const name = exchange.market.identifier;
      if (
        !reputableExchanges.includes(name) &&
        name !== "uniswap" &&
        exchange.trust_score === "green"
      ) {
        reputableExchanges.push(name);
      }
    }

    if (reputableExchanges.length < 3) c++;

    logs.reputableExchanges = reputableExchanges.length;

    return c;
  }

  const calcVolatility = () => {
    let v1: number, v2: number;

    const market_cap = assetData.asset_market_cap;

    if (market_cap < 1e8) v1 = 2;
    else if (market_cap < 6e8) v1 = 1;
    else v1 = 0;

    const peak = assetData.ethVariation * 3;
    const volatility = 1 - assetData.assetVariation / peak;
    const collateralFactor = asset.collateralFactor / 1e18;
    const slippage = collateralFactor / 2;

    logs.peak = peak;
    logs.volatility = volatility;

    if ((volatility < .1) && (2 * volatility < (1 - collateralFactor - liquidationIncentive) && (2 * volatility < liquidationIncentive - (totalLiquidity * slippage)))) {
      v2 = 1;
    } else v2 = 0;

    const v = v1 + v2;
    return v;
  }

  const calcLiquidity = () => {
    let l1: number, l2: number;

    const collateralFactor = asset.collateralFactor / 1e18;
    const slippage = collateralFactor / 2;

    if (totalLiquidity * slippage < 2e5) l1 = 2;
    else if (totalLiquidity * slippage < 1e6) l1 = 1;
    else l1 = 0;

    // need to add lp tokens being pulled
    if (assetData.ethplorer.holdersCount < 1e2) l2 = 1;
    else l2 = 0;

    const l = l1 + l2;
    return l;
  }

  const [
    historical,
    crash,
    volatility,
    liquidity,
  ] = await Promise.all([
    await calcHistorical(),
    calcCrash(),
    calcVolatility(),
    calcLiquidity(),
  ])

  let score: score = {
    address: asset.underlyingToken,
    symbol: asset.underlyingSymbol,
    h: historical,
    c: crash,
    v: volatility,
    l: liquidity,
    g: max([historical, crash, volatility, liquidity])
  }
  return score
}

const checkAddress = async (address: string) => {
  try {
    let data = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`
    ).then((res) => res.json())

    if (data.error) {
      return false;
    } else {
      return true;
    }

  } catch (e) {
    console.log(e);
  }
}

const fetchAssetData = async (address: string) => {

  try {
    const [
      {
        market_data: {
          market_cap: { usd: asset_market_cap },
          current_price: { usd: price_usd },
          fully_diluted_valuation: { usd: fully_diluted_value }
        },
        tickers,
        community_data: { twitter_followers },
      },

      uniData,
      sushiData,
      assetVariation,
      ethplorer

    ] = await Promise.all([

      // object data
      fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`
      ).then((res) => res.json()),

      // uniswap
      fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", {
        method: "post",

        body: JSON.stringify({
          query: `{
            token(id: "${address.toLowerCase()}") {
              totalLiquidity
              txCount
            }
          }`,
        }),

        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json()),

      // sushi swap
      fetch(
        "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
        {
          method: "post",

          body: JSON.stringify({
            query: `{
              token(id: "${address.toLowerCase()}") {
                totalLiquidity
                txCount
              }
            }`,
          }),

          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => res.json()),

      // asset variance (1 day)
      fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart/?vs_currency=usd&days=1`
      )
        .then((res) => res.json())
        .then((data) => data.prices.map(([, price]) => price))
        .then((prices) => variance(prices)),

      fetch(
        `https://api.ethplorer.io/getTokenInfo/${address}?apiKey=freekey`
      )
        .then((res) => res.json())
    ]);

    return {
      asset_market_cap,
      fully_diluted_value,
      price_usd,
      tickers,
      twitter_followers,
      uniData,
      sushiData,
      assetVariation,
      ethplorer
    };

  } catch (e) {
    console.log("error on token:", address);
    console.log(e);
    return false;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (request: VercelRequest, response: VercelResponse) => {
  const { poolID } = request.query as { [key: string]: string };

  response.setHeader("Access-Control-Allow-Origin", "*");

  let lastUpdated = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  if (poolID) {
    console.time("poolData");
    const { assets, comptroller } = (await fetchFusePoolData(
      poolID,
      "0x0000000000000000000000000000000000000000",
      fuse
    ))!;

    console.timeEnd("poolData");

    const rssAssets: rssAsset[] = assets.map((asset: any) => {
      asset.scores = false;
      asset.comptroller = comptroller;

      // curve pool tokens are not listed on exchange
      // if (asset.underlyingName.includes('Curve')) {
      //   asset.underlyingToken = '0xD533a949740bb3306d119CC777fa900bA034cd52';
      // }

      return asset;
    })

    // main thread
    await new Promise(async (resolve) => {

      let scores: score[] = await scorePool(rssAssets);

      resolve(scores);

    }).then((assets) => {

      const poolScore = calculatePoolScore(assets as score[])

      response.setHeader("Cache-Control", "s-maxage=3600");
      response.json({
        poolScore,
        assets,
        lastUpdated,
      });
    })

    console.log("done!");
  } else {
    response.status(404).send("Specify poolID!");
  }
};


// quick max() from score array
const calculatePoolScore = (scores: score[]) => {
  let points: number[] = [];
  for (let i = 0; i < scores.length; i++) {
    points.push(scores[i].g);
  }
  if (points.length === scores.length) {
    return max(points);
  }
}
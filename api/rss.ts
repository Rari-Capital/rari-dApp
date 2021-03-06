import { NowRequest, NowResponse } from "@vercel/node";

import { variance, median } from "mathjs";
import fetch from "node-fetch";
import Fuse from "../src/fuse-sdk";

import ERC20ABI from "../src/rari-sdk/abi/ERC20.json";
import { fetchFusePoolData } from "../src/utils/fetchFusePoolData";

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const weightedCalculation = async (
  calculation: () => Promise<number>,
  weight: number
) => {
  return clamp((await calculation()) ?? 0, 0, 1) * weight;
};

const fuse = new Fuse(
  `http://api.rari.capital:21917`
  //TODO: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
);

async function computeAssetRSS(address: string) {
  address = address.toLowerCase();

  // MAX SCORE FOR ETH
  if (address === "0x0000000000000000000000000000000000000000") {
    return {
      liquidityUSD: 4_000_000_000,

      mcap: 33,
      volatility: 20,
      liquidity: 32,
      swapCount: 7,
      coingeckoMetadata: 2,
      exchanges: 3,
      transfers: 3,

      totalScore: 100,
    };
  }

  try {
    console.time("gecko");
    const {
      market_data: {
        market_cap: { usd: asset_market_cap },
        current_price: { usd: price_usd },
      },
      tickers,
      community_data: { twitter_followers },
    } = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`
    ).then((res) => res.json());
    console.timeEnd("gecko");

    console.time("uni");
    const uniData = await fetch(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        method: "post",

        body: JSON.stringify({
          query: `{
      token(id: "${address}") {
        totalLiquidity
        txCount
      }
    }`,
        }),

        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => res.json());
    console.timeEnd("uni");

    console.time("sushi");
    const sushiData = await fetch(
      "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
      {
        method: "post",

        body: JSON.stringify({
          query: `{
          token(id: "${address}") {
            totalLiquidity
            txCount
          }
        }`,
        }),

        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => res.json());
    console.timeEnd("sushi");

    const mcap = await weightedCalculation(async () => {
      console.time("deficoins");
      const defiCoins = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized_finance_defi&order=market_cap_desc&per_page=10&page=1&sparkline=false`
      )
        .then((res) => res.json())
        .then((array) => array.slice(0, 30));
      console.timeEnd("deficoins");

      const medianDefiCoinMcap = median(
        defiCoins.map((coin) => coin.market_cap)
      );

      // Make exception for WETH
      if (address === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
        return 1;
      }

      if (asset_market_cap < 1_000_000) {
        return 0;
      } else {
        return asset_market_cap / medianDefiCoinMcap;
      }
    }, 33);

    let liquidityUSD = 0;

    const liquidity = await weightedCalculation(async () => {
      const uniLiquidity = parseFloat(
        uniData.data.token?.totalLiquidity ?? "0"
      );
      const sushiLiquidity = parseFloat(
        sushiData.data.token?.totalLiquidity ?? "0"
      );

      const totalLiquidity = uniLiquidity + sushiLiquidity * price_usd;

      liquidityUSD = totalLiquidity;

      return totalLiquidity / 220_000_000;
    }, 32);

    const volatility = await weightedCalculation(async () => {
      console.time("variation");
      const assetVariation = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart/?vs_currency=usd&days=30`
      )
        .then((res) => res.json())
        .then((data) => data.prices.map(([, price]) => price))
        .then((prices) => variance(prices));
      console.timeEnd("variation");

      console.time("ethVariation");
      const ethVariation = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/?vs_currency=usd&days=30`
      )
        .then((res) => res.json())
        .then((data) => data.prices.map(([, price]) => price))
        .then((prices) => variance(prices));
      console.timeEnd("ethVariation");

      const peak = ethVariation * 3;

      return 1 - assetVariation / peak;
    }, 20);

    const swapCount = await weightedCalculation(async () => {
      const uniTxCount = parseFloat(uniData.data.token?.txCount ?? "0");

      const sushiTxCount = parseFloat(sushiData.data.token?.txCount ?? "0");

      const totalTxCount = uniTxCount + sushiTxCount;

      return totalTxCount >= 10_000 ? 1 : 0;
    }, 7);

    const exchanges = await weightedCalculation(async () => {
      let reputableExchanges: any[] = [];

      for (const exchange of tickers) {
        const name = exchange.market.identifier;

        if (
          !reputableExchanges.includes(name) &&
          name !== "uniswap" &&
          exchange.trust_score === "green"
        ) {
          reputableExchanges.push(name);
        }
      }

      return reputableExchanges.length >= 3 ? 1 : 0;
    }, 3);

    const transfers = await weightedCalculation(async () => {
      console.time("transferAmount");
      const contract = new fuse.web3.eth.Contract(ERC20ABI as any, address);

      try {
        const transfers = await contract.getPastEvents("Transfer", {
          fromBlock: 0,
          toBlock: await fuse.web3.eth.getBlockNumber(),
        });

        console.timeEnd("transferAmount");

        return transfers.length >= 500 ? transfers.length / 10_000 : 0;
      } catch (e) {
        console.timeEnd("transferAmount");

        if (
          e.message === "Returned error: query returned more than 10000 results"
        ) {
          return 1;
        } else {
          console.log(e);
          return 0;
        }
      }
    }, 3);

    const coingeckoMetadata = await weightedCalculation(async () => {
      // USDC needs an exception because Circle twitter is not listed on Coingecko.
      if (address === "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
        return 1;
      }

      return twitter_followers >= 1000 ? 1 : 0;
    }, 2);

    return {
      liquidityUSD,

      mcap,
      volatility,
      liquidity,
      swapCount,
      coingeckoMetadata,
      exchanges,
      transfers,

      totalScore:
        mcap +
        volatility +
        liquidity +
        swapCount +
        coingeckoMetadata +
        exchanges +
        transfers,
    };
  } catch (e) {
    console.log(e);

    return {
      liquidityUSD: 0,

      mcap: 0,
      volatility: 0,
      liquidity: 0,
      swapCount: 0,
      coingeckoMetadata: 0,
      exchanges: 0,
      transfers: 0,

      totalScore: 0,
    };
  }
}

export default async (request: NowRequest, response: NowResponse) => {
  const { address, poolID } = request.query as { [key: string]: string };

  response.setHeader("Access-Control-Allow-Origin", "*");

  let lastUpdated = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  if (address) {
    response.setHeader("Cache-Control", "s-maxage=604800");

    response.json({ ...(await computeAssetRSS(address)), lastUpdated });
  } else if (poolID) {
    console.time("poolData");
    const { assets, totalLiquidityUSD, comptroller } = await fetchFusePoolData(
      poolID,
      "0x0000000000000000000000000000000000000000",
      fuse
    );
    console.timeEnd("poolData");

    const liquidity = await weightedCalculation(async () => {
      return totalLiquidityUSD > 50_000 ? totalLiquidityUSD / 2_000_000 : 0;
    }, 25);

    const collateralFactor = await weightedCalculation(async () => {
      const avgCollatFactor = assets.reduce(
        (a, b, _, { length }) => a + b.collateralFactor / 1e16 / length,
        0
      );

      // Returns a percentage in the range of 45% -> 90% (where 90% is 0% and 45% is 100%)
      return -1 * (1 / 45) * avgCollatFactor + 2;
    }, 15);

    const reserveFactor = await weightedCalculation(async () => {
      const avgReserveFactor = assets.reduce(
        (a, b, _, { length }) => a + b.reserveFactor / 1e16 / length,
        0
      );

      return avgReserveFactor <= 2 ? 0 : avgReserveFactor / 22;
    }, 15);

    const utilization = await weightedCalculation(async () => {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        // If this asset has more than 75% utilization, fail
        if (
          // @ts-ignore
          asset.totalSupply === "0"
            ? false
            : asset.totalBorrow / asset.totalSupply >= 0.75
        ) {
          return 0;
        }
      }

      return 1;
    }, 15);

    let assetsRSS: ThenArg<ReturnType<typeof computeAssetRSS>>[] = [];
    let totalRSS = 0;

    // Do all the fetching in parallel and then resolve this promise once they have all fetched.
    await new Promise((resolve) => {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        fetch(
          `http://${process.env.VERCEL_URL}/api/rss?address=` +
            asset.underlyingToken
        )
          .then((res) => res.json())
          .then((rss) => {
            assetsRSS[i] = rss;
            totalRSS += rss.totalScore;

            if (assetsRSS.length === assets.length) {
              resolve(true);
            }
          });
      }
    });

    const averageRSS = await weightedCalculation(async () => {
      return totalRSS / assets.length / 100;
    }, 15);

    const upgradeable = await weightedCalculation(async () => {
      const {
        1: upgradeable,
      } = await fuse.contracts.FusePoolLens.methods
        .getPoolOwnership(comptroller)
        .call();

      return upgradeable ? 0 : 1;
    }, 15);

    const mustPass = await weightedCalculation(async () => {
      const comptrollerContract = new fuse.web3.eth.Contract(
        JSON.parse(
          fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
        ),
        comptroller
      );

      const liquidationIncentive =
        (await comptrollerContract.methods
          .liquidationIncentiveMantissa()
          .call()) /
          1e16 -
        100;

      for (let i = 0; i < assetsRSS.length; i++) {
        const rss = assetsRSS[i];
        const asset = assets[i];

        // If the AMM liquidity is less than 2x the $ amount supplied, fail
        if (rss.liquidityUSD < 2 * asset.totalSupplyUSD) {
          return 0;
        }

        // If the liquidation incentive is less than or equal to 1/10th of the collateral factor, fail
        // Ex: Incentive is 8%, Factor is 75%
        const collateralFactor = asset.collateralFactor / 1e16;
        if (liquidationIncentive <= collateralFactor / 10) {
          return 0;
        }
      }

      return 1;
    }, 15);

    response.setHeader("Cache-Control", "s-maxage=604800");
    response.json({
      liquidity,
      collateralFactor,
      reserveFactor,
      utilization,
      averageRSS,
      upgradeable,
      mustPass,

      totalScore:
        liquidity +
        collateralFactor +
        reserveFactor +
        utilization +
        averageRSS +
        upgradeable +
        mustPass,

      lastUpdated,
    });
  } else {
    response.status(404).send("Specify address or poolID!");
  }
};

import { NowRequest, NowResponse } from "@vercel/node";

import { variance, median, add } from "mathjs";
import fetch from "node-fetch";
import Web3 from "web3";

import ERC20ABI from "../src/rari-sdk/abi/ERC20.json";

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

const weightedCalculation = async (
  calculation: () => Promise<number>,
  weight: number
) => {
  return clamp((await calculation()) ?? 0, 0, 1) * weight;
};

const web3 = new Web3(
  `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
);

export default async (request: NowRequest, response: NowResponse) => {
  const { address, poolID } = request.query as { [key: string]: string };

  response.setHeader("Access-Control-Allow-Origin", "*");

  let lastUpdated = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  if (address) {
    try {
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

      const mcap = await weightedCalculation(async () => {
        const defiCoins = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized_finance_defi&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        )
          .then((res) => res.json())
          .then((array) => array.slice(0, 30));

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

      const liquidity = await weightedCalculation(async () => {
        const uniLiquidity = parseFloat(
          uniData.data.token?.totalLiquidity ?? "0"
        );
        const sushiLiquidity = parseFloat(
          sushiData.data.token?.totalLiquidity ?? "0"
        );

        const totalLiquidity = uniLiquidity + sushiLiquidity;

        return (totalLiquidity * price_usd) / 220_000_000;
      }, 32);

      const volatility = await weightedCalculation(async () => {
        const assetVariation = await fetch(
          `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart/?vs_currency=usd&days=30`
        )
          .then((res) => res.json())
          .then((data) => data.prices.map(([, price]) => price))
          .then((prices) => variance(prices));

        const ethVariation = await fetch(
          `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/?vs_currency=usd&days=30`
        )
          .then((res) => res.json())
          .then((data) => data.prices.map(([, price]) => price))
          .then((prices) => variance(prices));

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
        let reputableExchanges = [];

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
        const contract = new web3.eth.Contract(ERC20ABI as any, address);

        try {
          const transfers = await contract.getPastEvents("Transfer", {
            fromBlock: 0,
            toBlock: await web3.eth.getBlockNumber(),
          });

          return transfers.length >= 500 ? transfers.length / 10_000 : 0;
        } catch (e) {
          if (
            e.message ===
            "Returned error: query returned more than 10000 results"
          ) {
            return 1;
          } else {
            console.log(e);
          }
        }
      }, 3);

      const coingeckoMetadata = await weightedCalculation(async () => {
        return twitter_followers >= 1000 ? 1 : 0;
      }, 2);

      response.setHeader("Cache-Control", "s-maxage=604800");
      response.json({
        mcap,
        volatility,
        liquidity,
        swapCount,
        coingeckoMetadata,
        exchanges,
        transfers,

        lastUpdated,

        totalScore:
          mcap +
          volatility +
          liquidity +
          swapCount +
          coingeckoMetadata +
          exchanges +
          transfers,
      });
    } catch (e) {
      console.log(e);

      response.setHeader("Cache-Control", "s-maxage=86400");
      response.json({
        mcap: 0,
        volatility: 0,
        liquidity: 0,
        swapCount: 0,
        coingeckoMetadata: 0,
        exchanges: 0,
        transfers: 0,

        lastUpdated,

        totalScore: 0,
      });
    }
  } else if (poolID) {
  } else {
    response.setHeader("Cache-Control", "s-maxage=86400");
    response.status(404).send("Specify address or poolID!");
  }
};

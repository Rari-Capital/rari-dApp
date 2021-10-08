// for supply-side rewards apy:
// export const

import { useQuery } from "react-query";
import { useTokensDataAsMap } from "hooks/useTokenData";
import { createCToken, createMasterPriceOracle } from "utils/createComptroller";
import Fuse from "fuse-sdk";
import { useRari } from "context/RariContext";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import { toBN } from "utils/bigUtils";

// ( ( rewardSupplySpeed * rewardEthPrice ) / ( underlyingTotalSupply * underlyingEthPrice / 1e18 / 1e18 ) )
// (
//     rewardSpeed: number,  // getRewardsSpeedsByPool
//     rewardEthPrice: number,  // useAssetPricesInEth + the rewardtoken -- price of the rewardToken in ETH
//     underlyingTotalSupply: number, // (CToken.totalSupply() * CToken.exchangeRateCurrent())
//     underlyingEthPrice: number // useAssetPricesInEth + the CToken underlying price in ETH
// )
// export const useSupplyRewardAPY = (rewardSpeed: number, rewardEthPrice: number, underlyingTotalSupply: number, underlyingEthPrice: number) => {
//   return speed;
// };

export interface CTokensDataForRewardsMap {
  [cTokenAddr: string]: CTokenDataForRewards;
}

export type CTokenDataForRewards = Pick<
  USDPricedFuseAsset,
  "underlyingToken" | "cToken" | "totalSupply" | "underlyingPrice"
>;

export const useCTokensDataForRewards = (
  cTokenAddrs: string[]
): CTokensDataForRewardsMap => {
  const { fuse } = useRari();
  const { data: cTokensMap } = useQuery(
    "CTokens underlying for " + cTokenAddrs?.join(","),
    async () => {
      const _map: CTokensDataForRewardsMap = {};

      const cTokensArray = await Promise.all(
        cTokenAddrs.map(async (cTokenAddr) => {
          const ctokenInstance = createCToken(fuse, cTokenAddr);
          const underlying = await ctokenInstance.methods.underlying().call();

          const cTokenTotalSupply = await ctokenInstance.methods
            .totalSupply()
            .call();

          const exchangeRateCurrent = await ctokenInstance.methods
            .exchangeRateCurrent()
            .call();

          console.log({ cTokenAddr, cTokenTotalSupply, exchangeRateCurrent });

          const underlyingTotalSupply = parseFloat(
            toBN(cTokenTotalSupply).mul(toBN(exchangeRateCurrent)).toString()
          );

          const obj: CTokenDataForRewards = {
            underlyingToken: underlying,
            underlyingPrice: 0,
            cToken: cTokenAddr,
            totalSupply: underlyingTotalSupply,
          };

          _map[cTokenAddr] = obj;

          return obj;
        })
      );

      return _map;
    }
  );

  return cTokensMap ?? {};
};

// Todo - handle situation where oracle cant find the price
// Todo 2 - make sure that you are always using the Fuse Pool's oracle and that the Fuse Pool's Oracle supports this asset
export const useAssetPricesInEth = (tokenAddresses: string[]) => {
  const { fuse } = useRari();
  const masterPriceOracle = createMasterPriceOracle(fuse);

  const tokensData = useTokensDataAsMap(tokenAddresses);

  const { data } = useQuery(
    "asset prices for " +
      tokenAddresses.join(",") +
      " " +
      Object.keys(tokensData).join(","),
    async () => {
      const [ethUSDBN, ...tokenPricesInEth] = await Promise.all([
        fuse.getEthUsdPriceBN(),
        ...tokenAddresses.map(
          async (t) => await masterPriceOracle.methods.price(t).call()
        ),
      ]);

      const ethUSD = parseFloat(ethUSDBN.toString()) / 1e18;
      const tokenUSDPrices = [];

      // Calc usd prices
      for (let i = 0; i < tokenAddresses.length; i++) {
        const priceInEth = parseFloat(tokenPricesInEth[i]);
        const tokenData = tokensData[tokenAddresses[i]];
        const decimals = tokenData.decimals;

        const price = (priceInEth / 10 ** (decimals ?? 18)) * ethUSD;

        tokenUSDPrices.push(price);
      }

      return { tokenPricesInEth, ethUSD, tokenUSDPrices };
    }
  );

  const { tokenPricesInEth, ethUSD } = data ?? {};

  console.log({ data, tokensData, masterPriceOracle });
  return data;
};

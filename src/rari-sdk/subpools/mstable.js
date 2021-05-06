/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "../cache.js";

var erc20Abi = require("." + "/../abi/ERC20.json");

const externalContractAddresses = {
  Masset: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
  MassetValidationHelper: "0xabcc93c3be238884cc3309c19afd128fafc16911",
};

var externalAbis = {};
externalAbis["Masset"] = require("." + "/mstable/abi/" + "Masset" + ".json");

externalAbis["MassetValidationHelper"] = require("." +
  "/mstable/abi/" +
  "MassetValidationHelper" +
  ".json");

export default class MStableSubpool {
  static EXTERNAL_CONTRACT_ADDRESSES = externalContractAddresses;
  static EXTERNAL_CONTRACT_ABIS = externalAbis;

  static SUPPORTED_EXCHANGE_CURRENCIES = ["USDC", "USDT", "TUSD"];

  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({
      mStableCurrencyApys: 300,
      mUsdSwapFee: 3600,
    });

    this.externalContracts = {};
    for (const contractName of Object.keys(externalContractAddresses))
      this.externalContracts[contractName] = new this.web3.eth.Contract(
        externalAbis[contractName],
        externalContractAddresses[contractName]
      );
  }

  async getMUsdSavingsApy(includeIMUsdVaultApy) {
    const data = (
      await axios.post(
        "https://api.thegraph.com/subgraphs/name/mstable/mstable-protocol-staging",
        {
          operationName: "MUSD",
          query:
            'query MUSD {\n  masset(id: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5") {\n    feeRate\n    savingsContractsV2: savingsContracts(where: {version: 2}) {\n      ...SavingsContractAll\n      token {\n        ...TokenAll\n        __typename\n      }\n      boostedSavingsVaults {\n        id\n        lastUpdateTime\n        lockupDuration\n        unlockPercentage\n        periodDuration\n        periodFinish\n        rewardPerTokenStored\n        rewardRate\n        stakingContract\n        totalStakingRewards\n        totalSupply\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment TokenAll on Token {\n  id\n  address\n  decimals\n  symbol\n  totalSupply {\n    ...MetricFields\n    __typename\n  }\n  __typename\n}\n\nfragment MetricFields on Metric {\n  exact\n  decimals\n  simple\n  __typename\n}\n\nfragment SavingsContractAll on SavingsContract {\n  id\n  totalSavings {\n    ...MetricFields\n    __typename\n  }\n  latestExchangeRate {\n    rate\n    timestamp\n    __typename\n  }\n  dailyAPY\n  version\n  active\n  __typename\n}\n',
        }
      )
    ).data;

    if (!data || !data.data)
      return console.error(
        "Failed to decode exchange rates from The Graph when calculating mStable 24-hour APY"
      );
    this.cache.update("mUsdSwapFee", Web3.utils.toBN(data.data.masset.feeRate));
    var apy = Web3.utils.toBN(
      (
        parseFloat(data.data.masset.savingsContractsV2[0].dailyAPY) * 1e16
      ).toFixed(0)
    );
    if (includeIMUsdVaultApy)
      apy.iadd(
        await this.getIMUsdVaultApy(
          data.data.masset.savingsContractsV2[0].boostedSavingsVaults[0]
            .totalStakingRewards,
          data.data.masset.savingsContractsV2[0].latestExchangeRate.rate
        )
      );
    return apy;
  }

  async getCurrencyApys() {
    var self = this;
    return await self.cache.getOrUpdate(
      "mStableCurrencyApys",
      async function () {
        return { mUSD: await self.getMUsdSavingsApy(true) };
      }
    );
  }

  async getMUsdSwapFeeBN() {
    var self = this;
    return await this.cache.getOrUpdate("mUsdSwapFee", async function () {
      try {
        return Web3.utils.toBN(
          await self.externalContracts.Masset.methods.swapFee().call()
        );
      } catch (err) {
        throw new Error("Failed to get mUSD swap fee: " + err);
      }
    });
  }

  async getMtaUsdPrice() {
    return (
      await axios(
        "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2&vs_currencies=USD"
      )
    ).data["0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2"].usd;
  }

  async getIMUsdVaultWeeklyRoi(totalStakingRewards, stakingTokenPrice) {
    var totalStaked =
      (await new this.web3.eth.Contract(
        erc20Abi,
        "0x30647a72dc82d7fbb1123ea74716ab8a317eac19"
      ).methods
        .balanceOf("0x78befca7de27d07dc6e71da295cc2946681a6c7b")
        .call()) / 1e18;
    // https://github.com/mstable/mStable-app/blob/56055318f23b43479455cdf0a9521dfec493b01c/src/hooks/useVaultWeeklyROI.ts#L43
    const mtaPerWeekInUsd = totalStakingRewards * (await this.getMtaUsdPrice());
    const totalStakedInUsd = stakingTokenPrice * totalStaked;
    return mtaPerWeekInUsd / totalStakedInUsd;
  }

  async getIMUsdVaultApy(totalStakingRewards, stakingTokenPrice) {
    return Web3.utils.toBN(
      (
        ((1 +
          (await this.getIMUsdVaultWeeklyRoi(
            totalStakingRewards,
            stakingTokenPrice
          ))) **
          52 -
          1) *
        1e18
      ).toFixed(0)
    );
  }
}

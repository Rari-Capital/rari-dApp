/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "./cache.js";

const contractAddresses = {
  RariGovernanceToken: "0xD291E7a03283640FDc51b121aC401383A46cC623",
  RariGovernanceTokenDistributor: "0x9C0CaEb986c003417D21A7Daaf30221d61FC1043",
  RariGovernanceTokenUniswapDistributor: "0x1FA69a416bCF8572577d3949b742fBB0a9CD98c7",
  RariGovernanceTokenVesting: "0xA54B473028f4ba881F1eD6B670af4103e8F9B98a",
};

var abis = {};

abis["RariGovernanceToken"] = require("." +
  "/governance/abi/" +
  "RariGovernanceToken" +
  ".json");

abis["RariGovernanceTokenDistributor"] = require("." +
  "/governance/abi/" +
  "RariGovernanceTokenDistributor" +
  ".json");

abis["RariGovernanceTokenVesting"] = require("." +
  "/governance/abi/" +
  "RariGovernanceTokenVesting" +
  ".json");

abis["RariGovernanceTokenUniswapDistributor"] = require("." +
  "/governance/abi/" +
  "RariGovernanceTokenUniswapDistributor" +
  ".json");

export default class Governance {
  API_BASE_URL = "https://api.rari.capital/governance/";

  static CONTRACT_ADDRESSES = contractAddresses;
  static CONTRACT_ABIS = abis;

  constructor(web3) {
    this.web3 = web3;
    this.cache = new Cache({ rgtUsdPrice: 900 });

    this.contracts = {};
    for (const contractName of Object.keys(contractAddresses))
      this.contracts[contractName] = new web3.eth.Contract(
        abis[contractName],
        contractAddresses[contractName]
      );

    var self = this;

    this.rgt = {
      getExchangeRate: async function () {
        // TODO: RGT price getter function from Coingecko
        return self.cache.getOrUpdate("rgtUsdPrice", async function () {
          /* try {
            return Web3.utils.toBN(Math.trunc((await axios.get("https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=rgt")).data.rgt.usd * 1e18));
          } catch (error) {
            throw new Error("Error retrieving data from Coingecko API: " + error);
          } */

          try {
            var data = (
              await axios.post(
                "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
                {
                  query: `{
              ethRgtPair: pair(id: "0xdc2b82bc1106c9c5286e59344896fb0ceb932f53") {
                token0Price
              }
              ethUsdtPair: pair(id: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852") {
                token1Price
              }
            }
            `,
                }
              )
            ).data;

            return Web3.utils.toBN(
              Math.trunc(
                data.data.ethRgtPair.token0Price *
                  data.data.ethUsdtPair.token1Price *
                  1e18
              )
            );
          } catch (error) {
            throw new Error(
              "Error retrieving data from The Graph API: " + error
            );
          }
        });
      },
      distributions: {
        DISTRIBUTION_START_BLOCK: 11094200,
        DISTRIBUTION_PERIOD: 390000,
        DISTRIBUTION_END_BLOCK:
          this.DISTRIBUTION_START_BLOCK + this.DISTRIBUTION_PERIOD,
        FINAL_RGT_DISTRIBUTION: Web3.utils.toBN("8750000000000000000000000"),
        getDistributedAtBlock: function (blockNumber) {
          var startBlock = self.rgt.distributions.DISTRIBUTION_START_BLOCK;
          if (blockNumber <= startBlock) return Web3.utils.toBN(0);
          if (
            blockNumber >=
            startBlock + self.rgt.distributions.DISTRIBUTION_PERIOD
          )
            return self.rgt.distributions.FINAL_RGT_DISTRIBUTION;
          var blocks = blockNumber - startBlock;
          if (blocks < 6500 * 15)
            return Web3.utils
              .toBN(1e18)
              .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
              .divn(2730)
              .add(
                Web3.utils.toBN("1450000000000000000000").muln(blocks).divn(273)
              );
          if (blocks < 6500 * 30)
            return Web3.utils
              .toBN("14600000000000000000000")
              .muln(blocks)
              .divn(273)
              .sub(
                Web3.utils
                  .toBN("2000000000000000000")
                  .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
                  .divn(17745)
              )
              .sub(Web3.utils.toBN("1000000000000000000000000").divn(7));
          if (blocks < 6500 * 45)
            return Web3.utils
              .toBN(1e18)
              .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
              .divn(35490)
              .add(Web3.utils.toBN("39250000000000000000000000").divn(7))
              .sub(
                Web3.utils.toBN("950000000000000000000").muln(blocks).divn(273)
              );
          return Web3.utils
            .toBN(1e18)
            .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
            .divn(35490)
            .add(Web3.utils.toBN("34750000000000000000000000").divn(7))
            .sub(Web3.utils.toBN("50000000000000000000").muln(blocks).divn(39));
        },
        getCurrentApy: async function (blockNumber, tvl) {
          if (blockNumber === undefined && tvl === undefined) {
            try {
              return Web3.utils.toBN(
                (await axios.get(self.API_BASE_URL + "rgt/apy")).data
              );
            } catch (error) {
              throw new Error("Error retrieving data from Rari API: " + error);
            }
          } else {
            // Get APY from difference in distribution over last 270 blocks (estimating a 1 hour time difference)
            var rgtDistributedPastHour = self.rgt.distributions
              .getDistributedAtBlock(blockNumber)
              .sub(
                self.rgt.distributions.getDistributedAtBlock(blockNumber - 270)
              );
            var rgtDistributedPastHourPerUsd = rgtDistributedPastHour
              .mul(Web3.utils.toBN(1e18))
              .div(tvl);
            var rgtDistributedPastHourPerUsdInUsd = rgtDistributedPastHourPerUsd
              .mul(await self.rgt.getExchangeRate())
              .div(Web3.utils.toBN(1e18));
            return Web3.utils.toBN(
              Math.trunc(
                ((1 + rgtDistributedPastHourPerUsdInUsd / 1e18) ** (24 * 365) -
                  1) *
                  1e18
              )
            );
          }
        },
        getCurrentApr: async function (blockNumber, tvl) {
          // Get APR from difference in distribution over last 270 blocks (estimating a 1 hour time difference)
          var rgtDistributedPastHour = self.rgt.distributions
            .getDistributedAtBlock(blockNumber)
            .sub(
              self.rgt.distributions.getDistributedAtBlock(blockNumber - 270)
            );
          var rgtDistributedPastHourPerUsd = rgtDistributedPastHour
            .mul(Web3.utils.toBN(1e18))
            .div(tvl);
          var rgtDistributedPastHourPerUsdInUsd = rgtDistributedPastHourPerUsd
            .mul(await self.rgt.getExchangeRate())
            .div(Web3.utils.toBN(1e18));
          return rgtDistributedPastHourPerUsdInUsd.muln(24 * 365);
        },
        getUnclaimed: async function (account) {
          return Web3.utils.toBN(
            await self.contracts.RariGovernanceTokenDistributor.methods
              .getUnclaimedRgt(account)
              .call()
          );
        },
        claim: async function (amount, options) {
          return await self.contracts.RariGovernanceTokenDistributor.methods
            .claimRgt(amount)
            .send(options);
        },
        claimAll: async function (options) {
          return await self.contracts.RariGovernanceTokenDistributor.methods
            .claimAllRgt()
            .send(options);
        },
        getClaimFee: function (blockNumber) {
          var initialClaimFee = Web3.utils.toBN(0.33e18);
          if (blockNumber <= self.rgt.distributions.DISTRIBUTION_START_BLOCK)
            return initialClaimFee;
          var distributionEndBlock =
            self.rgt.distributions.DISTRIBUTION_START_BLOCK +
            self.rgt.distributions.DISTRIBUTION_PERIOD;
          if (blockNumber >= distributionEndBlock) return Web3.utils.toBN(0);
          return initialClaimFee
            .muln(distributionEndBlock - blockNumber)
            .divn(self.rgt.distributions.DISTRIBUTION_PERIOD);
        },
        refreshDistributionSpeeds: async function (options) {
          return await self.contracts.RariGovernanceTokenDistributor.methods
            .refreshDistributionSpeeds()
            .send(options);
        },
        refreshDistributionSpeedsByPool: async function (pool, options) {
          return await self.contracts.RariGovernanceTokenDistributor.methods
            .refreshDistributionSpeeds(pool)
            .send(options);
        },
      },
      sushiSwapDistributions: {
        DISTRIBUTION_START_BLOCK: 11909000,
        DISTRIBUTION_PERIOD: 6500 * 365 * 3,
        DISTRIBUTION_END_BLOCK:
          this.DISTRIBUTION_START_BLOCK + this.DISTRIBUTION_PERIOD,
        FINAL_RGT_DISTRIBUTION: Web3.utils
          .toBN("568717819057309757517546")
          .muln(80)
          .divn(100),
        getDistributedAtBlock: function (blockNumber) {
          var startBlock =
            self.rgt.sushiSwapDistributions.DISTRIBUTION_START_BLOCK;
          if (blockNumber <= startBlock) return web3.utils.toBN(0);
          if (
            blockNumber >=
            startBlock + self.rgt.sushiSwapDistributions.DISTRIBUTION_PERIOD
          )
            return self.rgt.sushiSwapDistributions.FINAL_RGT_DISTRIBUTION;
          var blocks = blockNumber - startBlock;
          return self.rgt.sushiSwapDistributions.FINAL_RGT_DISTRIBUTION.muln(
            blocks
          ).divn(self.rgt.sushiSwapDistributions.DISTRIBUTION_PERIOD);
        },
        getCurrentApy: async function (blockNumber, tvl) {
          if (blockNumber === undefined && tvl === undefined) {
            try {
              return Web3.utils.toBN(
                (await axios.get(self.API_BASE_URL + "rgt/sushiswap/apy")).data
              );
            } catch (error) {
              throw new Error("Error retrieving data from Rari API: " + error);
            }
          } else {
            // Get APY from difference in distribution over last 270 blocks (estimating a 1 hour time difference)
            var rgtDistributedPastHour = self.rgt.sushiSwapDistributions
              .getDistributedAtBlock(blockNumber)
              .sub(
                self.rgt.sushiSwapDistributions.getDistributedAtBlock(
                  blockNumber - 270
                )
              );
            var rgtDistributedPastHourPerUsd = rgtDistributedPastHour
              .mul(Web3.utils.toBN(1e18))
              .div(tvl);
            var rgtDistributedPastHourPerUsdInUsd = rgtDistributedPastHourPerUsd
              .mul(await self.rgt.getExchangeRate())
              .div(Web3.utils.toBN(1e18));
            return Web3.utils.toBN(
              Math.trunc(
                ((1 + rgtDistributedPastHourPerUsdInUsd / 1e18) ** (24 * 365) -
                  1) *
                  1e18
              )
            );
          }
        },
        getCurrentApr: async function (blockNumber, tvl) {
          // Get APR from difference in distribution over last 270 blocks (estimating a 1 hour time difference)
          var rgtDistributedPastHour = self.rgt.sushiSwapDistributions
            .getDistributedAtBlock(blockNumber)
            .sub(
              self.rgt.sushiSwapDistributions.getDistributedAtBlock(
                blockNumber - 270
              )
            );
          var rgtDistributedPastHourPerUsd = rgtDistributedPastHour
            .mul(Web3.utils.toBN(1e18))
            .div(tvl);
          var rgtDistributedPastHourPerUsdInUsd = rgtDistributedPastHourPerUsd
            .mul(await self.rgt.getExchangeRate())
            .div(Web3.utils.toBN(1e18));
          return rgtDistributedPastHourPerUsdInUsd.muln(24 * 365);
        },
        totalStaked: async function () {
          await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .totalStaked()
            .call();
        },
        stakingBalanceOf: async function (account) {
          await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .stakingBalances(account)
            .call();
        },
        deposit: async function (amount, options) {
          await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .deposit(account)
            .send(options);
        },
        withdraw: async function (amount, options) {
          await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .withdraw(account)
            .send(options);
        },
        getUnclaimed: async function (account) {
          return Web3.utils.toBN(
            await self.contracts.RariGovernanceTokenUniswapDistributor.methods
              .getUnclaimedRgt(account)
              .call()
          );
        },
        claim: async function (amount, options) {
          return await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .claimRgt(amount)
            .send(options);
        },
        claimAll: async function (options) {
          return await self.contracts.RariGovernanceTokenUniswapDistributor.methods
            .claimAllRgt()
            .send(options);
        },
      },
      vesting: {
        PRIVATE_VESTING_START_TIMESTAMP: 1603202400,
        PRIVATE_VESTING_PERIOD: 2 * 365 * 86400,
        getUnclaimed: async function (account) {
          return Web3.utils.toBN(
            await self.contracts.RariGovernanceTokenVesting.methods
              .getUnclaimedPrivateRgt(account)
              .call()
          );
        },
        claim: async function (amount, options) {
          return await self.contracts.RariGovernanceTokenVesting.methods
            .claimPrivateRgt(amount)
            .send(options);
        },
        claimAll: async function (options) {
          return await self.contracts.RariGovernanceTokenVesting.methods
            .claimAllPrivateRgt()
            .send(options);
        },
        getClaimFee: function (timestamp) {
          var initialClaimFee = Web3.utils.toBN(1e18);
          if (timestamp <= self.rgt.vesting.PRIVATE_VESTING_START_TIMESTAMP)
            return initialClaimFee;
          var privateVestingEndTimestamp =
            self.rgt.vesting.PRIVATE_VESTING_START_TIMESTAMP +
            self.rgt.vesting.PRIVATE_VESTING_PERIOD;
          if (timestamp >= privateVestingEndTimestamp)
            return Web3.utils.toBN(0);
          return initialClaimFee
            .muln(privateVestingEndTimestamp - timestamp)
            .divn(self.rgt.vesting.PRIVATE_VESTING_PERIOD);
        },
      },
      balanceOf: async function (account) {
        return Web3.utils.toBN(
          await self.contracts.RariGovernanceToken.methods
            .balanceOf(account)
            .call()
        );
      },
      transfer: async function (recipient, amount, options) {
        return await self.contracts.RariGovernanceToken.methods
          .transfer(recipient, amount)
          .send(options);
      },
    };
  }
}

/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

import Cache from "./cache.js";

const contractAddresses = {
  RariGovernanceToken: "0xD291E7a03283640FDc51b121aC401383A46cC623",
  RariGovernanceTokenDistributor: "0x9C0CaEb986c003417D21A7Daaf30221d61FC1043"
};

var abis = {};
for (const contractName of Object.keys(contractAddresses))
  abis[contractName] = require(__dirname +
    "/governance/abi/" +
    contractName +
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
        // TODO: RGT price getter function
        /* return self.cache.getOrUpdate("rgtUsdPrice", async function() {
            try {
                return Web3.utils.toBN((await axios.get("https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=rgt")).data.rgt.usd * 1e18);
            } catch (error) {
                throw "Error retrieving data from Rari API: " + error;
            }
        }); */
        return Web3.utils.toBN(2e18);
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
          if (blockNumber >= startBlock + self.rgt.distributions.DISTRIBUTION_PERIOD)
            return Web3.utils.toBN(8750000).mul(Web3.utils.toBN(1e18));
          var blocks = blockNumber - startBlock;
          if (blocks < 6500 * 15)
            return Web3.utils
            .toBN(1e18)
            .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
              .divn(2730)
              .add(
                Web3.utils
                  .toBN("1450000000000000000000")
                  .muln(blocks)
                  .divn(273)
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
                Web3.utils
                  .toBN("950000000000000000000")
                  .muln(blocks)
                  .divn(273)
              );
          return Web3.utils
            .toBN(1e18)
            .mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2)))
            .divn(35490)
            .add(Web3.utils.toBN("34750000000000000000000000").divn(7))
            .sub(
              Web3.utils.toBN("50000000000000000000").muln(blocks).divn(39)
            );
        },
        getCurrentApy: async function () {
          try {
            return Web3.utils.toBN(
              (
                await axios.get(
                  self.API_BASE_URL +
                    "rgt/apy"
                )
              ).data
            );
          } catch (error) {
            throw "Error retrieving data from Rari API: " + error;
          }
        },
        getUnclaimed: async function (account) {
          return Web3.utils.toBN(
            await self.contracts.RariGovernanceToken.methods
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

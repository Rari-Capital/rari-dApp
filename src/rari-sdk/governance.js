import Web3 from 'web3';
import axios from 'axios';

import Cache from "./cache.js";

const contractAddresses = {
    "RariGovernanceToken": "0x0000000000000000000000000000000000000000",
    "RariGovernanceTokenDistributor": "0x0000000000000000000000000000000000000000"
};

var abis = {};
for (const contractName of Object.keys(contractAddresses)) abis[contractName] = require(__dirname + "/governance/abi/" + contractName + ".json");

export default class Governance {
    API_BASE_URL = "http://localhost:3000/governance/";

    static CONTRACT_ADDRESSES = contractAddresses;
    static CONTRACT_ABIS = abis;

    constructor(web3) {
        this.web3 = web3;
        this.cache = new Cache({ rgtUsdPrice: 900 });

        this.contracts = {};
        for (const contractName of Object.keys(contractAddresses)) this.contracts[contractName] = new web3.eth.Contract(abis[contractName], contractAddresses[contractName]);

        var self = this;
        
        this.rgt = {
            getExchangeRate: async function() {
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
                DISTRIBUTION_START_BLOCK: 11090000,
                DISTRIBUTION_PERIOD: 345600,
                DISTRIBUTION_END_BLOCK: this.DISTRIBUTION_START_BLOCK + this.DISTRIBUTION_PERIOD,
                FINAL_RGT_DISTRIBUTION: Web3.utils.toBN("8750000000000000000000000"),
                getDistributedAtBlock: function(blockNumber) {
                    var startBlock = self.rgt.distributions.DISTRIBUTION_START_BLOCK;
                    if (blockNumber <= startBlock) return Web3.utils.toBN(0);
                    if (blockNumber >= startBlock + 345600) return Web3.utils.toBN(8750000).mul(Web3.utils.toBN(1e18));
                    var blocks = blockNumber - startBlock;
                    if (blocks < 86400) return Web3.utils.toBN("1625000000000000000000").mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2))).divn(3483648).add(Web3.utils.toBN("18125000000000000000000").muln(blocks).divn(3024));
                    if (blocks < 172800) return Web3.utils.toBN("45625000000000000000000").muln(blocks).divn(756).sub(Web3.utils.toBN("125000000000000000000").mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2))).divn(870912)).sub(Web3.utils.toBN("1000000000000000000000000").divn(7));
                    if (blocks < 259200) return Web3.utils.toBN("125000000000000000000").mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2))).divn(3483648).add(Web3.utils.toBN("39250000000000000000000000").divn(7)).sub(Web3.utils.toBN("11875000000000000000000").muln(blocks).divn(3024));
                    return Web3.utils.toBN("125000000000000000000").mul(Web3.utils.toBN(blocks).pow(Web3.utils.toBN(2))).divn(3483648).add(Web3.utils.toBN("34750000000000000000000000").divn(7)).sub(Web3.utils.toBN("625000000000000000000").muln(blocks).divn(432));
                },
                getCurrentApy: async function(pool) {
                    try {
                        return Web3.utils.toBN((await axios.get(self.API_BASE_URL + "rgt/apy/" + ["stable", "yield", "ethereum"][pool])).data);
                    } catch (error) {
                        throw "Error retrieving data from Rari API: " + error;
                    }
                },
                getUnclaimed: async function(account) {
                    return Web3.utils.toBN(await self.contracts.RariGovernanceToken.methods.getUnclaimedRgt(account).call());
                },
                getUnclaimedByPool: async function(account, pool) {
                    return Web3.utils.toBN(await self.contracts.RariGovernanceToken.methods.getUnclaimedRgt(account, pool).call());
                },
                claim: async function(account, options) {
                    return await self.contracts.RariGovernanceTokenDistributor.methods.claimRgt(account).send(options);
                },
                claimByPool: async function(account, pool, options) {
                    return await self.contracts.RariGovernanceTokenDistributor.methods.claimRgt(account, pool).send(options);
                },
                refreshDistributionSpeeds: async function(options) {
                    return await self.contracts.RariGovernanceTokenDistributor.methods.refreshDistributionSpeeds().send(options);
                },
                refreshDistributionSpeedsByPool: async function(pool, options) {
                    return await self.contracts.RariGovernanceTokenDistributor.methods.refreshDistributionSpeeds(pool).send(options);
                }
            },
            balanceOf: async function(account) {
                return Web3.utils.toBN(await self.contracts.RariGovernanceToken.methods.balanceOf(account).call());
            },
            transfer: async function(recipient, amount, options) {
                return await self.contracts.RariGovernanceToken.methods.transfer(recipient, amount).send(options);
            }
        };
    }
};

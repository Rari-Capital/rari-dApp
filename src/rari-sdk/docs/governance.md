# Rari SDK: Governance

The SDK's `Rari.governance` object includes `web3.eth.Contract` objects for each contract as well as wrapper methods and constants for easy implementation.

## **Wrapper APIs**

The following wrapper APIs are available via the `governance` object:

* `governance.rgt`: See [**RGT (Rari Governance Token)**](#rgt-rari-governance-token) section below.
* `governance.rgt.distributions`: See [**Claiming RGT**](#claiming-rgt), [**Get Unclaimed RGT**](#get-unclaimed-rgt), [**RGT Distribution APY**](#get-unclaimed-rgt), [**Distribution Constants**](#distribution-constants), [**Total RGT Distributed**](#total-rgt-distributed), and [**Refresh Distribution Speeds**](#get-unclaimed-rgt) section below.

The wrapper APIs use [BN.js](https://github.com/indutny/bn.js) for large integer support. Most SDK wrapper methods accept `BN` instances as parameters and return BN instances as well. You can find BN.js available at `Rari.BN`.

## **Raw Smart Contract APIs**

All smart contracts are available under `governance.contracts` as [`web3.eth.Contract` objects](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html). The following `Contract` objects are available:

* `governance.contracts.RariGovernanceToken`: The contract behind the Rari Governance Token (RGT), an ERC20 token accounting for the ownership of Rari Stable Pool, Yield Pool, and Ethereum Pool.
* `governance.contracts.RariGovernanceTokenDistributor`: Distributes RGT (Rari Governance Token) to Rari Stable Pool, Yield Pool, and Ethereum Pool holders.

See [`API.md` of the `rari-contracts` repository](https://github.com/Rari-Capital/rari-contracts/blob/master/API.md) for a full reference on the contracts' raw functions. As for the standard ERC20 token functions available in `contracts.RariGovernanceToken.methods` (like `totalSupply`, `transfer`, `transferFrom`, `approve`, `allowance`, etc.), see [EIP-20: ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20) for reference on common functions of ERC20 tokens like RSPT.

Note that you can access deployed contract addresses at `Contract.options.address`. See [the web3.js documentation](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html) for more information on `web3.eth.Contract` objects. Use [`Contract.methods.myMethod.call(options)`](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call) when reading data and [`Contract.methods.myMethod.send(options)`](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send) when changing the state. Note that the `options` object is optional when using `call`, and the `from` parameter is required in the `options` object when using `send`.

## **RGT (Rari Governance Token)**

RGT (Rari Governance Token) is an ERC20 token accounting for the ownership of Rari Stable Pool, Yield Pool, and Ethereum Pool.

### **Get RGT exchange rate:** `governance.rgt.getExchangeRate()`

Returns the exchange rate of RGT in USD as a `BN` (scaled by 1e18).

* Price retrieved via CoinGecko.

### **Get my RGT balance:** `governance.rgt.balanceOf(account)`

Returns the amount of RGT owned by `account` (scaled by 1e18).

* This wrapper function is an alias for `contracts.RariGovernanceToken.methods.balanceOf(account).call()`.
* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
* Return value: A `BN` (scaled by 1e18) indicating the RSPT balance of `account`.

### **Transfer RGT:** `governance.rgt.transfer(recipient, amount, options)`

Transfers RGT in the amount of `amount` to `recipient`.

* This wrapper function is an alias for `contracts.RariGovernanceToken.methods.transfer(recipient, value).send(options)`
* Parameters:
    * `recipient`: A string indicating the recipient Ethereum address of the transfer.
    * `amount`: A `BN` (scaled by 1e18) indicating the RFT amount to transfer.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

### **Other standard ERC20 token functions:** `totalSupply`, `transferFrom`, `approve`, `allowance`, etc. (available in `contracts.RariFundToken.methods`)

See [EIP-20: ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20) for reference on common functions of ERC20 tokens like RSPT. (As described above, use `myMethod.call()` when reading data and `myMethod.send({ from: sender })` when changing the state.)

## **Claiming RGT**

### **Claim unclaimed RGT:** `governance.rgt.distributions.claim(amount, options)`

Claims `amount` unclaimed RGT earned by the sender via liquidity mining across all pools.

* Parameters:
    * `amount`: The amount of RGT to claim.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

### **Claim all unclaimed RGT:** `governance.rgt.distributions.claimAll(options)`

Claims all unclaimed RGT earned by the sender via liquidity mining across all pools.

* Parameters:
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

## **Get Unclaimed RGT**

### **Get all unclaimed RGT:** `governance.rgt.distributions.getUnclaimed(holder)`

Returns the quantity of unclaimed RGT earned by `holder` via liquidity mining across all pools.

* Parameters:
    * `holder`: A string indicating the Ethereum address to check.
* Return value: The quantity of unclaimed RGT.

## **RGT Distribution APY**

### **Get current RGT distribution APY:** `governance.rgt.distributions.getCurrentApy()`

Returns the APY currently earned by all Rari Stable Pool, Yield Pool, and Ethereum Pool holders from RGT distributions.

## **Distribution Constants**

* **Distribution start block number:** `governance.rgt.distributions.DISTRIBUTION_START_BLOCK` returns the starting block number of RGT distributions.
* **Distribution period length:** `governance.rgt.distributions.DISTRIBUTION_PERIOD` returns `345600`.
* **Distribution end block number:** `governance.rgt.distributions.DISTRIBUTION_END_BLOCK` returns the ending block number of RGT distributions.
* **Total RGT (to be) distributed via liquidity mining:** `governance.rgt.distributions.FINAL_RGT_DISTRIBUTION` returns a `BN` equal to `8750000e18`.

## **Total RGT Distributed**

### **Get total RGT distributed:** `governance.rgt.distributions.getDistributedAtBlock(blockNumber)`

Returns the amount of RGT earned via liquidity mining at the given `blockNumber`.

* [See this graph for a visualization of RGT distributed via liquidity mining vs. blocks since distribution started.](https://www.desmos.com/calculator/2yvnflg4ir)

## **Refresh Distribution Speeds**

### **Refresh all distribution speeds:** `governance.rgt.distributions.refreshDistributionSpeeds(options)`

Updates RGT distribution speeds for each pool.

* Warning: This function uses a large quantity of gas (around 1.5 million on average).
* Parameters:
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

### **Refresh one pool's distribution speeds:** `governance.rgt.distributions.refreshDistributionSpeedsByPool(pool, options)`

Updates RGT distribution speeds for each pool given the `pool` whose balance should be refreshed.

* Warning: This function uses a large quantity of gas (around 500k on average).
* Parameters:
    * `pool`: A `Number` indicating the `RariGovernanceTokenDistributor.RariPool` to refresh.
        * `Stable = 0`
        * `Yield = 1`
        * `Ethereum = 2`
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

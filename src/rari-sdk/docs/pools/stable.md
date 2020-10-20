# Rari SDK: Stable Pool

The SDK's `Rari.pools.stable` object includes `web3.eth.Contract` objects for each contract as well as wrapper methods and constants for easy implementation.

## **Wrapper APIs**

The following wrapper APIs are available via the `pools.stable` object:

* `pools.stable.apy`: See [**Stable Pool APY**](#stable-pool-apy) section below.
* `pools.stable.balances`: See [**My USD Balance and Interest**](#my-usd-balance-and-interest) and [**Total Supply and Interest**](#total-supply-and-interest) sections below.
* `pools.stable.deposits`: See [**Deposits**](#deposits) section below.
* `pools.stable.withdrawals`: See [**Withdrawals**](#withdrawals) section below.
* `pools.stable.rspt`: See [**RSPT (Rari Stable Pool Token)**](#rspt-rari-stable-pool-token) section below.
* `pools.stable.fees`: See [**Fees on Interest**](#fees-on-interest) section below.
* `pools.stable.allocations`: See [**Raw Allocations**](#raw-allocations) and [**Internal Stablecoin Pricing**](#internal-stablecoin-pricing) sections below.
* `pools.stable.history`: See [**Historical Data**](#historical-data) section below.

The wrapper APIs use [BN.js](https://github.com/indutny/bn.js) for large integer support. Most SDK wrapper methods accept `BN` instances as parameters and return BN instances as well. You can find BN.js available at `Rari.BN`.

Note that many of the API methods rely on `pools.stable.cache`. You can modify the cache timeouts (in seconds) via `pools.stable.cache._raw["key"].timeout`.

## **Raw Smart Contract APIs**

All smart contracts are available under `pools.stable.contracts` as [`web3.eth.Contract` objects](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html). The following `Contract` objects are available:

* `pools.stable.contracts.RariFundController`: Holds Rari Stable Pool funds and is used by the rebalancer to deposit and withdraw from pools and make exchanges.
* `pools.stable.contracts.RariFundManager`: The Rari Stable Pool's main contract: it handles deposits, withdrawals, USD balances, interest, fees, etc.
* `pools.stable.contracts.RariFundToken`: The Rari Stable Pool Token (RSPT) is an ERC20 token used to internally account for ownership of assets under management (AUM).
* `pools.stable.contracts.RariFundPriceConsumer`: Retrieves stablecoin prices from Chainlink's public price feeds (used by `RariFundManager` and `RariFundController`).
* `pools.stable.contracts.RariFundProxy`: Includes wrapper functions built on top of `RariFundManager`: exchange and deposit, withdraw and exchange, deposit without paying gas via the Gas Station Network (GSN).

See [`API.md` of the `rari-contracts` repository](https://github.com/Rari-Capital/rari-contracts/blob/master/API.md) for a full reference on the contracts' raw functions. As for the standard ERC20 token functions available in `contracts.RariFundToken.methods` (like `totalSupply`, `transfer`, `transferFrom`, `approve`, `allowance`, etc.), see [EIP-20: ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20) for reference on common functions of ERC20 tokens like RSPT.

Note that you can access deployed contract addresses at `Contract.options.address`. See [the web3.js documentation](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html) for more information on `web3.eth.Contract` objects. Use [`Contract.methods.myMethod.call(options)`](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call) when reading data and [`Contract.methods.myMethod.send(options)`](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send) when changing the state. Note that the `options` object is optional when using `call`, and the `from` parameter is required in the `options` object when using `send`.

## **Stable Pool APY**

### **Get current raw APY (before fees):** `pools.stable.apy.getCurrentRawApy()`

Returns the current raw APY (before fees) of the Rari Stable Pool.

* Return value: A `BN` (where 100% = 1e18) indicating the current raw APY (before fees).

### **Get current APY (after fees):** `pools.stable.apy.getCurrentApy()`

Returns the current APY (after fees) of the Rari Stable Pool.

* Return value: A `BN` (where 100% = 1e18) indicating the current APY (after fees).

### **Calculate APY over time range (after fees):** `pools.stable.apy.calculateApy(startTimestamp, startRsptExchangeRate, endTimestamp, endRsptExchangeRate)`

Returns an APY given a time range and the RSPT exchange rates at the beginning and end of the time range.

* Parameters:
    * `startTimestamp`: A Unix epoch timestamp (in seconds) indicating the beginning of the time range.
    * `startRsptExchangeRate`: A `BN` indicating the RSPT exchange rate at the beginning of the time range (see `rspt.getExchangeRate`).
    * `endTimestamp`: A Unix epoch timestamp (in seconds) indicating the end of the time range.
    * `endRsptExchangeRate`: A `BN` indicating the RSPT exchange rate at the end of the time range (see `rspt.getExchangeRate`).
* Return value: A `BN` (where 100% = 1e18) indicating the APY over the time range.

### **Get APY over block range (after fees):** `pools.stable.apy.getApyOverBlocks([fromBlock[, toBlock]])`

Returns an APY given a block range (by retrieving the RSPT exchange rates at `fromBlock` and `toBlock`).

* Please note that accessing historical data may require a Web3 provider with archive data.
* Parameters:
    * `fromBlock`: A `Number` indicating the beginning of the block range. Defaults to 0.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the end of the block range. Defaults to `"latest"`.
* Return value: A `BN` (where 100% = 1e18) indicating the APY over the block range.

### **Get APY over time range (after fees):** `pools.stable.apy.getApyOverTime([fromTimestamp[, toTimestamp]])`

Returns an APY given a time range (by retrieving the RSPT exchange rates at `fromTimestamp` and `toTimestamp`).

* Please note that this method makes use of the [Rari API](https://github.com/Rari-Capital/rari-api).
* Parameters:
    * `startTimestamp`: A Unix epoch timestamp (in seconds) indicating the beginning of the time range. Defaults to 0.
    * `endTimestamp`: A Unix epoch timestamp (in seconds) or the string `"latest"` indicating the end of the time range. Defaults to `"latest"`.
* Return value: A `BN` (where 100% = 1e18) indicating the APY over the time range.

## **My USD Balance and Interest**

### **Get my USD balance supplied:** `pools.stable.balances.balanceOf(account)`

Returns the total balance supplied to the Rari Stable Pool by `account` in USD (scaled by 1e18).

* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
* Return value: A `BN` (scaled by 1e18) indicating the balance supplied by `account` in USD.

### **Get my interest accrued:** `pools.stable.balances.interestAccruedBy(account[, fromBlock[, toBlock]])`)`

Returns the total amount of interest accrued by `account` in USD (scaled by 1e18).

* Please note that this method makes use of the [Rari API](https://github.com/Rari-Capital/rari-api).
* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
    * `fromBlock`: An optional `Number` (or the string `"latest"`) indicating the minimum block number to track. Defaults to 0.
    * `toBlock`: An optional `Number` (or the string `"latest"`) indicating the maximum block number to track. Defaults to `"latest"`.
* Return value: A `BN` (scaled by 1e18) indicating the amount of interest accrued by `account` in USD.

### **Transfer my USD holdings:** `pools.stable.balances.transfer(recipient, amount, options)`

Transfers `amount` USD of your Rari Stable Pool holdings to `recipient`.

* Under the hood, transfers the RFT amount equivalent to this USD `amount`.
* Parameters:
    * `recipient`: A string indicating the Ethereum account address to recieve the funds.
    * `amount`: A `BN` (scaled by 1e18) indicating the USD amount to be transferred.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

## **Deposits**

### **Get depositable currencies:** `pools.stable.deposits.getDepositCurrencies()`

Returns an array of currency codes accepted for deposit to the Rari Stable Pool. Token data for all tokens (i.e., all currency codes besides ETH) should be accessible via `rari.getAllTokens([cacheTimeout])`.

### **Get currencies directly depositable without exchange slippage:** `pools.stable.deposits.getDirectDepositCurrencies()`

Returns an array of currency codes accepted for direct deposit. If the desired deposit currency is not accepted, we must exchange to and deposit an accepted currency.

### **Get USD account balance limit (only applies to new deposits):** `pools.stable.deposits.getAccountBalanceLimit(account)`

Returns the account balance limit of `account` in USD (scaled by 1e18). Account balance limits only apply to new deposits.

* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
* Return value: A `BN` (scaled by 1e18) indicating the account balance limit of `account` in USD.

### **Get default USD account balance limit (only applies to new deposits):** `pools.stable.deposits.getDefaultAccountBalanceLimit()`

Returns the default account balance limit in USD (scaled by 1e18). Account balance limits only apply to new deposits.

* Return value: A `BN` (scaled by 1e18) indicating the default account balance limit in USD.

### **Validate deposit to Rari:** `pools.stable.deposits.validateDeposit(currencyCode, amount, sender)`

Returns the USD amount (scaled by 1e18) actually added to the sender's RSP balance by a deposit of `amount` in `currencyCode`.

* Parameters:
    * `currencyCode`: A string indicating the symbol of the currency to deposit.
    * `amount`: A `BN` (scaled by 10 to the power of the decimal precision of `currencyCode`) indicating the deposit amount.
    * `sender`: The `sender` of the deposit.
* Return value: A `BN` (scaled by 1e18) indicating the USD amount that would actually be added to the sender's RSP balance.

### **Deposit funds to Rari:** `pools.stable.deposits.deposit(currencyCode, amount, minUsdAmount, options)`

Approves (if necessary) and deposits `amount` of `currencyCode` to the Rari Stable Pool (unless the USD amount added to the sender's RSP balance is less than `minUsdAmount`).

* Parameters:
    * `currencyCode`: A string indicating the symbol of the currency to deposit.
    * `amount`: A `BN` (scaled by 10 to the power of the decimal precision of `currencyCode`) indicating the deposit amount.
    * `minUsdAmount`: A `BN` (scaled by 1e18) indicating the minimum USD amount to be added to the sender's RSP balance to execute the transaction.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).
* Return value: An array containing a `BN` (scaled by 1e18) indicating the USD amount that was removed from the sender's RSP balance, a `BN` (scaled by 1e18) indicating the 0x exchange protocol fee (if any), the approval transaction receipt (if any), and the deposit transaction receipt.

## **Withdrawals**

### **Get withdrawable currencies:** `pools.stable.withdrawals.getWithdrawalCurrencies()`

Returns an array of currency codes accepted for withdrawal from the Rari Stable Pool. Token data for all tokens (i.e., all currency codes besides ETH) should be accessible via `rari.getAllTokens([cacheTimeout])`.

### **Get raw balances of each currency withdrawable directly without exchange slippage:** `pools.stable.allocations.getAllocationsByCurrency()`

Returns an object containing the maximum direct withdrawal amount (as a `BN`) for each currency code. If there is not enough of the desired withdrawal currency in the Rari Stable Pool, other currencies must be withdrawn and exchanged.

* The raw balance allocated to a currency is also the maximum directly withdrawable quantity of that currency. See **Raw Allocations** for more infomation.

### **Validate withdrawal from Rari:** `pools.stable.withdrawals.validateWithdrawal(currencyCode, amount, sender)`

Returns the USD amount (scaled by 1e18) actually removed from the sender's RSP balance by a withdrawal of `amount` in `currencyCode`.

* Parameters:
    * `currencyCode`: A string indicating the symbol of the currency to withdraw.
    * `amount`: A `BN` (scaled by 10 to the power of the decimal precision of `currencyCode`) indicating the withdrawal amount.
* Return value: A `BN` (scaled by 1e18) indicating the USD amount that would actually be removed from the sender's RSP balance.

### **Withdraw funds from Rari:** `pools.stable.withdrawals.withdraw(currencyCode, amount, maxUsdAmount, options)`

Withdraws `amount` of `currencyCode` from the Rari Stable Pool (unless the USD amount removed from the sender's RSP balance is greater than `maxUsdAmount`).

* Parameters:
    * `currencyCode`: A string indicating the symbol of the currency to withdraw.
    * `amount`: A `BN` (scaled by 10 to the power of the decimal precision of `currencyCode`) indicating the withdrawal amount.
    * `maxUsdAmount`: A `BN` (scaled by 1e18) indicating the maximum USD amount to be removed from the sender's RSP balance to execute the transaction.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).
* Return value: An array containing a `BN` (scaled by 1e18) indicating the USD amount that was removed from the sender's RSP balance, a `BN` (scaled by 1e18) indicating the 0x exchange protocol fee (if any), and a withdrawal transaction receipt.

## **RSPT (Rari Stable Pool Token)**

RSPT (Rari Stable Pool Token) is an internal token-based representation of the USD balance supplied to the Rari Stable Pool.

### **Get RSPT exchange rate:** `pools.stable.rspt.getExchangeRate([blockNumber])`

Returns the exchange rate of RSPT in USD as a `BN` (scaled by 1e18).

* Under the hood, divides the total supplied to the Rari Stable Pool by the total supply of RSPT.
* Parameters:
    * `account`: An optional `Number` specifying the block number for which to retrieve data (but note that accessing historical data may require a Web3 provider with archive data).

### **Get my RSPT balance:** `pools.stable.rspt.balanceOf(account)`

Returns the amount of RSPT owned by `account` (scaled by 1e18).

* RSPT (Rari Stable Pool Token) is an internal token-based representation of the USD balance supplied to the Rari Stable Pool.
* This wrapper function is an alias for `contracts.RariFundToken.methods.balanceOf(account).call()`.
* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
* Return value: A `BN` (scaled by 1e18) indicating the RSPT balance of `account`.

### **Transfer RSPT:** `pools.stable.rspt.transfer(recipient, amount, options)`

Transfers RSPT in the amount of `amount` to `recipient`.

* This wrapper function is an alias for `contracts.RariFundToken.methods.transfer(recipient, value).send(options)`
* Parameters:
    * `recipient`: A string indicating the recipient Ethereum address of the transfer.
    * `amount`: A `BN` (scaled by 1e18) indicating the RFT amount to transfer.
    * `options`: An object specifying `from` (required) and, optionally, `gas`, and/or `gasPrice` ([see the web3.js docs for details](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send)).

### **Other standard ERC20 token functions:** `totalSupply`, `transferFrom`, `approve`, `allowance`, etc. (available in `contracts.RariFundToken.methods`)

See [EIP-20: ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20) for reference on common functions of ERC20 tokens like RSPT. (As described above, use `myMethod.call()` when reading data and `myMethod.send({ from: sender })` when changing the state.)

## **Total Supply and Interest**

### **Get total USD supplied (by all users):** `pools.stable.balances.getTotalSupply()`

Returns the Rari Stable Pool's total investor balance (all RSPT holders' funds but not unclaimed fees) of all currencies in USD (scaled by 1e18).

### **Get total interest accrued (by all users):** `pools.stable.balances.getTotalInterestAccrued([fromBlock[, toBlock]])`

Returns the total amount of interest accrued by past and current RSPT holders (excluding the fees paid on interest) in USD (scaled by 1e18).

* Parameters:
    * `fromBlock`: An optional `Number` (or the string `"latest"`) indicating the minimum block number to track. Defaults to 0.
    * `toBlock`: An optional `Number` (or the string `"latest"`) indicating the maximum block number to track. Defaults to `"latest"`.

## **Fees on Interest**

Rari Capital currently takes a *20% performance fee* on all interest accrued by the Rari Stable Pool. This fee is liable to change in the future, but you can use the following method to check its current value at any time.

### **Get interest fee rate:** `pools.stable.fees.getInterestFeeRate()`

Returns the fee rate on interest (proportion of raw interest accrued scaled by 1e18).

## **Raw Allocations**

### **Get all stablecoins supported for allocation:** `pools.stable.allocations.CURRENCIES`

Constant array of currency codes supported for potential allocation by the Rari Stable Pool: DAI, USDC, USDT, TUSD, BUSD, sUSD, and mUSD, in that order (indexes are the same throughout our smart contracts and SDK).

### **Get all pools supported for allocation:** `pools.stable.allocations.POOLS`

Constant array of pool names supported for potential allocation by the Rari Stable Pool: dYdX, Compound, Aave, and mStable, in that order (indexes are the same throughout our smart contracts and SDK).

### **Get supported pools for each supported currency:** `pools.stable.allocations.POOLS_BY_CURRENCY`

Constant object of currency codes mapped to arrays of pool names supported for potential allocation by the Rari Stable Pool.

### **Get raw allocations by currency (including unclaimed fees on interest):** `pools.stable.allocations.getRawCurrencyAllocations()`

Returns an object containing the raw balance allocated to each currency as a `BN`.

* The raw balance allocated to a currency is also the maximum directly withdrawable quantity of that currency. See **Withdrawals** for more infomation.

### **Get raw allocations by subpool (including unclaimed fees on interest):** `pools.stable.allocations.getRawPoolAllocations()`

Returns an object containing the raw balance in USD allocated to each subpool as a `BN` (as well as a `BN` named `_cash` for unallocated funds).

### **Get all raw currency/subpool allocations (including unclaimed fees on interest):** `pools.stable.allocations.getRawAllocations()`

Returns an object containing currency codes mapped to objects containing the raw balance allocated to each subpool as a `BN` (as well as a `BN` named `_cash` for unallocated funds) for each currency.

## **Internal Stablecoin Pricing**

### **Get stablecoin prices (used internally by contracts):** `pools.stable.allocations.getCurrencyUsdPrices()`

Returns an object containing the price in USD (scaled by 1e18) for each supported stablecoin to which funds can be allocated.

* Use these prices to calculate the value added to a user's USD balance due to a direct deposit and the value subtracted from a user's USD balance due to a direct withdrawal.

## **Historical Data**

### **Get Stable Pool APY history:** `pools.stable.history.getApyHistory([fromTimestamp[, toTimestamp[, intervalSeconds]]])`

Returns an array of objects containing `blockNumber`, `timestamp`, and `apy` (scaled by 1e18, in string format) from `fromTimestamp` to `toTimestamp`.

* Parameters:
    * `fromTimestamp`: A `Number` (or the string `"latest"`) indicating the minimum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `toTimestamp`: A `Number` (or the string `"latest"`) indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `intervalSeconds`: A `Number` indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `86400`.
* Return value: An array of objects containing `blockNumber`, `timestamp`, and `apy` (scaled by 1e18, in string format).

### **Get total supply history:** `pools.stable.history.getTotalSupplyHistory([fromTimestamp[, toTimestamp[, intervalSeconds]]])`

Returns an array of objects containing `blockNumber`, `timestamp`, and `totalSupply` (by all users, in USD, scaled by 1e18, in string format) from `fromTimestamp` to `toTimestamp`.

* Parameters:
    * `fromTimestamp`: A `Number` (or the string `"latest"`) indicating the minimum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `toTimestamp`: A `Number` (or the string `"latest"`) indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `intervalSeconds`: A `Number` indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `86400`.
* Return value: An array of objects containing `blockNumber`, `timestamp`, and `totalSupply` (by all users, in USD, scaled by 1e18, in string format).

### **Get account USD supply balance history:** `pools.stable.history.getBalanceHistoryOf(account[, fromTimestamp[, toTimestamp[, intervalSeconds]]])`

Returns an array of objects containing `blockNumber`, `timestamp`, and `balance` (of `account`, in USD, scaled by 1e18, in string format) from `fromTimestamp` to `toTimestamp`.

* Parameters:
    * `account`: A string indicating the Ethereum account address in question.
    * `fromTimestamp`: A `Number` (or the string `"latest"`) indicating the minimum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `toTimestamp`: A `Number` (or the string `"latest"`) indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `intervalSeconds`: A `Number` indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `86400`.
* Return value: An array of objects containing `blockNumber`, `timestamp`, and `balance` (in USD, scaled by 1e18, in string format).

### **Get RSPT exchange rate history:** `pools.stable.history.getRsptExchangeRateHistory([fromTimestamp[, toTimestamp[, intervalSeconds]]])`

Returns an array of objects containing `blockNumber`, `timestamp`, and `rate` (in USD, scaled by 1e18, in string format) from `fromTimestamp` to `toTimestamp`.

* Parameters:
    * `fromTimestamp`: A `Number` (or the string `"latest"`) indicating the minimum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `toTimestamp`: A `Number` (or the string `"latest"`) indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `"latest"`.
    * `intervalSeconds`: A `Number` indicating the maximum Unix epoch timestamp from which to retrieve data points. Defaults to `86400`.
* Return value: An array of objects containing `blockNumber`, `timestamp`, and `rate` (in USD, scaled by 1e18, in string format).

### **Get pool allocation history:** `pools.stable.history.getPoolAllocationHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundController.PoolAllocation` event objects from `fromBlock` to `toBlock` filtered by the filter parameter.

* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`action`, `pool`, and/or `currencyCode`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `action` (indexed): A `Number` indicating of one of the following `RariFundController.PoolAllocationAction` options:
        * `Deposit = 0`
        * `Withdraw = 1`
        * `WithdrawAll = 2`
    * `pool` (indexed): A `Number` indicating the index of the pool in `pools.stable.allocations.POOLS`.
    * `currencyCode` (indexed): A string indicating the currency code of the allocation.
    * `amount`: A string indicating the amount transferred by the allocation (N/A when `action = WithdrawAll`).

### **Get currency exchange history:** `pools.stable.history.getCurrencyExchangeHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundController.CurrencyTrade` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`inputCurrencyCode`, `outputCurrencyCode`, and/or `exchange`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `inputCurrencyCode` (indexed): A string indicating the input currency code sold by the exchange trade.
    * `outputCurrencyCode` (indexed): A string indicating the output currency code bought by the exchange trade.
    * `exchange` (indexed): A `Number` indicating one of the following `RariFundController.CurrencyExchange` options:
        * `ZeroEx = 0`
        * `mStable = 1`
    * `inputAmount`: The amount of `inputCurrencyCode` sold by the exchange.
    * `inputAmountUsd`: The input amount sold by the exchange in USD.
    * `outputAmount`: The amount of `outputCurrencyCode` bought by the exchange.
    * `inputAmountUsd`: The output amount bought by the exchange in USD.

### **Get direct deposit history:** `pools.stable.history.getDepositHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundManager.Deposit` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* This function aggregates events from all past versions of `RariFundManager`.
* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`currencyCode`, `sender`, and/or `payee`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `currencyCode` (indexed): A string indicating the currency code of the deposit.
    * `sender` (indexed): Sender account of the deposit (equal to the `RariFundProxy` address when exchanging before deposit).
    * `payee` (indexed): Destination account of the deposit.
    * `amount`: A string indicating the amount of `currencyCode` deposited.
    * `amountUsd`: A string indicating the amount deposited in USD.

### **Get direct withdrawal history:** `pools.stable.history.getWithdrawalHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundManager.Withdrawal` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* This function aggregates events from all past versions of `RariFundManager`.
* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`currencyCode`, `sender`, and/or `payee`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `currencyCode` (indexed): A string indicating the currency code of the withdrawal.
    * `sender` (indexed): Sender account of the withdrawal (equal to the `RariFundProxy` address when exchanging after withdrawal)
    * `payee` (indexed): Destination account of the withdrawal.
    * `amount`: A string indicating the amount of `currencyCode` withdrawn.
    * `amountUsd`: A string indicating the amount withdrawn in USD.

### **Get pre-deposit exchange history:** `pools.stable.history.getPreDepositExchangeHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundProxy.PreDepositExchange` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* This function aggregates events from all past versions of `RariFundProxy`.
* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`inputErc20Contract`, `outputCurrencyCode`, and/or `payee`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `inputErc20Contract` (indexed): A string indicating the ERC20 contract address of the input token sent by the user and sold by the exchange.
    * `outputCurrencyCode` (indexed): A string indicating the output currency code bought by the exchange and directly deposited to Rari for `payee`.
    * `payee` (indexed): Sender and destination account of the deposit.
    * `inputAmount`: A string indicating the amount of `inputErc20Contract` sent by the user.
    * `inputAmountUsd`: A string indicating the amount sent by the user in USD.
    * `outputAmount`: A string indicating the amount of `outputCurrencyCode` deposited to the Rari Stable Pool in USD.
    * `outputAmountUsd`: A string indicating the amount deposited to the Rari Stable Pool in USD.

### **Get post-withdrawal exchange history:** `pools.stable.history.getPostWithdrawalExchangeHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of `RariFundProxy.PostWithdrawalExchange` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* This function aggregates events from all past versions of `RariFundProxy`.
* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`inputCurrencyCode`, `outputErc20Contract`, and/or `payee`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `inputCurrencyCode` (indexed): A string indicating the output currency code directly withdrawn from Rari and sold by the exchange.
    * `outputErc20Contract` (indexed): A string indicating the ERC20 contract address of the input token bought by the exchange and sent to `payee`.
        * If output currency is ETH, set to `0x0000000000000000000000000000000000000000`.
    * `payee` (indexed): Sender and destination account of the withdrawal.
    * `inputAmount`: A string indicating the amount of `inputCurrencyCode` withdrawn from the Rari Stable Pool.
    * `inputAmountUsd`: A string indicating the amount withdrawn from the Rari Stable Pool in USD.
    * `outputAmount`: A string indicating the amount of `outputErc20Contract` sent to the user.
    * `outputAmountUsd`: A string indicating the amount sent to the user in USD.

### **Get RSPT transfer history:** `pools.stable.history.getRsftTransferHistory([fromBlock[, toBlock[, filter]]])`

Returns an array of RSPT `Transfer` [event objects](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) from `fromBlock` to `toBlock` filtered by the filter parameter.

* This function aggregates events from all past versions of `RariFundToken`.
* Parameters:
    * `fromBlock`: A `Number` (or the string `"latest"`) indicating the minimum block number from which to retrieve events. Defaults to `"latest"`.
    * `toBlock`: A `Number` (or the string `"latest"`) indicating the maximum block number from which to retrieve events. Defaults to `"latest"`.
    * `filter`: An optional object containing any of the indexed event properties listed below (`from` and/or `to`).
* Return value: An array of event objects. See the [web3.js documentation](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events-return) for more information.
* Event properties (found in the `returnValues` property of an event object):
    * `inputCurrencyCode` (indexed): A string indicating the output currency code directly withdrawn from Rari and sold by the exchange.
    * `outputErc20Contract` (indexed): A string indicating the ERC20 contract address of the input token bought by the exchange and sent to `payee`.
        * If output currency is ETH, set to `0x0000000000000000000000000000000000000000`.
    * `payee` (indexed): Sender and destination account of the withdrawal.
    * `inputAmount`: A string indicating the amount of `inputCurrencyCode` withdrawn from the Rari Stable Pool.
    * `inputAmountUsd`: A string indicating the amount withdrawn from the Rari Stable Pool in USD.
    * `outputAmount`: A string indicating the amount of `outputErc20Contract` sent to the user.
    * `outputAmountUsd`: A string indicating the amount sent to the user in USD.

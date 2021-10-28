# Rari SDK: Ethereum Pool

The SDK's `Rari.pools.ethereum` object is identical to [the `Rari.pools.stable` object](stable.md), with the exception of all contract addresses as well as the following changes:

- No USD quantities are accepted or returned: all of these quantities are based in ETH, unless the user is depositing or withdrawing another currency.
- `pools.ethereum.contracts.RariFundPriceConsumer` does not exist: the Ethereum Pool does not make use of a `RariFundPriceConsumer` because the pool is based only in ETH.
- `pools.ethereum.rept`: wrapper functions for the Rari Ethereum Pool Token.
- `pools.ethereum.rept.getExchangeRate([blockNumber])` returns the ETH price of REPT.
- `pools.ethereum.allocations.CURRENCIES` does not exist: the only currency allocated to by the Ethereum Pool is ETH.
- `pools.ethereum.allocations.POOLS = ["dYdX", "Compound", "KeeperDAO", "Aave"]`
- `pools.yield.allocations.POOLS_BY_CURRENCY` does not exist: the only currency allocated to by the Ethereum Pool is ETH.
- `pools.ethereum.allocations.getAllocationsByCurrency()` does not exist: instead, `pools.ethereum.balances.getTotalSupply()` returns the quantity of ETH (as a `BN`, scaled by 1e18) supplied to the fund and available for direct withdrawal.
- `pools.ethereum.allocations.getRawPoolAllocations` returns ETH quantities, not USD quantities.
- `pools.ethereum.allocations.getRawAllocations` does not exist.
- `pools.ethereum.allocations.getCurrencyUsdPrices()` does not exist: the Ethereum Pool does not make use of USD prices because the pool is based only in ETH.
- `pools.ethereum.balances.transfer(recipient, amount, options)` transfers an ETH quantity, not a USD quantity.
- `pools.ethereum.deposits.getDirectDepositCurrencies()` does not exist: the only currency accepted for direct deposit to the Ethereum Pool is Ethereum (ETH).
- `pools.ethereum.deposits.validateDeposit(currencyCode, amount, sender)` returns the ETH amount (scaled by 1e18) actually added to the sender's REP balance.
- `pools.ethereum.deposits.deposit(currencyCode, amount, minEthAmount, options)` accepts `minEthAmount`, not `minUsdAmount`.
- `pools.ethereum.withdrawals.validateWithdrawal(currencyCode, amount, sender)` returns the ETH amount (scaled by 1e18) actually removed from the sender's REP balance.
- `pools.ethereum.withdrawals.withdraw(currencyCode, amount, maxEthAmount, options)` accepts `maxEthAmount`, not `maxUsdAmount`.
- `pools.ethereum.history.getCurrencyExchangeHistory` returns `RariFundController.CompToEthTrade` events.
- `pools.ethereum.history.getPoolAllocationHistory` returns events without `currencyCode` parameters.
- `pools.ethereum.history.getReptExchangeRateHistory`
- `pools.ethereum.history.getReptTransferHistory`

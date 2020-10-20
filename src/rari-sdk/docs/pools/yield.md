# Rari SDK: Yield Pool

The SDK's `Rari.pools.yield` object is identical to [the `Rari.pools.stable` object](stable.md), with the exception of all contract addresses as well as the following changes:

* `pools.ethereum.rypt`: wrapper functions for the Rari Yield Pool Token.
* `pools.yield.allocations.POOLS = ["dYdX", "Compound", "Aave", "mStable", "yVault"]`
* `pools.yield.allocations.POOLS_BY_CURRENCY` now includes `"yVault"`.
* `pools.ethereum.history.getRyptExchangeRateHistory`
* `pools.ethereum.history.getRyptTransferHistory`

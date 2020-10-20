# Rari SDK: Yield Pool

The SDK's `Rari.pools.yield` object is identical to [the `Rari.pools.stable` object](stable.md), with the exception of all contract addresses, `pools.yield.rept`,the `pools.yield.allocations.POOLS` constant (which is equal to `["dYdX", "Compound", "Aave", "mStable", "yVault"]`), and the `pools.yield.allocations.POOLS_BY_CURRENCY` (which now includes `"yVault"`).

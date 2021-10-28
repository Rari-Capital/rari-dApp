# Rari Capital: Fuse JavaScript SDK

Calling all DeFi developers: Rari Capital's SDK is now available for easy implementation of our smart contract APIs! Simply install the SDK and instantiate the `Fuse` class. See [here for the Fuse dApp](https://github.com/Rari-Capital/fuse-dapp) or [here for the Fuse contracts](https://github.com/Rari-Capital/fuse-contracts).

## Installation

### Node.js

Install the SDK as a dependency of your project:

```
npm install --save @Rari-Capital/fuse-sdk
```

Import the `fuse-sdk` package:

```
const Fuse = require("@Rari-Capital/fuse-sdk");
```

### Browser

Include the prebuilt `dist/fuse.window.js` in your HTML to expose the `Fuse` class on the `window` object:

```
<script src="dist/fuse.window.js">
```

## Instantiation

The `Fuse` class is instantiated with a Web3 provider as the sole constructor parameter.

### Node.js

```
var fuse = new Fuse("http://localhost:8545");
```

### Browser

```
var fuse = new Fuse(window.ethereum || "http://localhost:8545");
```

## `Fuse` Class API

The `Fuse` class is not very useful unless instantiated, except for a couple objects:

### SDK web3.js Class: `Fuse.Web3`

Access the underlying web3.js class used by the SDK.

### SDK web3.js Class: `Fuse.BN`

Access the underlying `BN` class used by the SDK. (Alias for `Fuse.Web3.utils.BN`.)

## `Fuse` Instance API

The following objects are available on instances of the `Fuse` class:

### Deploy Fuse Pool: `Fuse.deployPool(poolName, isPrivate, closeFactor, maxAssets, liquidationIncentive, priceOracle, options)`

Deploys a new Fuse pool and registers it in the `FusePoolDirectory`.

### Deploy Asset to Fuse Pool: `Fuse.deployAsset(conf, collateralFactor, options)`

Deploys a new asset to an existing Fuse pool.

### Compute Fuse Pool Contract Address: `Fuse.getCreate2Address(creatorAddress, salt, byteCode)`

Returns the `Unitroller` contract (the proxy for the `Comptroller` implementation contract) address from the `creatorAddress` (the `FusePoolDirectory` contract address that deployed the pool), the `salt` (the pool name), and the `Unitroller` proxy contract bytecode.

### SDK web3.js Instance: `Fuse.web3`

Access the underlying web3.js instance used by the SDK.

## Examples

### Deploy New Fuse Pool

```
// Set parameters
var poolName = "Compound Finance";
var isPrivate = false;
var closeFactor = Web3.utils.toBN(0.051e18);
var maxAssets = Web3.utils.toBN(10);
var liquidationIncentive = Web3.utils.toBN(1e18);
var priceOracle = "ChainlinkPriceOracle"; // Or set to an address to use an existing price oracle

// Deploy new Fuse pool
try {
    var [poolAddress, receipt] = await fuse.deployPool(poolName, isPrivate, closeFactor, maxAssets, liquidationIncentive, priceOracle, { from: "0x0000000000000000000000000000000000000000" });
} catch (error) {
    return console.error(error);
}

// Log deployed pool contract address and transaction receipt
console.log("Deployed Fuse pool contract address:", poolAddress);
console.log("Deployment transaction receipt:", receipt);
```

### Deploy Asset to Fuse Pool

```
// Set parameters
var conf = {
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", // Leave blank for ETH
    comptroller: "0x0000000000000000000000000000000000000000", // Fuse pool contract address
    interestRateModel: "WhitePaperInterestRateModel", // Or set to an address to use an existing interest rate model
    initialExchangeRateMantissa: Web3.utils.toBN(2e18),
    name: "Compound DAI",
    symbol: "cDAI",
    decimals: 8,
    admin: "0x0000000000000000000000000000000000000000"
};

var collateralFactor = Web3.utils.toBN(0.5e18);

// Deploy new Fuse pool
try {
    var [poolAddress, receipt] = await App.fuse.deployAsset(conf, collateralFactor, { from: "0x0000000000000000000000000000000000000000" });
} catch (error) {
    return console.error(error);
}

// Log deployed pool asset contract address and transaction receipt
console.log("Deployed Fuse pool asset contract address:", poolAddress);
console.log("Deployment transaction receipt:", receipt);
```

## Development

To build the production browser distribution bundle, run `npm run build`. To build the development browser distribution bundle, run `npm run dev`.

## License

See `LICENSE`.

## Credits

Fuse's SDK is developed by [David Lucid](https://github.com/davidlucid) of Rari Capital. Find out more about Rari Capital at [rari.capital](https://rari.capital).

# Rari Capital: Faucet JavaScript SDK

## Installation

### Node.js

Install the SDK as a dependency of your project:

```
npm install --save @Rari-Capital/faucet-sdk
```

Import the `faucet-sdk` package:

```
const Faucet = require("@Rari-Capital/faucet-sdk");
```

### Browser

Include the prebuilt `dist/faucet.window.js` in your HTML to expose the `Faucet` class on the `window` object:

```
<script src="dist/faucet.window.js">
```

## Instantiation

The `Faucet` class is instantiated with a Web3 provider as the sole constructor parameter.

### Node.js

```
var faucet = new Faucet("http://localhost:8545");
```

### Browser

```
var faucet = new Faucet(window.ethereum || "http://localhost:8545");
```

## `Faucet` Class API

The `Faucet` class is not very useful unless instantiated, except for a couple objects:

### SDK web3.js Class: `Faucet.Web3`

Access the underlying web3.js class used by the SDK.

### SDK web3.js Class: `Faucet.BN`

Access the underlying `BN` class used by the SDK. (Alias for `Faucet.Web3.utils.BN`.)

## `Faucet` Instance API

The following objects are available on instances of the `Faucet` class:

### Compute Faucet Pool Contract Address: `Faucet.getCreate2Address(creatorAddress, salt, byteCode)`

Returns the `Unitroller` contract (the proxy for the `Comptroller` implementation contract) address from the `creatorAddress` (the `FaucetPoolDirectory` contract address that deployed the pool), the `salt` (the pool name), and the `Unitroller` proxy contract bytecode.

### SDK web3.js Instance: `Faucet.web3`

Access the underlying web3.js instance used by the SDK.

## Examples

### Deploy New Faucet Pool

```
// Set parameters
var poolName = "Compound Finance";
var isPrivate = false;
var closeFactor = Web3.utils.toBN(0.051e18);
var maxAssets = Web3.utils.toBN(10);
var liquidationIncentive = Web3.utils.toBN(1e18);
var priceOracle = "ChainlinkPriceOracle"; // Or set to an address to use an existing price oracle

// Deploy new Faucet pool
try {
    var [poolAddress, receipt] = await faucet.deployPool(poolName, isPrivate, closeFactor, maxAssets, liquidationIncentive, priceOracle, { from: "0x0000000000000000000000000000000000000000" });
} catch (error) {
    return console.error(error);
}

// Log deployed pool contract address and transaction receipt
console.log("Deployed Faucet pool contract address:", poolAddress);
console.log("Deployment transaction receipt:", receipt);
```

### Deploy Asset to Faucet Pool

```
// Set parameters
var conf = {
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f", // Leave blank for ETH
    comptroller: "0x0000000000000000000000000000000000000000", // Faucet pool contract address
    interestRateModel: "WhitePaperInterestRateModel", // Or set to an address to use an existing interest rate model
    initialExchangeRateMantissa: Web3.utils.toBN(2e18),
    name: "Compound DAI",
    symbol: "cDAI",
    decimals: 8,
    admin: "0x0000000000000000000000000000000000000000"
};

var collateralFactor = Web3.utils.toBN(0.5e18);

// Deploy new Faucet pool
try {
    var [poolAddress, receipt] = await App.faucet.deployAsset(conf, collateralFactor, { from: "0x0000000000000000000000000000000000000000" });
} catch (error) {
    return console.error(error);
}

// Log deployed pool asset contract address and transaction receipt
console.log("Deployed Faucet pool asset contract address:", poolAddress);
console.log("Deployment transaction receipt:", receipt);
```

## Development

To build the production browser distribution bundle, run `npm run build`. To build the development browser distribution bundle, run `npm run dev`.

## License

See `LICENSE`.

## Credits

Faucet's SDK is developed by [Andreas Bigger](https://github.com/abigger87). Find out more about Rari Capital at [rari.capital](https://rari.capital).

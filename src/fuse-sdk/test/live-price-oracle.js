var axios = require('axios');

const Fuse = require("../dist/fuse.node.commonjs2.js");

var fuse = new Fuse(process.env.LIVE_RPC_URL);
const erc20Abi = JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi);

// Get token/ETH price via CoinGecko
async function getTokenPrice(tokenAddress) {
  tokenAddress = tokenAddress.toLowerCase();
  if (tokenAddress === "0xcee60cfa923170e4f8204ae08b4fa6a3f5656f3a") tokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca"; // linkCRV
  if (tokenAddress === "0xfd4d8a17df4c27c1dd245d153ccf4499e806c87d") tokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca"; // linkCRV-gauge
  if (tokenAddress === "0xb8c77482e45f1f44de1745f52c74426c631bdd52") return 0.147702407; // BNB
  var decoded = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/ethereum', {
    params: {
      vs_currencies: "eth",
      contract_addresses: tokenAddress
    }
  })).data;
  if (!decoded || !decoded[tokenAddress]) throw "Failed to decode price of " + tokenAddress + " from CoinGecko";
  return decoded[tokenAddress].eth;
}

(async function() {
  const tokensChecked = [];

  for (const [, , comptrollerAddress] of (await fuse.contracts.FusePoolDirectory.methods.getPublicPools().call())["1"]) {
    // Deploy all assets to pool
    var comptroller = new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi), comptrollerAddress);
    var assetAddresses = await comptroller.methods.getAllMarkets().call();
    
    // Check asset prices
    var masterPriceOracleContract = new fuse.web3.eth.Contract(fuse.oracleContracts["MasterPriceOracle"].abi, await comptroller.methods.oracle().call());

    for (var cToken of assetAddresses) {
      var underlying = await (new fuse.web3.eth.Contract(JSON.parse(fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi), cToken)).methods.underlying().call();
      if (tokensChecked.indexOf(underlying) >= 0) continue; else tokensChecked.push(underlying);
      var underlyingDecimals = underlying === "0x0000000000000000000000000000000000000000" ? 18 : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.decimals().call());
      var oraclePrice = (await masterPriceOracleContract.methods.getUnderlyingPrice(cToken).call()) / (10 ** (36 - underlyingDecimals));
      var expectedPrice = underlying === "0x0000000000000000000000000000000000000000" ? 1 : (await getTokenPrice(underlying));
      var underlyingSymbol = underlying === "0x0000000000000000000000000000000000000000" ? "ETH" : (underlying.toLowerCase() === "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2".toLowerCase() ? "MKR" : (await (new fuse.web3.eth.Contract(erc20Abi, underlying)).methods.symbol().call()));
      console.log(underlyingSymbol + ": " + oraclePrice + " ETH (expected " + expectedPrice + " ETH)");
      if (!(oraclePrice >= expectedPrice * 0.95 && oraclePrice <= expectedPrice * 1.05)) console.warn("PRICE MISMATCH FOR", underlyingSymbol);
    }
  }
})();

const Fuse = require("../dist/fuse.node.commonjs2.js");

var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

// Launch pools
var pools = {
  R1: {
    comptroller: "0x4dD657E0AC3d6Eac84B1b3Be6dA0018d2AA1dbC8",
    shortName: "Fuse R1",
    longName: "Rari DAO Fuse Pool R1 (Base)",
    assetSymbolPrefix: "fr1",
    assets: [
      [
        "0x0000000000000000000000000000000000000000",
        0.75,
        0.2,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
          .JumpRateModel_StablesMajors,
      ], // ETH
      [
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        0.75,
        0.15,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
          .JumpRateModel_StablesMajors,
      ], // DAI
      [
        "0xD291E7a03283640FDc51b121aC401383A46cC623",
        0.45,
        0.3,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
          .JumpRateModel_GovSeeds,
      ], // RGT
    ],
  },
};

pools["R2"] = {
  comptroller: "0x8560b9839e10766ebFdBC901605b5cc72ce4Afd8",
  shortName: "Fuse R2",
  longName: "Rari DAO Fuse Pool R2 (Core)",
  assetSymbolPrefix: "fr2",
  assets: pools["R1"].assets.concat([
    [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      0.75,
      0.15,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // USDC
    [
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // WBTC
    [
      "0x514910771af9ca656af840dff83e8264ecf986ca",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // LINK
  ]),
};

pools["R3"] = {
  comptroller: "0xc18057F85f752f1CE181aeAD1f081d116333D02C",
  shortName: "Fuse R3",
  longName: "Rari DAO Fuse Pool R3 (VC)",
  assetSymbolPrefix: "fr3",
  assets: pools["R2"].assets.concat([
    [
      "0x111111111117dc0aa78b770fa6a738034120c302",
      0.45,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // 1INCH
    [
      "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
      0.4,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // LRC
    [
      "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      0.4,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // GRT
    [
      "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // MTA
    [
      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // mUSD
    [
      "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // UMA
    [
      "0x0d438f3b5175bebc262bf23753c1e53d03432bde",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // wNXM
    [
      "0xD533a949740bb3306d119CC777fa900bA034cd52",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // CRV
    [
      "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // SNX
    [
      "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // MKR
    [
      "0xc00e94cb662c3520282e6f5717214004a7f26888",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // COMP
    [
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // UNI
    [
      "0xe41d2489571d322189246dafa5ebde1f4699f498",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // ZRX
    [
      "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // AAVE
    [
      "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // YFI
  ]),
};

pools["R4"] = {
  comptroller: "0x6E7fb6c5865e8533D5ED31b6d43fD95f4C411834",
  shortName: "Fuse R4",
  longName: "Rari DAO Fuse Pool R4 (Community)",
  assetSymbolPrefix: "fr4",
  assets: pools["R2"].assets.concat([
    // ["0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a", 0.30, 0.30, Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_StablesMajors], // bDIGG
    [
      "0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713",
      0.4,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // COVER
    [
      "0x0AaCfbeC6a24756c20D41914F2caba817C0d8521",
      0.45,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // YAM
    [
      "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // BADGER
    [
      "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // KP3R
    [
      "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
      0.3,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // FTM
    [
      "0x584bC13c7D411c00c01A62e8019472dE68768430",
      0.25,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // HEGIC
    [
      "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // SUSHI
    [
      "0xb753428af26e81097e7fd17f40c88aaa3e04902c",
      0.4,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // SFI
    [
      "0x8888801af4d980682e47f1a9036e589479e835c5",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // MPH
    [
      "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // ALCX
  ]),
};

pools["R5"] = {
  comptroller: "0x64fCabe3DBb99D8427194a83F0f4af20eE7D739E",
  shortName: "Fuse R5",
  longName: "Rari DAO Fuse Pool R5 (CEX)",
  assetSymbolPrefix: "fr5",
  assets: pools["R2"].assets.concat([
    [
      "0x476c5E26a75bd202a9683ffD34359C0CC15be0fF",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // SRM
    [
      "0x408e41876cccdc0f92210600ef50372656052a38",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // REN
    [
      "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // FTT
    // ["0xB8c77482e45F1F44dE1745F52C74426C631bDD52", 0.35, 0.30, Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds], // BNB
    [
      "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // CEL
    [
      "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // BUSD
  ]),
};

pools["R7"] = {
  comptroller: "0x2A1bF27578C14e868E42A49f0D87dE45d29f7efa",
  shortName: "Fuse R7",
  longName: "Rari DAO Fuse Pool R7 (SOCKS)",
  assetSymbolPrefix: "fr7",
  assets: [
    [
      "0x0000000000000000000000000000000000000000",
      0.65,
      0.2,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // ETH
    [
      "0x23b608675a2b2fb1890d3abbd85c5775c51691d5",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_GovSeeds,
    ], // SOCKS
    [
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      0.65,
      0.15,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .JumpRateModel_StablesMajors,
    ], // DAI
  ],
};

(async function () {
  var accounts = await fuse.web3.eth.getAccounts();

  // For each pool:
  for (const poolId of Object.keys(pools)) {
    var pool = pools[poolId];
    console.log("Updating", pool.longName);
    var comptroller = new fuse.web3.eth.Contract(
      JSON.parse(
        fuse.compoundContracts["contracts/Comptroller.sol:Comptroller"].abi
      ),
      pool.comptroller
    );
    var cTokens = await comptroller.methods.getAllMarkets().call();

    for (const cTokenAddress of cTokens) {
      // Update asset interest rate model
      console.log("Updating", cTokenAddress, "of", pool.shortName);

      var cToken = new fuse.web3.eth.Contract(
        JSON.parse(
          fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"]
            .abi
        ),
        cTokenAddress
      );
      var underlying = await cToken.methods.underlying().call();
      var interestRateModel = pool.assets.find(
        (item) => underlying.toLowerCase() === item[0].toLowerCase()
      )[3];

      try {
        await cToken.methods
          ._setInterestRateModel(interestRateModel)
          .send({ from: accounts[0], gasPrice: "0" });
      } catch (error) {
        console.error(
          "Failed to update",
          cTokenAddress,
          "of",
          pool.shortName,
          error
        );
      }

      console.log("Successfully updated", cTokenAddress, "of", pool.shortName);
    }

    console.log("Successfully updated all assets for:", pool.longName);
  }
})();

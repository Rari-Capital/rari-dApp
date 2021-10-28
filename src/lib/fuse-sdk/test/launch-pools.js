var axios = require("axios");
var Big = require("big.js");

const Fuse = require("../dist/fuse.node.commonjs2.js");

var fuse = new Fuse(process.env.TESTING_WEB3_PROVIDER_URL);

const erc20Abi = JSON.parse(
  fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi
);

// Launch pools
var pools = {
  R1: {
    shortName: "Fuse R1",
    longName: "Rari DAO Fuse Pool R1 (Base)",
    assetSymbolPrefix: "fr1",
    assets: [
      [
        "0x0000000000000000000000000000000000000000",
        0.75,
        0.2,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
          .WhitePaperInterestRateModel_ETH,
      ], // ETH
      [
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        0.75,
        0.15,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_DAI,
      ], // DAI
      [
        "0xD291E7a03283640FDc51b121aC401383A46cC623",
        0.45,
        0.3,
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
      ], // RGT
    ],
  },
};

pools["R2"] = {
  shortName: "Fuse R2",
  longName: "Rari DAO Fuse Pool R2 (Core)",
  assetSymbolPrefix: "fr2",
  assets: pools["R1"].assets.concat([
    [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      0.75,
      0.15,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_DAI,
    ], // USDC
    [
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .WhitePaperInterestRateModel_WBTC,
    ], // WBTC
    [
      "0x514910771af9ca656af840dff83e8264ecf986ca",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // LINK
  ]),
};

pools["R3"] = {
  shortName: "Fuse R3",
  longName: "Rari DAO Fuse Pool R3 (VC)",
  assetSymbolPrefix: "fr3",
  assets: pools["R2"].assets.concat([
    [
      "0x111111111117dc0aa78b770fa6a738034120c302",
      0.45,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // 1INCH
    [
      "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
      0.4,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // LRC
    [
      "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      0.4,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // GRT
    [
      "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // MTA
    [
      "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_DAI,
    ], // mUSD
    [
      "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
      0.45,
      0.35,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // UMA
    [
      "0x0d438f3b5175bebc262bf23753c1e53d03432bde",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // wNXM
    [
      "0xD533a949740bb3306d119CC777fa900bA034cd52",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // CRV
    [
      "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .WhitePaperInterestRateModel_WBTC,
    ], // SNX
    [
      "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .WhitePaperInterestRateModel_WBTC,
    ], // MKR
    [
      "0xc00e94cb662c3520282e6f5717214004a7f26888",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // COMP
    [
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // UNI
    [
      "0xe41d2489571d322189246dafa5ebde1f4699f498",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .WhitePaperInterestRateModel_WBTC,
    ], // ZRX
    [
      "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // AAVE
    [
      "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
      0.6,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // YFI
  ]),
};

pools["R4"] = {
  shortName: "Fuse R4",
  longName: "Rari DAO Fuse Pool R4 (Community)",
  assetSymbolPrefix: "fr4",
  assets: pools["R2"].assets.concat([
    // ["0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a", 0.30, 0.30, Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.WhitePaperInterestRateModel_WBTC], // bDIGG
    [
      "0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713",
      0.4,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // COVER
    [
      "0x0AaCfbeC6a24756c20D41914F2caba817C0d8521",
      0.45,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // YAM
    [
      "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // BADGER
    [
      "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // KP3R
    [
      "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
      0.3,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // FTM
    [
      "0x584bC13c7D411c00c01A62e8019472dE68768430",
      0.25,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // HEGIC
    [
      "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // SUSHI
    [
      "0xb753428af26e81097e7fd17f40c88aaa3e04902c",
      0.4,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // SFI
    [
      "0x8888801af4d980682e47f1a9036e589479e835c5",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // MPH
    [
      "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
      0.5,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // ALCX
  ]),
};

pools["R5"] = {
  shortName: "Fuse R5",
  longName: "Rari DAO Fuse Pool R5 (CEX)",
  assetSymbolPrefix: "fr5",
  assets: pools["R2"].assets.concat([
    [
      "0x476c5E26a75bd202a9683ffD34359C0CC15be0fF",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // SRM
    [
      "0x408e41876cccdc0f92210600ef50372656052a38",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // REN
    [
      "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // FTT
    // ["0xB8c77482e45F1F44dE1745F52C74426C631bDD52", 0.35, 0.30, Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.WhitePaperInterestRateModel_WBTC], // BNB
    [
      "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // CEL
    [
      "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      0.35,
      0.3,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_DAI,
    ], // BUSD
  ]),
};

pools["R7"] = {
  shortName: "Fuse R7",
  longName: "Rari DAO Fuse Pool R7 (SOCKS)",
  assetSymbolPrefix: "fr7",
  assets: [
    [
      "0x0000000000000000000000000000000000000000",
      0.65,
      0.2,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
        .WhitePaperInterestRateModel_ETH,
    ], // ETH
    [
      "0x23b608675a2b2fb1890d3abbd85c5775c51691d5",
      0.5,
      0.25,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_UNI,
    ], // SOCKS
    [
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      0.65,
      0.15,
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES.JumpRateModel_DAI,
    ], // DAI
  ],
};

// Deploy pool + assets
async function deployPool(conf, options) {
  if (conf.poolName === undefined)
    throw "No pool name specified for deployment.";
  if (conf.closeFactor === undefined)
    conf.closeFactor = Fuse.Web3.utils.toBN(0.5e18);
  else
    conf.closeFactor = Fuse.Web3.utils.toBN(
      new Big(conf.closeFactor).mul(new Big(10).pow(18)).toFixed(0)
    );
  if (conf.maxAssets === undefined) conf.maxAssets = 20;
  if (conf.liquidationIncentive === undefined)
    conf.liquidationIncentive = Fuse.Web3.utils.toBN(1.08e18);
  else
    conf.liquidationIncentive = Fuse.Web3.utils.toBN(
      new Big(conf.liquidationIncentive).mul(new Big(10).pow(18)).toFixed(0)
    );

  var [
    poolAddress,
    implementationAddress,
    priceOracleAddress,
  ] = await fuse.deployPool(
    conf.poolName,
    conf.isPrivate,
    conf.closeFactor,
    conf.maxAssets,
    conf.liquidationIncentive,
    conf.priceOracle,
    conf.priceOracleConf,
    options
  );
  return [poolAddress, priceOracleAddress];
}

async function deployAsset(conf, options, bypassPriceFeedCheck) {
  if (conf.interestRateModel === undefined)
    conf.interestRateModel =
      Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES["JumpRateModel"];
  if (conf.decimals === undefined) conf.decimals = 8;
  if (conf.admin === undefined) conf.admin = options.from;
  if (conf.collateralFactor === undefined)
    conf.collateralFactor = Fuse.Web3.utils.toBN(0.75e18);
  else
    conf.collateralFactor = Fuse.Web3.utils.toBN(
      new Big(conf.collateralFactor).mul(new Big(10).pow(18)).toFixed(0)
    );
  if (conf.reserveFactor === undefined)
    conf.reserveFactor = Fuse.Web3.utils.toBN(0.2e18);
  else
    conf.reserveFactor = Fuse.Web3.utils.toBN(
      new Big(conf.reserveFactor).mul(new Big(10).pow(18)).toFixed(0)
    );
  if (conf.adminFee === undefined) conf.adminFee = Fuse.Web3.utils.toBN(0);
  else
    conf.adminFee = Fuse.Web3.utils.toBN(
      new Big(conf.adminFee).mul(new Big(10).pow(18)).toFixed(0)
    );

  var [
    assetAddress,
    implementationAddress,
    interestRateModel,
  ] = await fuse.deployAsset(
    conf,
    conf.collateralFactor,
    conf.reserveFactor,
    conf.adminFee,
    options,
    bypassPriceFeedCheck
  );
  return assetAddress;
}

// Get token/ETH price via CoinGecko
async function getTokenPrice(tokenAddress) {
  tokenAddress = tokenAddress.toLowerCase();
  if (tokenAddress === "0xb8c77482e45f1f44de1745f52c74426c631bdd52")
    return 0.147702407;
  var decoded = (
    await axios.get(
      "https://api.coingecko.com/api/v3/simple/token_price/ethereum",
      {
        params: {
          vs_currencies: "eth",
          contract_addresses: tokenAddress,
        },
      }
    )
  ).data;
  if (!decoded || !decoded[tokenAddress])
    throw "Failed to decode price of " + tokenAddress + " from CoinGecko";
  return decoded[tokenAddress].eth;
}

// ChainlinkPriceOracle supported ERC20 token contract addresses
const CHAINLINK_TOKENS = [
  "0x111111111117dC0aa78b770fA6A738034120C302",
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
  "0xa117000000f279D81A1D3cc75430fAA017FA5A2e",
  "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
  "0xba100000625a3754423978a60c9317c58a424e3D",
  "0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
  "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  "0x617aeCB6137B5108D1E7D4918e3725C8cEbdB848",
  "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
  "0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6",
  "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
  "0x56d811088235F11C8920698a204A5010a788f4b3",
  "0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d",
  "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  "0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713",
  "0x2ba592F78dB6436527729929AAf6c908497cB200",
  "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b",
  "0xD533a949740bb3306d119CC777fa900bA034cd52",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0xEd91879919B71bB6905f23af0A68d231EcF87b14",
  "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
  "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
  "0x4E15361FD6b4BB609Fa63C81A2be19d873717870",
  "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9",
  "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
  "0x584bC13c7D411c00c01A62e8019472dE68768430",
  "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
  "0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44",
  "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD",
  "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  "0xec67005c4E498Ec7f55E092bd1d35cbC47C91892",
  "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",
  "0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671",
  "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
  "0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a",
  "0x8E870D67F660D95d5be530380D0eC0bd388289E1",
  "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
  "0x408e41876cCCDC0F92210600ef50372656052a38",
  "0x221657776846890989a759BA2973e427DfF5C9bB",
  "0x607F4C5BB672230e8672085532f7e901544a7375",
  "0x3155BA85D5F96b2d030a4966AF206230e46849cb",
  "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  "0x476c5E26a75bd202a9683ffD34359C0CC15be0fF",
  "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
  "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
  "0x0000000000085d4780B73119b644AE5ecd22b376",
  "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
  "0x0d438F3b5175Bebc262bF23753C1E53d03432bDE",
  "0xBd356a39BFf2cAda8E9248532DD879147221Cf76",
  "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  "0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83",
  "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
  "0xe36E2D3c7c34281FA3bC737950a68571736880A1",
  "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3",
  "0xF48e200EAF9906362BB1442fca31e0835773b8B4",
  "0x0F83287FF768D1c1e17a42F44d644D7F22e8ee1d",
  "0xfE33ae95A9f0DA8A845aF33516EDc240DCD711d6",
  "0x1715AC0743102BF5Cd58EfBB6Cf2dC2685d967b6",
  "0x88C8Cf3A212c0369698D13FE98Fcb76620389841",
  "0x22602469d704BfFb0936c7A7cfcD18f7aA269375",
  "0xD71eCFF9342A5Ced620049e616c5035F1dB98620",
  "0xeF9Cd7882c067686691B6fF49e650b43AFBBCC6B",
  "0x97fe22E7341a0Cd8Db6F6C021A24Dc8f4DAD855F",
  "0xFA1a856Cfa3409CFa145Fa4e20Eb270dF3EB21ab",
  "0xC14103C2141E842e228FBaC594579e798616ce7A",
  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  "0x4575f41308EC1483f3d399aa9a2826d74Da13Deb",
  "0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9",
  "0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784",
  "0xf2E08356588EC5cd9E437552Da87C0076b4970B0",
  "0x918dA91Ccbc32B7a6A0cc4eCd5987bbab6E31e6D",
  "0x1c48f86ae57291F7686349F12601910BD8D470bb",
  "0x6A22e5e94388464181578Aa7A6B869e00fE27846",
  "0x261EfCdD24CeA98652B9700800a13DfBca4103fF",
  "0x5299d6F7472DCc137D7f3C4BcfBBB514BaBF341A",
  "0xa2B0fDe6D710e201d0d608e924A484d1A5fEd57c",
  "0x2e59005c5c0f0a4D77CcA82653d48b46322EE5Cd",
  "0xeABACD844A196D7Faf3CE596edeBF9900341B420",
  "0xe1aFe1Fd76Fd88f78cBf599ea1846231B8bA3B6B",
  "0x798D1bE841a82a273720CE31c822C61a67a601C3",
  "0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6",
];

(async function () {
  var accounts = await fuse.web3.eth.getAccounts();

  // Keep3r Uniswap + SushiSwap
  var keep3rUniswapTokens = [];
  var keep3rSushiSwapTokens = [];
  var keep3rRootOracleAbi = [
    {
      inputs: [],
      name: "pairs",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  var keep3rUniswapRootOracle = new fuse.web3.eth.Contract(
    keep3rRootOracleAbi,
    "0x73353801921417F465377c8d898c6f4C0270282C"
  );
  var keep3rSushiSwapRootOracle = new fuse.web3.eth.Contract(
    keep3rRootOracleAbi,
    "0xf67Ab1c914deE06Ba0F264031885Ea7B276a7cDa"
  );
  var uniswapV2PairAbi = [
    {
      constant: true,
      inputs: [],
      name: "token0",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "token1",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];
  for (const pair of await keep3rUniswapRootOracle.methods.pairs().call()) {
    var uniswapV2Pair = new fuse.web3.eth.Contract(uniswapV2PairAbi, pair);
    var token0 = await uniswapV2Pair.methods.token0().call();
    var token1 = await uniswapV2Pair.methods.token1().call();
    if (
      token0.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase() &&
      token1.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase()
    )
      continue;
    var nonWethToken =
      token0.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase()
        ? token0
        : token1;
    keep3rUniswapTokens.push(nonWethToken);
  }
  for (const pair of await keep3rSushiSwapRootOracle.methods.pairs().call()) {
    var uniswapV2Pair = new fuse.web3.eth.Contract(uniswapV2PairAbi, pair);
    var token0 = await uniswapV2Pair.methods.token0().call();
    var token1 = await uniswapV2Pair.methods.token1().call();
    if (
      token0.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase() &&
      token1.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase()
    )
      continue;
    var nonWethToken =
      token0.toLowerCase() !== Fuse.WETH_ADDRESS.toLowerCase()
        ? token0
        : token1;
    keep3rSushiSwapTokens.push(nonWethToken);
  }

  // Deploy ChainlinkPriceOracle
  var chainlinkPriceOracle =
    Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES["ChainlinkPriceOracle"];

  // Deploy Keep3rPriceOracle (Uniswap)
  var keep3rPriceOracleUniswap =
    Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES["Keep3rPriceOracle"];

  // Deploy Keep3rPriceOracle (SushiSwap)
  var keep3rPriceOracleSushiSwap =
    Fuse.PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES["Keep3rSushiSwapPriceOracle"];

  // Case insensitive version of Array.indexOf
  var caseInsensitiveIndexOf = (arr, q) =>
    arr.findIndex((item) => q.toLowerCase() === item.toLowerCase());

  // Build underlying and oracle arrays for MasterPriceOracle
  var underlyings = [];
  var oracles = [];

  // For each pool:
  for (const poolId of Object.keys(pools)) {
    // For each asset:
    for (const [asset, cf, rf, irm] of pools[poolId].assets) {
      if (asset === "0x0000000000000000000000000000000000000000") continue;
      if (asset.toLowerCase() === Fuse.WETH_ADDRESS.toLowerCase()) continue;
      if (underlyings.indexOf(asset) >= 0) continue;

      underlyings.push(asset);

      if (caseInsensitiveIndexOf(CHAINLINK_TOKENS, asset) >= 0) {
        oracles.push(chainlinkPriceOracle);
      } else if (caseInsensitiveIndexOf(keep3rUniswapTokens, asset) >= 0) {
        oracles.push(keep3rPriceOracleUniswap);
      } else if (caseInsensitiveIndexOf(keep3rSushiSwapTokens, asset) >= 0) {
        oracles.push(keep3rPriceOracleSushiSwap);
      } else throw "Oracle not found for " + asset;
    }
  }

  // Deploy MasterPriceOracle
  var masterPriceOracle = await fuse.deployPriceOracle(
    "MasterPriceOracle",
    { underlyings, oracles },
    { from: accounts[0], gasPrice: "0" }
  );
  console.log("Successfully deployed MasterPriceOracle at:", masterPriceOracle);

  // For each pool:
  for (const poolId of Object.keys(pools)) {
    var pool = pools[poolId];

    // Deploy pool
    console.log("Deploying", pool.longName);
    var [poolAddress] = await deployPool(
      { poolName: pool.longName, priceOracle: masterPriceOracle },
      { from: accounts[0], gasPrice: "0" }
    );
    console.log("Successfully deployed", pool.longName, "at:", poolAddress);

    // Create asset config array
    var confs = [];

    for (const [
      underlying,
      collateralFactor,
      reserveFactor,
      interestRateModel,
    ] of pools[poolId].assets) {
      if (underlying === "0x0000000000000000000000000000000000000000") {
        var underlyingName = "Ethereum";
        var underlyingSymbol = "ETH";
      } else if (
        underlying.toLowerCase() ===
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2".toLowerCase()
      ) {
        var underlyingName = "Maker";
        var underlyingSymbol = "MKR";
      } else {
        var erc20 = new fuse.web3.eth.Contract(erc20Abi, underlying);
        var underlyingName = await erc20.methods.name().call();
        var underlyingSymbol = await erc20.methods.symbol().call();
      }

      confs.push({
        name: pool.shortName + ": " + underlyingName,
        symbol: pool.assetSymbolPrefix + underlyingSymbol,
        underlying,
        collateralFactor,
        reserveFactor,
        interestRateModel,
      });
    }

    // Deploy all assets to pool
    var assetAddresses = {};

    for (const conf of confs) {
      // Deploy asset
      console.log("Deploying", conf.underlying, "to", pool.shortName);

      try {
        assetAddresses[conf.underlying] = await deployAsset(
          { comptroller: poolAddress, ...conf },
          { from: accounts[0], gasPrice: "0" },
          true
        );
      } catch (error) {
        console.error("Failed to deploy", conf.underlying, error);
      }

      console.log(
        "Successfully deployed",
        conf.underlying,
        "to",
        pool.shortName
      );

      // Try getPoolAssetsWithData
      try {
        await fuse.contracts.FusePoolLens.methods
          .getPoolAssetsWithData(poolAddress)
          .call({ gas: 1e18 });
      } catch (error) {
        console.error(
          "getPoolAssetsWithData failed on",
          conf.underlying,
          error
        );
      }
    }

    console.log("Successfully deployed all assets for:", pool.longName);

    // Check asset prices
    var masterPriceOracleContract = new fuse.web3.eth.Contract(
      fuse.oracleContracts["MasterPriceOracle"].abi,
      masterPriceOracle
    );

    for (var underlying of Object.keys(assetAddresses)) {
      var underlyingDecimals =
        underlying === "0x0000000000000000000000000000000000000000"
          ? 18
          : await new fuse.web3.eth.Contract(erc20Abi, underlying).methods
              .decimals()
              .call();
      var oraclePrice =
        (await masterPriceOracleContract.methods
          .getUnderlyingPrice(assetAddresses[underlying])
          .call()) /
        10 ** (36 - underlyingDecimals);
      var expectedPrice =
        underlying === "0x0000000000000000000000000000000000000000"
          ? 1
          : await getTokenPrice(underlying);
      var underlyingSymbol =
        underlying === "0x0000000000000000000000000000000000000000"
          ? "ETH"
          : underlying.toLowerCase() ===
            "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2".toLowerCase()
          ? "MKR"
          : await new fuse.web3.eth.Contract(erc20Abi, underlying).methods
              .symbol()
              .call();
      console.log(
        underlyingSymbol +
          ": " +
          oraclePrice +
          " ETH (expected " +
          expectedPrice +
          " ETH)"
      );
      if (
        !(
          oraclePrice >= expectedPrice * 0.95 &&
          oraclePrice <= expectedPrice * 1.05
        )
      )
        console.log("PRICE MISMATCH FOR", underlyingSymbol);
    }
  }
})();

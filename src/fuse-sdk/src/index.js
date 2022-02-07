/* eslint-disable */
import Web3 from "web3";

import JumpRateModel from "./irm/JumpRateModel.js";
import JumpRateModelV2 from "./irm/JumpRateModelV2.js";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2.js";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel.js";

import BigNumber from "bignumber.js";

var fusePoolDirectoryAbi = require(__dirname + "/abi/FusePoolDirectory.json");
var fusePoolLensAbi = require(__dirname + "/abi/FusePoolLens.json");
var fusePoolLensSecondaryAbi = require(__dirname +
  "/abi/FusePoolLensSecondary.json");
var fuseSafeLiquidatorAbi = require(__dirname + "/abi/FuseSafeLiquidator.json");
var fuseFeeDistributorAbi = require(__dirname + "/abi/FuseFeeDistributor.json");
var initializableClonesAbi = require(__dirname + "/abi/InitializableClones.json");
var uniswapV3PoolAbiSlim = require(__dirname + "/abi/UniswapV3Pool.slim.json");
var contracts = require(__dirname +
  "/contracts/compound-protocol.min.json").contracts;
/* var openOracleContracts = require(__dirname + "/contracts/open-oracle.min.json")
  .contracts; */
var oracleContracts = require(__dirname +
  "/contracts/oracles.min.json").contracts;

const axios = require("axios");

export default class Fuse {
  static FUSE_POOL_DIRECTORY_CONTRACT_ADDRESS =
    "0x835482FE0532f169024d5E9410199369aAD5C77E";
  static FUSE_SAFE_LIQUIDATOR_CONTRACT_ADDRESS =
    "0xf0f3a1494ae00b5350535b7777abb2f499fc13d4";
  static FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS =
    "0xa731585ab05fC9f83555cf9Bff8F58ee94e18F85";
  static FUSE_POOL_LENS_CONTRACT_ADDRESS =
    "0x6Dc585Ad66A10214Ef0502492B0CC02F0e836eec";
  static FUSE_POOL_LENS_SECONDARY_CONTRACT_ADDRESS =
    "0xc76190E04012f26A364228Cfc41690429C44165d";

  static COMPTROLLER_IMPLEMENTATION_CONTRACT_ADDRESS =
    "0xe16db319d9da7ce40b666dd2e365a4b8b3c18217"; // v1.0.0: 0x94b2200d28932679def4a7d08596a229553a994e; v1.0.1 (with _unsupportMarket): 0x8A78A9D35c9C61F9E0Ff526C5d88eC28354543fE
  static CERC20_DELEGATE_CONTRACT_ADDRESS =
    "0x67db14e73c2dce786b5bbbfa4d010deab4bbfcf9"; // v1.0.0: 0x67e70eeb9dd170f7b4a9ef620720c9069d5e706c; v1.0.2 (for V2 yVaults): 0x2b3dd0ae288c13a730f6c422e2262a9d3da79ed1
  static CETHER_DELEGATE_CONTRACT_ADDRESS =
    "0xd77e28a1b9a9cfe1fc2eee70e391c05d25853cbf"; // v1.0.0: 0x60884c8faad1b30b1c76100da92b76ed3af849ba
  static REWARDS_DISTRIBUTOR_DELEGATE_CONTRACT_ADDRESS =
    "0x220f93183a69d1598e8405310cb361cff504146f";
  
  static MASTER_PRICE_ORACLE_IMPLEMENTATION_CONTRACT_ADDRESS =
    "0xb3c8ee7309be658c186f986388c2377da436d8fb";
  static INITIALIZABLE_CLONES_CONTRACT_ADDRESS =
    "0x91ce5566dc3170898c5aee4ae4dd314654b47415";

  static OPEN_ORACLE_PRICE_DATA_CONTRACT_ADDRESS =
    "0xc629c26dced4277419cde234012f8160a0278a79"; // UniswapAnchoredView NOT IN USE
  static COINBASE_PRO_REPORTER_ADDRESS =
    "0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC"; // UniswapAnchoredView NOT IN USE
    
  static COMPTROLLER_IMPLEMENTATION_TEMP_TOKEN_MIGRATION = "0x1a1e7b69348b22b304428a07a7ffa1c6347f8ef6";
  static CERC20_DELEGATE_TEMP_TOKEN_MIGRATION = "0x49a4af90cfc103a71e893a0302dd25940a8baf18";

  static PUBLIC_PRICE_ORACLE_CONTRACT_ADDRESSES = {
    ChainlinkPriceOracle: "0xe102421A85D9C0e71C0Ef1870DaC658EB43E1493",
    ChainlinkPriceOracleV2: "0xb0602af43Ca042550ca9DA3c33bA3aC375d20Df4",
    ChainlinkPriceOracleV3: "0x058c345D3240001088b6280e008F9e78b3B2112d",
    // PreferredPriceOracle: "", // TODO: Set correct mainnet address after deployment
    // UniswapAnchoredView: "", // NOT IN USE
    // UniswapView: "", // NOT IN USE
    // Keep3rPriceOracle_Uniswap: "0xb90de476d438b37a4a143bf729a9b2237e544af6", // NO LONGER IN USE
    // Keep3rPriceOracle_SushiSwap: "0x08d415f90ccfb971dfbfdd6266f9a7cb1c166fc0", // NO LONGER IN USE
    // Keep3rV2PriceOracle_Uniswap: "0xd6a8cac634e59c00a3d4163f839d068458e39869", // NO LONGER IN USE
    UniswapTwapPriceOracle_Uniswap:
      "0xCd8f1c72Ff98bFE3B307869dDf66f5124D57D3a9",
    UniswapTwapPriceOracle_SushiSwap:
      "0xfD4B4552c26CeBC54cD80B1BDABEE2AC3E7eB324",
    UniswapLpTokenPriceOracle: "0x50f42c004bd9b0e5acc65c33da133fbfbe86c7c0",
    UniswapV3TwapPriceOracle_Uniswap_3000:
      "0x80829b8A344741E28ae70374Be02Ec9d4b51CD89",
    UniswapV3TwapPriceOracle_Uniswap_10000:
      "0xF8731EB567c4C7693cF497849247668c91C9Ed36",
    UniswapV3TwapPriceOracleV2_Uniswap_500_USDC:
      "0x29490a6F5B4A999601378547Fe681d04d877D29b",
    UniswapV3TwapPriceOracleV2_Uniswap_3000_USDC:
      "0xf3a36BB3B627A5C8c36BA0714Fe035A401E86B78",
    UniswapV3TwapPriceOracleV2_Uniswap_10000_USDC:
      "0x3288a2d5f11FcBefbf77754e073cAD2C10325dE2",
    // RecursivePriceOracle: "", // TODO: Set correct mainnet address after deployment
    YVaultV1PriceOracle: "0xb5e8e42639e20285c9e58a317c28d9a4d7cb7000", // v1.2.1; v1.0.0 = 0xb04be6165cf1879310e48f8900ad8c647b9b5c5d
    YVaultV2PriceOracle: "0xb669d0319fb9de553e5c206e6fbebd58512b668b",
    // AlphaHomoraV1PriceOracle: "", // TODO: Set correct mainnet address after deployment
    // AlphaHomoraV2PriceOracle: "", // TODO: Set correct mainnet address after deployment
    // SynthetixPriceOracle: "", // TODO: Set correct mainnet address after deployment
    // BalancerLpTokenPriceOracle: "", // TODO: Set correct mainnet address after deployment
    MasterPriceOracle: "0x1887118E49e0F4A78Bd71B792a49dE03504A764D",
    CurveLpTokenPriceOracle: "0x43c534203339bbf15f62b8dde91e7d14195e7a60",
    CurveLiquidityGaugeV2PriceOracle:
      "0xd9eefdb09d75ca848433079ea72ef609a1c1ea21",
    FixedEthPriceOracle: "0xffc9ec4adbf75a537e4d233720f06f0df01fb7f5",
    FixedEurPriceOracle: "0x817158553F4391B0d53d242fC332f2eF82463e2a", // v1.1.0
    WSTEthPriceOracle: "0xb11de4c003c80dc36a810254b433d727ac71c517",
    FixedTokenPriceOracle_OHM: "0x71FE48562B816D03Ce9e2bbD5aB28674A8807CC5",
    UniswapTwapPriceOracleV2_SushiSwap_DAI:
      "0x72fd4c801f5845ab672a12bce1b05bdba1fd851a", // v1.1.2
    UniswapTwapPriceOracleV2_SushiSwap_CRV:
      "0x552163f2a63f82bb47b686ffc665ddb3ceaca0ea", // v1.1.3
    UniswapTwapPriceOracleV2_SushiSwap_USDC:
      "0x9ee412a83a52f033d23a0b7e2e030382b3e53208", // v1.1.3
    UniswapTwapPriceOracleV2_Uniswap_FRAX:
      "0x6127e381756796fb978bc872556bf790f14cde98", // v1.1.3
    UniswapTwapPriceOracleV2_SushiSwap_ETH:
      "0xf411CD7c9bC70D37f194828ce71be00d9aEC9edF", // v1.1.3
    UniswapTwapPriceOracleV2_SushiSwap_WBTC:
      "0xC9Ad18928B1D9F61105d43Ecc33c670838D1C853", // v1.1.3
    UniswapTwapPriceOracleV2_Uniswap_ETH:
      "0xd4219c15b9cfc40090181ab934a08bed14017372", // v1.1.3
    SushiBarPriceOracle: "0x290E0f31e96e13f9c0DB14fD328a3C2A94557245",
    BadgerPriceOracle: "0xd0C86943e594640c4598086a2359A0e70b80eF8D",
    HarvestPriceOracle: "0x6141d9353bb1fb8131d07d358c112b372aa92514", // v1.2.1; v1.1.4 = 0x8D364609cd2716172016838fF9FBC7fBcAC91792
    StakedSdtPriceOracle: "0x5447c825ee330015418c1a0d840c4a1b5a7176cc",
    TokemakPoolTAssetPriceOracle: "0xd806782b31EC52FcB7f2a009d7D045bB732431Fb",
    MStablePriceOracle: "0xeb988f5492C86584f8D8f1B8662188D5A9BfE357",
    GelatoGUniPriceOracle: "0xea3633b38c747cea231adb74b511dc2ed3992b43",
    StakedSpellPriceOracle: "0xb544f62045b96a60b398abb5a5c23bf04cb4ed9c",
    CurveTriCryptoLpTokenPriceOracle: "0xb2d16916d520d585ee49f08db1436b961b48fe60",
    GOhmPriceOracle: "0x057eCDA7f61C73c3Adcc36899d2626C7b79C3249",
    WSSquidPriceOracle: "0xAE7C2169f3B5179bA56E471623BC47bEE06E4aA7",
    WXBtrflyPriceOracle: "0x66159b1250f7ec2e335176643c25a0a3deae7b1f",
    StakedFodlPriceOracle: "0x92cf2299680c063ccaf18f62a60c500a625e08e2",
    RgtTempPriceOracle: "0x0b43d7372e49ad2b04c7ab04bddd7f724480aaed",
  };

  static UNISWAP_TWAP_PRICE_ORACLE_ROOT_CONTRACT_ADDRESS =
    "0xa170dba2cd1f68cdd7567cf70184d5492d2e8138";
  static UNISWAP_TWAP_PRICE_ORACLE_V2_ROOT_CONTRACT_ADDRESS =
    "0xf1860b3714f0163838cf9ee3adc287507824ebdb";
  static UNISWAP_TWAP_PRICE_ORACLE_V2_FACTORY_CONTRACT_ADDRESS =
    "0x3472f7e0179Fe15cd7450C9c5269C876fAc64B73";
  static UNISWAP_V3_TWAP_PRICE_ORACLE_V2_FACTORY_CONTRACT_ADDRESS =
    "0x8Eed20f31E7d434648fF51114446b3CfFD1FF9F1";

  static DAI_POT = "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7"; // DAIInterestRateModelV2 NOT IN USE
  static DAI_JUG = "0x19c0976f590d67707e62397c87829d896dc0f1f1"; // DAIInterestRateModelV2 NOT IN USE

  static UNISWAP_V2_FACTORY_ADDRESS =
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  static UNISWAP_V2_PAIR_INIT_CODE_HASH =
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
  static SUSHISWAP_FACTORY_ADDRESS =
    "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac";
  static UNISWAP_V3_FACTORY_ADDRESS =
    "0x1f98431c8ad98523631ae4a59f267346ea31f984";
  static WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  static PRICE_ORACLE_RUNTIME_BYTECODE_HASHES = {
    ChainlinkPriceOracle:
      "0x7a2a5633a99e8abb759f0b52e87875181704b8e29f6567d4a92f12c3f956d313",
    ChainlinkPriceOracleV2:
      "0x8d2bcaa1429031ae2b19a4516e5fdc68fb9346f158efb642fcf9590c09de2175",
    ChainlinkPriceOracleV3:
      "0x4b3bef9f57e381dc6b6e32bff270ce8a72d8aae541cb7c686b09555de3526d39",
    UniswapTwapPriceOracle_Uniswap:
      "0xa2537dcbd2b55b1a690db3b83fa1042f86b21ec3e1557f918bc3930b6bbb9244",
    UniswapTwapPriceOracle_SushiSwap:
      "0x9b11abfe7bfc1dcef0b1bc513959f1172cfe2cb595c5131b9cabc3b6448d89ac",
    UniswapLpTokenPriceOracle:
      "0xbcddb66e4e9c038b4ee1cf4caf1e8c8119225d72a8407fc32caa1988e4a7fe31",
    UniswapV3TwapPriceOracle_Uniswap_3000:
      "0xb300f7f64110b952340e896d33f133482de6715f1b8b7e0acbd2416e0e6593c1",
    UniswapV3TwapPriceOracle_Uniswap_10000:
      "0xef237fadaffff8a1b5daa4d448c7935cf0f71e2ee01a53856bb0d7884b0ad78c",
    UniswapV3TwapPriceOracleV2_Uniswap_500_USDC:
      "0xaaba60b3af593a8ecde61d8516ad0353db8cc2777018e0dde07f654c22a3171d",
    UniswapV3TwapPriceOracleV2_Uniswap_3000_USDC:
      "0x204541bdea985113b68dad86bf67fbbd52829f8984b6f17f6271bcec203161d1",
    UniswapV3TwapPriceOracleV2_Uniswap_10000_USDC:
      "0xc301f891f1f905e68d1c5df5202cf0eec2ee8abcf3a510d5bd00d46f7dea01b4",
    UniswapV3TwapPriceOracleV2:
      "0xc844372c8856a5f9569721d3aca38c7804bae2ae4e296605e683aa8d1601e538", // v1.2.0
    YVaultV1PriceOracleV1: // fuse-contracts@v1.0.0
      "0xd0dda181a4eb699a966b23edb883cff43377297439822b1b0f99b06af2002cc3",
    YVaultV1PriceOracleV2: // fuse-contracts@v1.2.1
      "0x78ac4b231a4ce3ac5259847cd1cb227bf45882d736722290bee6b6c99a722f22",
    YVaultV2PriceOracle:
      "0x177c22cc7d05280cea84a36782303d17246783be7b8c0b6f9731bb9002ffcc68",
    MasterPriceOracleV1: // fuse-contracts@v1.0.0
      "0xfa1349af05af40ffb5e66605a209dbbdc8355ba7dda76b2be10bafdf5ffd1dc6",
    MasterPriceOracleV2: // fuse-contracts@80c79b45bda4151e22358d22cc0bf1489f34900c (before final release of v1.2.0)
      "0xdfa5aa37efea3b16d143a12c4ae7006f3e29768b3e375b59842c7ecd3809f1d1",
    MasterPriceOracleV3: // fuse-contracts@v1.2.0
      "0xe4199a03b164ca492d19d655b85fdf8cc14cf2da6ddedd236712552b7676b03d",
    CurveLpTokenPriceOracle:
      "0x6742ae836b1f7df0cfd9b858c89d89da3ee814c28c5ee9709a371bcf9dfd2145",
    CurveLiquidityGaugeV2PriceOracle:
      "0xfcf0d93de474152898668c4ebd963e0237bfc46c3d5f0ce51b7045b60c831734",
    FixedEthPriceOracle:
      "0xcb669c93632a1c991adced5f4d97202aa219fab3d5d86ebd28f4f62ad7aa6cb3",
    FixedEurPriceOracle:
      "0x678dbe9f2399a44e89edc934dc17f6d4ee7004d9cbcee83c0fa0ef43de924b84",
    WSTEthPriceOracle:
      "0x11daa8dfb8957304aa7d926ce6876c523c7567b4052962e65e7d6a324ddcb4cc",
    FixedTokenPriceOracle_OHM:
      "0x136d369f53594c2f10e3ff3f14eaaf0bada4a63964f3cfeda3923e3531e407dc",
    UniswapTwapPriceOracleV2_SushiSwap_DAI:
      "0xb4d279232ab52a2fcaee6dc47db486a733c24a499ade9d7de1b0d417d4730817",
    UniswapTwapPriceOracleV2_SushiSwap_CRV:
      "0x9df749314d6494a785bb5ff7a5fab25adadb772e10d58b7f692028cc23e2cbb3",
    UniswapTwapPriceOracleV2_SushiSwap_USDC:
      "0x2219b54a3e2c36b8b1eca8d511392eacace73a3e1cb55c97dd495f5e47024ba6",
    UniswapTwapPriceOracleV2_Uniswap_FRAX:
      "0xc884332403a6234bbb5e860fa27bcf69389b7e372b20045af687d23426e654e3",
    UniswapTwapPriceOracleV2_SushiSwap_ETH:
      "0xea501eef0ca55dc6a8360a5a1274895d6dc245dd0ae8cffbff3a14c6624711f0",
    SushiBarPriceOracle:
      "0x3736e8b6c11fcd413c0b60c3291a3a2e2ebe496a2780f3c45790a123f5ee9705",
    BadgerPriceOracle:
      "0x310210400b2d3992dc8fb9ace5001b1b55d3a468fba18ae0bc82a375fd150638",
    HarvestPriceOracleV1: // fuse-contracts@v1.1.4
      "0x6e23380d1d640118cf80cf2bfa9ca7a89068659dfcb50abc0a7f8b9e5f9daab7",
    HarvestPriceOracleV2: // fuse-contracts@v1.2.1
      "0x5eff948725404a38311ebe4b3bafc312f63dd8ae611e3ddcdfebb9cfa231988c",
    StakedSdtPriceOracle:
      "0x1b489bd00e5cbe4998e985f147297c1a39bd9da659e78544c94c1f3415edf7b7",
    TokemakPoolTAssetPriceOracle:
      "0xc820466d7af2319646d25e2203187254a37cb9b9ae6c8a263d40fb5c01a54c51",
    MStablePriceOracle:
      "0x39fc7b2cdac3d401ea91becf897346b2156dbe261162de14082e856103456eb4",
    GelatoGUniPriceOracle:
      "0xbed0eddba7009021dd774a530b53a784fc80217c7bf27c15c9b2487b13fb2863",
    StakedSpellPriceOracle:
      "0x9fcea6d23c7e2e330e35e303a49f39e0c2c783e6b770ccc2de41fbbfbfc539e7",
    CurveTriCryptoLpTokenPriceOracle:
      "0x92014d914370d8c59082044786d9b056ea188a95891778c555209c210850d5ae",
  };

  static ORACLES = [
    "SimplePriceOracle",
    "PreferredPriceOracle",
    "ChainlinkPriceOracle",
    // "Keep3rPriceOracle",
    "MasterPriceOracle",
    // "UniswapAnchoredView",
    // "UniswapView",
    "UniswapLpTokenPriceOracle",
    "RecursivePriceOracle",
    "YVaultV1PriceOracle",
    "YVaultV2PriceOracle",
    "AlphaHomoraV1PriceOracle",
    "SynthetixPriceOracle",
    "ChainlinkPriceOracleV2",
    "CurveLpTokenPriceOracle",
    "CurveLiquidityGaugeV2PriceOracle",
    "FixedEthPriceOracle",
    "FixedEurPriceOracle",
    "FixedTokenPriceOracle",
    "WSTEthPriceOracle",
    "UniswapTwapPriceOracle",
    "UniswapTwapPriceOracleV2",
    "UniswapV3TwapPriceOracle",
    "UniswapV3TwapPriceOracleV2",
    "SushiBarPriceOracle",
  ];

  static PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES = {
    JumpRateModel_Compound_Stables:
      "0x640dce7c7c6349e254b20eccfa2bb902b354c317",
    JumpRateModel_Compound_UNI: "0xc35DB333EF7ce4F246DE9DE11Cc1929d6AA11672",
    JumpRateModel_Cream_Stables_Majors:
      "0xb579d2761470bba14018959d6dffcc681c09c04b",
    JumpRateModel_Cream_Gov_Seeds: "0xcdC0a449E011249482824efFcfA05c883d36CfC7",

    WhitePaperInterestRateModel_Compound_ETH:
      "0x14ee0270C80bEd60bDC117d4F218DeE0A4909F28",
    WhitePaperInterestRateModel_Compound_WBTC:
      "0x7ecAf96C79c2B263AFe4f486eC9a74F8e563E0a6",

    JumpRateModel_Fei_FEI: "0x8f47be5692180079931e2f983db6996647aba0a5",
    JumpRateModel_Fei_TRIBE: "0x075538650a9c69ac8019507a7dd1bd879b12c1d7",
    JumpRateModel_Fei_ETH: "0xbab47e4b692195bf064923178a90ef999a15f819",
    JumpRateModel_Fei_DAI: "0xede47399e2aa8f076d40dc52896331cba8bd40f7",
    JumpRateModel_Olympus_Majors: "0xe1d35fae219e4d74fe11cb4246990784a4fe6680",
    JumpRateModel_Olympus_Majors_New: "0x4EF29407a8dbcA2F37B7107eAb54d6f2a3f2ad60",
    
    JumpRateModel_Flat_3_Percent_Borrow_APY: "0xc8acad405ff67eaee2aca374764883cecbd490ad",

    Custom_JumpRateModel: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    Custom_JumpRateModel: "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
  };

  static COMPTROLLER_ERROR_CODES = [
    "NO_ERROR",
    "UNAUTHORIZED",
    "COMPTROLLER_MISMATCH",
    "INSUFFICIENT_SHORTFALL",
    "INSUFFICIENT_LIQUIDITY",
    "INVALID_CLOSE_FACTOR",
    "INVALID_COLLATERAL_FACTOR",
    "INVALID_LIQUIDATION_INCENTIVE",
    "MARKET_NOT_ENTERED", // no longer possible
    "MARKET_NOT_LISTED",
    "MARKET_ALREADY_LISTED",
    "MATH_ERROR",
    "NONZERO_BORROW_BALANCE",
    "PRICE_ERROR",
    "REJECTION",
    "SNAPSHOT_ERROR",
    "TOO_MANY_ASSETS",
    "TOO_MUCH_REPAY",
    "SUPPLIER_NOT_WHITELISTED",
    "BORROW_BELOW_MIN",
    "SUPPLY_ABOVE_MAX",
    "NONZERO_TOTAL_SUPPLY",
  ];

  static CTOKEN_ERROR_CODES = [
    "NO_ERROR",
    "UNAUTHORIZED",
    "BAD_INPUT",
    "COMPTROLLER_REJECTION",
    "COMPTROLLER_CALCULATION_ERROR",
    "INTEREST_RATE_MODEL_ERROR",
    "INVALID_ACCOUNT_PAIR",
    "INVALID_CLOSE_AMOUNT_REQUESTED",
    "INVALID_COLLATERAL_FACTOR",
    "MATH_ERROR",
    "MARKET_NOT_FRESH",
    "MARKET_NOT_LISTED",
    "TOKEN_INSUFFICIENT_ALLOWANCE",
    "TOKEN_INSUFFICIENT_BALANCE",
    "TOKEN_INSUFFICIENT_CASH",
    "TOKEN_TRANSFER_IN_FAILED",
    "TOKEN_TRANSFER_OUT_FAILED",
    "UTILIZATION_ABOVE_MAX",
  ];
  
  static COLLATERAL_REDEMPTION_STRATEGIES = {
    CurveLpToken: "0xb5eEaeB4E7e0a9feD003ED402016342A09FC2784",
    CurveLiquidityGaugeV2: "0x97e6E953C9a9250c8e889D888158F27752e0aFe0",
    YearnYVaultV2: "0x50293EB96E90616faD66CEF227EDA2b344F592c0",
    PoolTogether: "0xDDB0d86fDBF33210Ba6EFc97757fFcdBF26B5530", 
    UniswapV2: "0x8db1884def49b001c0b9b2fd5ba8e8b71f69b958",
    UniswapV1: "0x9fa9ffa397be8e33930571dcd9f5f92b629b0fad",
    CurveSwap: "0xebea141052d759b75c4c9eeaad28f07f329d0163",
    WSTEth: "0xca844845a3578296b3fcfe50fc3a1064a2922fbc",
    SOhm: "0xeBC0752232697F17EbfAA1f26aB8543EcEC35AE3",
    UniswapV3: "0x5E829D997294F7f1d40a45C0f6431aF13a381E63",
    SushiBar: "0x5F2dF200636e203863819CbEaA02017CFabEc4D6",
    UniswapLpToken: "0x3659a0a9128ee84f143bdc83c4f3932cd8f552e7",
    Harvest: "0xbb77A6a11A5998A6C7B9337f97Fd82f0D90f873b",
    StakedSdt: "0x015e435df0bfb249990be78ce050bf8b3b88f757",
    GOhm: "0x2bA5f816FB2c219Ae1C621c69A263899C1914Da4",
    BadgerSett: "0xc743c9d1801ad9169be176761e8bb95c1298d817",
  };

  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider);

    this.getEthUsdPriceBN = async function () {
      return Web3.utils.toBN(
        new BigNumber(
          (
            await axios.get(
              "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum"
            )
          ).data.ethereum.usd
        )
          .multipliedBy(1e18)
          .toFixed(0)
      );
    };

    this.contracts = {
      FusePoolDirectory: new this.web3.eth.Contract(
        fusePoolDirectoryAbi,
        Fuse.FUSE_POOL_DIRECTORY_CONTRACT_ADDRESS
      ),
      FusePoolLens: new this.web3.eth.Contract(
        fusePoolLensAbi,
        Fuse.FUSE_POOL_LENS_CONTRACT_ADDRESS
      ),
      FusePoolLensSecondary: new this.web3.eth.Contract(
        fusePoolLensSecondaryAbi,
        Fuse.FUSE_POOL_LENS_SECONDARY_CONTRACT_ADDRESS
      ),
      FuseSafeLiquidator: new this.web3.eth.Contract(
        fuseSafeLiquidatorAbi,
        Fuse.FUSE_SAFE_LIQUIDATOR_CONTRACT_ADDRESS
      ),
      FuseFeeDistributor: new this.web3.eth.Contract(
        fuseFeeDistributorAbi,
        Fuse.FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS
      ),
    };

    this.compoundContracts = contracts;
    // this.openOracleContracts = openOracleContracts;
    this.oracleContracts = oracleContracts;

    this.getCreate2Address = function (creatorAddress, salts, byteCodeHash) {
      return `0x${this.web3.utils
        .sha3(
          `0x${[
            "ff",
            creatorAddress,
            this.web3.utils.soliditySha3(...salts),
            byteCodeHash,
          ]
            .map((x) => x.replace(/0x/, ""))
            .join("")}`
        )
        .slice(-40)}`.toLowerCase();
    };

    this.deployPool = async function (
      poolName,
      enforceWhitelist,
      closeFactor,
      liquidationIncentive,
      priceOracle,
      priceOracleConf,
      options,
      whitelist
    ) {
      // Deploy new price oracle via SDK if requested
      if (Fuse.ORACLES.indexOf(priceOracle) >= 0) {
        try {
          priceOracle = await this.deployPriceOracle(
            priceOracle,
            priceOracleConf,
            options
          ); // TODO: anchorMantissa / anchorPeriod
        } catch (error) {
          throw (
            "Deployment of price oracle failed: " +
            (error.message ? error.message : error)
          );
        }
      }

      // Deploy Comptroller implementation if necessary
      var implementationAddress =
        Fuse.COMPTROLLER_IMPLEMENTATION_CONTRACT_ADDRESS;

      if (!implementationAddress) {
        var comptroller = new this.web3.eth.Contract(
          JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi)
        );
        comptroller = await comptroller
          .deploy({
            data: "0x" + contracts["contracts/Comptroller.sol:Comptroller"].bin,
          })
          .send(options);
        implementationAddress = comptroller.options.address;
      }

      // Register new pool with FusePoolDirectory
      try {
        var receipt = await this.contracts.FusePoolDirectory.methods
          .deployPool(
            poolName,
            implementationAddress,
            enforceWhitelist,
            closeFactor,
            liquidationIncentive,
            priceOracle
          )
          .send(options);
      } catch (error) {
        throw (
          "Deployment and registration of new Fuse pool failed: " +
          (error.message ? error.message : error)
        );
      }

      // Compute Unitroller address
      var poolAddress = this.getCreate2Address(
        Fuse.FUSE_POOL_DIRECTORY_CONTRACT_ADDRESS,
        [options.from, poolName, receipt.blockNumber],
        this.web3.utils.sha3(
          "0x" + contracts["contracts/Unitroller.sol:Unitroller"].bin
        )
      );
      var unitroller = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/Unitroller.sol:Unitroller"].abi),
        poolAddress
      );

      // Accept admin status via Unitroller
      try {
        await unitroller.methods._acceptAdmin().send(options);
      } catch (error) {
        throw (
          "Accepting admin status failed: " +
          (error.message ? error.message : error)
        );
      }

      // Whitelist
      if (enforceWhitelist) {
        var comptroller = new this.web3.eth.Contract(
          JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi),
          poolAddress
        );

        // Already enforced so now we just need to add the addresses
        await comptroller.methods
          ._setWhitelistStatuses(whitelist, Array(whitelist.length).fill(true))
          .send(options);
      }

      return [poolAddress, implementationAddress, priceOracle];
    };

    this.deployPriceOracle = async function (model, conf, options) {
      console.log(model, conf, options, "inside DeployPrice");
      if (!model) model = "ChainlinkPriceOracle";
      if (!conf) conf = {};

      switch (model) {
        /* case "PreferredPriceOracle":
          // Deploy ChainlinkPriceOracle
          if (!conf.chainlinkPriceOracle)
            conf.chainlinkPriceOracle = await this.deployPriceOracle(
              "ChainlinkPriceOracle",
              {
                maxSecondsBeforePriceIsStale: conf.maxSecondsBeforePriceIsStale,
              },
              options
            );

          // Deploy Uniswap price oracle
          if (!conf.secondaryPriceOracle)
            conf.secondaryPriceOracle = await this.deployPriceOracle(
              "UniswapView",
              {
                anchorPeriod: conf.anchorPeriod,
                tokenConfigs: conf.tokenConfigs,
                canAdminOverwrite: conf.canAdminOverwrite,
                isPublic: conf.isPublic,
                maxSecondsBeforePriceIsStale: conf.maxSecondsBeforePriceIsStale,
              },
              options
            );

          // Deploy PreferredPriceOracle
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["PreferredPriceOracle"].abi
          );
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["PreferredPriceOracle"].bin,
              arguments: [conf.chainlinkPriceOracle, conf.secondaryPriceOracle],
            })
            .send(options);

          break; */
        case "ChainlinkPriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["ChainlinkPriceOracle"].abi
          );
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["ChainlinkPriceOracle"].bin,
              arguments: [
                conf.maxSecondsBeforePriceIsStale
                  ? conf.maxSecondsBeforePriceIsStale
                  : 0,
              ],
            })
            .send(options);
          break;
        /* case "UniswapAnchoredView":
          // Input validation/default config
          if (
            conf.reporter === undefined ||
            conf.reporter === null ||
            conf.reporter === ""
          )
            conf.reporter = Fuse.COINBASE_PRO_REPORTER_ADDRESS;
          if (conf.anchorMantissa === undefined || conf.anchorMantissa === null)
            conf.anchorMantissa = Web3.utils.toBN(1e17); // 1e17 equates to 10% tolerance for source price to be above or below anchor
          if (conf.anchorPeriod === undefined || conf.anchorPeriod === null)
            conf.anchorPeriod = 30 * 60;

          // Deploy UniswapAnchoredView with ETH token config
          var priceOracle = new this.web3.eth.Contract(
            JSON.parse(
              openOracleContracts[
                "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView"
              ].abi
            )
          );
          var PriceSource = {
            FIXED_ETH: 0,
            FIXED_USD: 1,
            REPORTER: 2,
            TWAP: 3,
          };
          var tokenConfigs = [
            {
              underlying: "0x0000000000000000000000000000000000000000",
              symbolHash: Web3.utils.soliditySha3("ETH"),
              baseUnit: Web3.utils.toBN(1e18).toString(),
              priceSource: PriceSource.REPORTER,
              fixedPrice: 0,
              uniswapMarket: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
              isUniswapReversed: true,
            },
          ];
          var deployArgs = [
            Fuse.OPEN_ORACLE_PRICE_DATA_CONTRACT_ADDRESS,
            conf.reporter,
            conf.anchorMantissa,
            conf.anchorPeriod,
            tokenConfigs,
            conf.canAdminOverwrite ? true : false,
            conf.isSecure ? true : false,
            conf.maxSecondsBeforePriceIsStale
              ? conf.maxSecondsBeforePriceIsStale
              : 0,
          ];
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" +
                openOracleContracts[
                  "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView"
                ].bin,
              arguments: deployArgs,
            })
            .send(options);

          // Post reported ETH/USD price or (if price has never been reported) have user report and post price
          var priceData = new this.web3.eth.Contract(
            JSON.parse(
              openOracleContracts[
                "contracts/OpenOraclePriceData.sol:OpenOraclePriceData"
              ].abi
            ),
            Fuse.OPEN_ORACLE_PRICE_DATA_CONTRACT_ADDRESS
          );
          if (
            Web3.utils
              .toBN(
                await priceData.methods.getPrice(conf.reporter, "ETH").call()
              )
              .gt(Web3.utils.toBN(0))
          )
            await priceOracle.methods
              .postPrices([], [], ["ETH"])
              .send({ ...options });
          else
            prompt(
              "It looks like prices have never been reported for ETH. ETH prices are necessary to convert posted USD prices into outputted ETH prices. Please click OK once you have reported and posted prices for ETH."
            );

          break;
        case "UniswapView":
          if (conf.anchorPeriod === undefined || conf.anchorPeriod === null)
            conf.anchorPeriod = 30 * 60;
          var priceOracle = new this.web3.eth.Contract(
            JSON.parse(
              openOracleContracts[
                "contracts/Uniswap/UniswapView.sol:UniswapView"
              ].abi
            )
          );
          var deployArgs = [
            conf.anchorPeriod,
            conf.tokenConfigs !== undefined ? conf.tokenConfigs : [],
            conf.canAdminOverwrite && !conf.isPublic ? true : false,
            conf.isPublic ? true : false,
            conf.maxSecondsBeforePriceIsStale
              ? conf.maxSecondsBeforePriceIsStale
              : 0,
          ];
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" +
                openOracleContracts[
                  "contracts/Uniswap/UniswapView.sol:UniswapView"
                ].bin,
              arguments: deployArgs,
            })
            .send(options);
          break; */
        case "UniswapLpTokenPriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["UniswapLpTokenPriceOracle"].abi
          );
          var deployArgs = [conf.useRootOracle ? true : false];
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["UniswapLpTokenPriceOracle"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break;
        /* case "Keep3rPriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["Keep3rPriceOracle"].abi
          );
          var deployArgs = [conf.sushiswap ? true : false];
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["Keep3rPriceOracle"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break; */
        case "UniswapTwapPriceOracle": // Uniswap V2 TWAPs
          // Input validation
          if (!conf.uniswapV2Factory)
            conf.uniswapV2Factory = Fuse.UNISWAP_V2_FACTORY_ADDRESS;

          // Deploy oracle
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["UniswapTwapPriceOracle"].abi
          );
          var deployArgs = [
            Fuse.UNISWAP_TWAP_PRICE_ORACLE_ROOT_CONTRACT_ADDRESS,
            conf.uniswapV2Factory,
          ]; // Default to official Uniswap V2 factory
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["UniswapTwapPriceOracle"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break;
        case "UniswapTwapPriceOracleV2": // Uniswap V2 TWAPs
          // Input validation
          if (!conf.uniswapV2Factory)
            conf.uniswapV2Factory = Fuse.UNISWAP_V2_FACTORY_ADDRESS;

          // Check for existing oracle
          var oracleFactory = new this.web3.eth.Contract(
            this.oracleContracts.UniswapTwapPriceOracleV2Factory.abi,
            Fuse.UNISWAP_TWAP_PRICE_ORACLE_V2_FACTORY_CONTRACT_ADDRESS
          );
          var oracle = await oracleFactory.methods
            .oracles(conf.uniswapV2Factory, conf.baseToken)
            .call();

          // Deploy if oracle does not exist
          if (oracle == "0x0000000000000000000000000000000000000000") {
            await oracleFactory.methods
              .deploy(conf.uniswapV2Factory, conf.baseToken)
              .send(options);
            oracle = await oracleFactory.methods
              .oracles(conf.uniswapV2Factory, conf.baseToken)
              .call();
          }

          // Instantiate contract
          var priceOracle = new this.web3.eth.Contract([], oracle);

          break;
        case "ChainlinkPriceOracleV2":
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["ChainlinkPriceOracleV2"].abi
          );
          var deployArgs = [
            conf.admin ? conf.admin : options.from,
            conf.canAdminOverwrite ? true : false,
          ];
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["ChainlinkPriceOracleV2"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break;
        case "UniswapV3TwapPriceOracle": // Uniswap V3 TWAPs
          // Input validation
          if (!conf.uniswapV3Factory)
            conf.uniswapV3Factory = Fuse.UNISWAP_V3_FACTORY_ADDRESS;
          if ([500, 3000, 10000].indexOf(parseInt(conf.feeTier)) < 0)
            throw "Invalid fee tier passed to UniswapV3TwapPriceOracle deployment.";

          // Deploy oracle
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["UniswapV3TwapPriceOracle"].abi
          );
          var deployArgs = [conf.uniswapV3Factory, conf.feeTier]; // Default to official Uniswap V3 factory
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["UniswapV3TwapPriceOracle"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break;
        case "UniswapV3TwapPriceOracleV2": // Uniswap V3 TWAPs
          // Input validation
          if (!conf.uniswapV3Factory)
            conf.uniswapV3Factory = Fuse.UNISWAP_V3_FACTORY_ADDRESS;
          if ([500, 3000, 10000].indexOf(parseInt(conf.feeTier)) < 0)
            throw "Invalid fee tier passed to UniswapV3TwapPriceOracleV2 deployment.";

          // Check for existing oracle
          var oracleFactory = new this.web3.eth.Contract(
            this.oracleContracts.UniswapV3TwapPriceOracleV2Factory.abi,
            Fuse.UNISWAP_V3_TWAP_PRICE_ORACLE_V2_FACTORY_CONTRACT_ADDRESS
          );
          var oracle = await oracleFactory.methods
            .oracles(conf.uniswapV3Factory, conf.feeTier, conf.baseToken)
            .call();

          // Deploy if oracle does not exist
          if (oracle == "0x0000000000000000000000000000000000000000") {
            await oracleFactory.methods
              .deploy(conf.uniswapV3Factory, conf.feeTier, conf.baseToken)
              .send(options);
            oracle = await oracleFactory.methods
              .oracles(conf.uniswapV3Factory, conf.feeTier, conf.baseToken)
              .call();
          }

          // Instantiate contract
          var priceOracle = new this.web3.eth.Contract([], oracle);

          break;
        case "FixedTokenPriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["FixedTokenPriceOracle"].abi
          );
          var deployArgs = [conf.baseToken];
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts["FixedTokenPriceOracle"].bin,
              arguments: deployArgs,
            })
            .send(options);
          break;
        case "MasterPriceOracle":
          var initializableClones = new this.web3.eth.Contract(
            initializableClonesAbi,
            Fuse.INITIALIZABLE_CLONES_CONTRACT_ADDRESS
          );
          var masterPriceOracle = new this.web3.eth.Contract(
            oracleContracts["MasterPriceOracle"].abi
          );
          var deployArgs = [
            conf.underlyings ? conf.underlyings : [],
            conf.oracles ? conf.oracles : [],
            conf.defaultOracle ? conf.defaultOracle : "0x0000000000000000000000000000000000000000",
            conf.admin ? conf.admin : options.from,
            conf.canAdminOverwrite ? true : false,
          ];
          var initializerData = masterPriceOracle.methods.initialize(...deployArgs).encodeABI();
          var receipt = await initializableClones.methods.clone(Fuse.MASTER_PRICE_ORACLE_IMPLEMENTATION_CONTRACT_ADDRESS, initializerData).send(options);
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts["MasterPriceOracle"].abi,
            receipt.events["Deployed"].returnValues.instance
          );
          break;
        case "SimplePriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            JSON.parse(
              contracts["contracts/SimplePriceOracle.sol:SimplePriceOracle"].abi
            )
          );
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" +
                contracts["contracts/SimplePriceOracle.sol:SimplePriceOracle"]
                  .bin,
            })
            .send(options);
          break;
        default:
          var priceOracle = new this.web3.eth.Contract(
            oracleContracts[model].abi
          );
          priceOracle = await priceOracle
            .deploy({
              data: oracleContracts[model].bin,
            })
            .send(options);
          break;
      }

      return priceOracle.options.address;
    };

    this.deployComptroller = async function (
      closeFactor,
      maxAssets,
      liquidationIncentive,
      priceOracle,
      implementationAddress,
      options
    ) {
      if (!implementationAddress) {
        var comptroller = new this.web3.eth.Contract(
          JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi)
        );
        comptroller = await comptroller
          .deploy({
            data: "0x" + contracts["contracts/Comptroller.sol:Comptroller"].bin,
          })
          .send(options);
        implementationAddress = comptroller.options.address;
      }

      var unitroller = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/Unitroller.sol:Unitroller"].abi)
      );
      unitroller = await unitroller
        .deploy({
          data: "0x" + contracts["contracts/Unitroller.sol:Unitroller"].bin,
        })
        .send(options);
      await unitroller.methods
        ._setPendingImplementation(comptroller.options.address)
        .send(options);
      await comptroller.methods
        ._become(unitroller.options.address)
        .send(options);

      comptroller.options.address = unitroller.options.address;
      if (closeFactor)
        await comptroller.methods._setCloseFactor(closeFactor).send(options);
      if (maxAssets)
        await comptroller.methods._setMaxAssets(maxAssets).send(options);
      if (liquidationIncentive)
        await comptroller.methods
          ._setLiquidationIncentive(liquidationIncentive)
          .send(options);
      if (priceOracle)
        await comptroller.methods._setPriceOracle(priceOracle).send(options);

      return [unitroller.options.address, implementationAddress];
    };

    this.deployAsset = async function (
      conf,
      collateralFactor,
      reserveFactor,
      adminFee,
      options,
      bypassPriceFeedCheck
    ) {
      // Deploy new interest rate model via SDK if requested
      if (
        [
          "WhitePaperInterestRateModel",
          "JumpRateModel",
          "JumpRateModelV2",
          "ReactiveJumpRateModelV2",
          "DAIInterestRateModelV2", // NOT IN USE
        ].indexOf(conf.interestRateModel) >= 0
      ) {
        try {
          conf.interestRateModel = await this.deployInterestRateModel(
            conf.interestRateModel,
            conf.interestRateModelConf,
            options
          ); // TODO: anchorMantissa
        } catch (error) {
          throw (
            "Deployment of interest rate model failed: " +
            (error.message ? error.message : error)
          );
        }
      }

      // Deploy new asset to existing pool via SDK
      try {
        var [assetAddress, implementationAddress, receipt] =
          await this.deployCToken(
            conf,
            collateralFactor,
            reserveFactor,
            adminFee,
            options,
            bypassPriceFeedCheck
          );
      } catch (error) {
        throw (
          "Deployment of asset to Fuse pool failed: " +
          (error.message ? error.message : error)
        );
      }

      return [
        assetAddress,
        implementationAddress,
        conf.interestRateModel,
        receipt,
      ];
    };

    this.deployInterestRateModel = async function (model, conf, options) {
      // Default model = JumpRateModel
      if (!model) {
        model = "JumpRateModel";
      }

      // Get deployArgs
      var deployArgs = [];

      switch (model) {
        case "JumpRateModel":
          if (!conf)
            conf = {
              baseRatePerYear: "20000000000000000",
              multiplierPerYear: "200000000000000000",
              jumpMultiplierPerYear: "2000000000000000000",
              kink: "900000000000000000",
            };
          deployArgs = [
            conf.baseRatePerYear,
            conf.multiplierPerYear,
            conf.jumpMultiplierPerYear,
            conf.kink,
          ];
          break;
        case "JumpRateModelV2":
          if (!conf)
            conf = {
              baseRatePerYear: "20000000000000000",
              multiplierPerYear: "200000000000000000",
              jumpMultiplierPerYear: "2000000000000000000",
              kink: "900000000000000000",
              owner: options.from,
            };
          deployArgs = [
            conf.baseRatePerYear,
            conf.multiplierPerYear,
            conf.jumpMultiplierPerYear,
            conf.kink,
            conf.owner,
          ];
          break;
        case "ReactiveJumpRateModelV2":
          if (!conf)
            throw "No configuration passed to deployInterestRateModel.";
          deployArgs = [
            conf.baseRatePerYear,
            conf.multiplierPerYear,
            conf.jumpMultiplierPerYear,
            conf.kink,
            conf.owner,
            conf.cToken,
          ];
          break;
        case "DAIInterestRateModelV2": // NOT IN USE
          if (!conf)
            conf = {
              jumpMultiplierPerYear: "2000000000000000000",
              kink: "900000000000000000",
            };
          deployArgs = [
            conf.jumpMultiplierPerYear,
            conf.kink,
            Fuse.DAI_POT,
            Fuse.DAI_JUG,
          ];
          break;
        case "WhitePaperInterestRateModel":
          if (!conf)
            conf = {
              baseRatePerYear: "20000000000000000",
              multiplierPerYear: "200000000000000000",
            };
          deployArgs = [conf.baseRatePerYear, conf.multiplierPerYear];
          break;
      }

      // Deploy InterestRateModel
      var interestRateModel = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/" + model + ".sol:" + model].abi)
      );
      interestRateModel = await interestRateModel
        .deploy({
          data: "0x" + contracts["contracts/" + model + ".sol:" + model].bin,
          arguments: deployArgs,
        })
        .send(options);
      return interestRateModel.options.address;
    };

    this.deployCToken = async function (
      conf,
      collateralFactor,
      reserveFactor,
      adminFee,
      options,
      bypassPriceFeedCheck
    ) {
      // Check collateral factor
      if (
        Web3.utils.toBN(collateralFactor).isNeg() ||
        Web3.utils.toBN(collateralFactor).gt(Web3.utils.toBN(0.9e18))
      )
        throw "Collateral factor must range from 0 to 0.9.";

      // Check reserve factor + admin fee + Fuse fee
      if (Web3.utils.toBN(reserveFactor).isNeg())
        throw "Reserve factor cannot be negative.";
      if (Web3.utils.toBN(adminFee).isNeg())
        throw "Admin fee cannot be negative.";
      if (
        !Web3.utils.toBN(reserveFactor).isZero() ||
        !Web3.utils.toBN(adminFee).isZero()
      ) {
        var fuseFee = await this.contracts.FuseFeeDistributor.methods
          .interestFeeRate()
          .call();
        if (
          Web3.utils
            .toBN(reserveFactor)
            .add(Web3.utils.toBN(adminFee))
            .add(Web3.utils.toBN(fuseFee))
            .gt(Web3.utils.toBN(1e18))
        )
          throw (
            "Sum of reserve factor and admin fee should range from 0 to " +
            (1 - parseInt(fuseFee) / 1e18) +
            "."
          );
      }

      return conf.underlying !== undefined &&
        conf.underlying !== null &&
        conf.underlying.length > 0 &&
        !Web3.utils.toBN(conf.underlying).isZero()
        ? await this.deployCErc20(
            conf,
            collateralFactor,
            reserveFactor,
            adminFee,
            Fuse.CERC20_DELEGATE_CONTRACT_ADDRESS
              ? Fuse.CERC20_DELEGATE_CONTRACT_ADDRESS
              : null,
            options,
            bypassPriceFeedCheck
          )
        : await this.deployCEther(
            conf,
            collateralFactor,
            reserveFactor,
            adminFee,
            Fuse.CETHER_DELEGATE_CONTRACT_ADDRESS
              ? Fuse.CETHER_DELEGATE_CONTRACT_ADDRESS
              : null,
            options
          );
    };

    this.deployCEther = async function (
      conf,
      collateralFactor,
      reserveFactor,
      adminFee,
      implementationAddress,
      options
    ) {
      // Deploy CEtherDelegate implementation contract if necessary
      if (!implementationAddress) {
        var cEtherDelegate = new this.web3.eth.Contract(
          JSON.parse(
            contracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi
          )
        );
        cEtherDelegate = await cEtherDelegate
          .deploy({
            data:
              "0x" +
              contracts["contracts/CEtherDelegate.sol:CEtherDelegate"].bin,
          })
          .send(options);
        implementationAddress = cEtherDelegate.options.address;
      }

      // Deploy CEtherDelegator proxy contract
      let deployArgs = [
        conf.comptroller,
        conf.interestRateModel,
        conf.name,
        conf.symbol,
        implementationAddress,
        "0x00",
        reserveFactor ? reserveFactor.toString() : 0,
        adminFee ? adminFee.toString() : 0,
      ];
      var constructorData = this.web3.eth.abi.encodeParameters(
        [
          "address",
          "address",
          "string",
          "string",
          "address",
          "bytes",
          "uint256",
          "uint256",
        ],
        deployArgs
      );
      var comptroller = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi),
        conf.comptroller
      );
      var errorCode = await comptroller.methods
        ._deployMarket(
          "0x0000000000000000000000000000000000000000",
          constructorData,
          collateralFactor
        )
        .call(options);
      if (errorCode != 0)
        throw (
          "Failed to deploy market with error code: " +
          Fuse.COMPTROLLER_ERROR_CODES[errorCode]
        );
      var receipt = await comptroller.methods
        ._deployMarket(
          "0x0000000000000000000000000000000000000000",
          constructorData,
          collateralFactor
        )
        .send(options);
      var cEtherDelegatorAddress = this.getCreate2Address(
        Fuse.FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS,
        [
          conf.comptroller,
          "0x0000000000000000000000000000000000000000",
          receipt.blockNumber,
        ],
        this.web3.utils.sha3(
          "0x" +
            contracts["contracts/CEtherDelegator.sol:CEtherDelegator"].bin +
            constructorData.substring(2)
        )
      );

      // Return cToken proxy and implementation contract addresses
      return [cEtherDelegatorAddress, implementationAddress, receipt];
    };

    this.deployCErc20 = async function (
      conf,
      collateralFactor,
      reserveFactor,
      adminFee,
      implementationAddress,
      options,
      bypassPriceFeedCheck
    ) {
      // Get Comptroller
      var comptroller = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi),
        conf.comptroller
      );

      // Check for price feed assuming !bypassPriceFeedCheck
      if (!bypassPriceFeedCheck)
        await this.checkForCErc20PriceFeed(comptroller, conf);

      // Deploy CErc20Delegate implementation contract if necessary
      if (!implementationAddress) {
        if (!conf.delegateContractName)
          conf.delegateContractName = "CErc20Delegate";
        var cErc20Delegate = new this.web3.eth.Contract(
          JSON.parse(
            contracts[
              "contracts/" +
                conf.delegateContractName +
                ".sol:" +
                conf.delegateContractName
            ].abi
          )
        );
        cErc20Delegate = await cErc20Delegate
          .deploy({
            data:
              "0x" +
              contracts[
                "contracts/" +
                  conf.delegateContractName +
                  ".sol:" +
                  conf.delegateContractName
              ].bin,
          })
          .send(options);
        implementationAddress = cErc20Delegate.options.address;
      }

      let deployArgs = [
        conf.underlying,
        conf.comptroller,
        conf.interestRateModel,
        conf.name,
        conf.symbol,
        implementationAddress,
        "0x00",
        reserveFactor ? reserveFactor.toString() : 0,
        adminFee ? adminFee.toString() : 0,
      ];
      var constructorData = this.web3.eth.abi.encodeParameters(
        [
          "address",
          "address",
          "address",
          "string",
          "string",
          "address",
          "bytes",
          "uint256",
          "uint256",
        ],
        deployArgs
      );
      var errorCode = await comptroller.methods
        ._deployMarket(false, constructorData, collateralFactor)
        .call(options);
      if (errorCode != 0)
        throw (
          "Failed to deploy market with error code: " +
          Fuse.COMPTROLLER_ERROR_CODES[errorCode]
        );
      var receipt = await comptroller.methods
        ._deployMarket(false, constructorData, collateralFactor)
        .send(options);
      var cErc20DelegatorAddress = this.getCreate2Address(
        Fuse.FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS,
        [conf.comptroller, conf.underlying, receipt.blockNumber],
        this.web3.utils.sha3(
          "0x" +
            contracts["contracts/CErc20Delegator.sol:CErc20Delegator"].bin +
            constructorData.substring(2)
        )
      );

      // Return cToken proxy and implementation contract addresses
      return [cErc20DelegatorAddress, implementationAddress, receipt];
    };

    this.identifyPriceOracle = async function (priceOracleAddress) {
      // Get PriceOracle type from runtime bytecode hash
      var runtimeBytecodeHash = Web3.utils.sha3(
        await this.web3.eth.getCode(priceOracleAddress)
      );
      if (!runtimeBytecodeHash || !(typeof runtimeBytecodeHash === 'string' || runtimeBytecodeHash instanceof String)) return null;
      runtimeBytecodeHash = runtimeBytecodeHash.toLowerCase();

      for (const oracleContractName of Object.keys(
        Fuse.PRICE_ORACLE_RUNTIME_BYTECODE_HASHES
      )) {
        const valueOrArr =
          Fuse.PRICE_ORACLE_RUNTIME_BYTECODE_HASHES[oracleContractName];

        if (Array.isArray(valueOrArr)) {
          for (const potentialHash of valueOrArr) {
            if (runtimeBytecodeHash == potentialHash.toLowerCase()) return oracleContractName;
          }
        } else {
          if (runtimeBytecodeHash == valueOrArr.toLowerCase()) return oracleContractName;
        }
      }

      return "";
    };

    this.identifyInterestRateModel = async function (interestRateModelAddress) {
      // Get interest rate model type from runtime bytecode hash and init class
      var interestRateModels = {
        JumpRateModel: JumpRateModel,
        JumpRateModelV2: JumpRateModelV2,
        DAIInterestRateModelV2: DAIInterestRateModelV2,
        WhitePaperInterestRateModel: WhitePaperInterestRateModel,
      };

      var runtimeBytecodeHash = Web3.utils.sha3(
        await this.web3.eth.getCode(interestRateModelAddress)
      );
      if (!runtimeBytecodeHash || !(typeof runtimeBytecodeHash === 'string' || runtimeBytecodeHash instanceof String)) return null;
      runtimeBytecodeHash = runtimeBytecodeHash.toLowerCase();
      var interestRateModel = null;

      outerLoop: for (const model of [
        "JumpRateModel",
        "JumpRateModelV2",
        "DAIInterestRateModelV2",
        "WhitePaperInterestRateModel",
      ]) {
        if (interestRateModels[model].RUNTIME_BYTECODE_HASHES !== undefined) {
          for (const hash of interestRateModels[model]
            .RUNTIME_BYTECODE_HASHES) {
            if (runtimeBytecodeHash == hash.toLowerCase()) {
              interestRateModel = new interestRateModels[model]();
              break outerLoop;
            }
          }
        } else if (
          runtimeBytecodeHash == interestRateModels[model].RUNTIME_BYTECODE_HASH.toLowerCase()
        ) {
          interestRateModel = new interestRateModels[model]();
          break;
        }
      }

      return interestRateModel;
    };

    this.getInterestRateModel = async function (assetAddress) {
      // Get interest rate model address from asset address
      var assetContract = new this.web3.eth.Contract(
        JSON.parse(
          contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi
        ),
        assetAddress
      );
      var interestRateModelAddress = await assetContract.methods
        .interestRateModel()
        .call();

      var interestRateModel = await this.identifyInterestRateModel(
        interestRateModelAddress
      );

      await interestRateModel.init(
        this.web3,
        interestRateModelAddress,
        assetAddress
      );
      return interestRateModel;
    };

    this.checkForCErc20PriceFeed = async function (comptroller, conf) {
      // Check for ChainlinkPriceOracle with a corresponding feed
      var priceOracle = await comptroller.methods.oracle().call();
      var chainlinkPriceOracle = new this.web3.eth.Contract(
        oracleContracts["ChainlinkPriceOracle"].abi,
        priceOracle
      );

      if (conf.underlying.toLowerCase() == Fuse.WETH_ADDRESS.toLowerCase())
        var chainlinkPriceFeed = true;
      else
        try {
          var chainlinkPriceFeed = await chainlinkPriceOracle.methods
            .hasPriceFeed(conf.underlying)
            .call();
        } catch {}

      if (chainlinkPriceFeed === undefined || !chainlinkPriceFeed) {
        // Check for PreferredPriceOracle with underlying ChainlinkPriceOracle with a corresponding feed
        var preferredPriceOracle = new this.web3.eth.Contract(
          oracleContracts["PreferredPriceOracle"].abi,
          priceOracle
        );

        try {
          var chainlinkPriceOracle = await preferredPriceOracle.methods
            .chainlinkOracle()
            .call();
          chainlinkPriceOracle = new this.web3.eth.Contract(
            oracleContracts["ChainlinkPriceOracle"].abi,
            chainlinkPriceOracle
          );
          var chainlinkPriceFeed = await chainlinkPriceOracle.methods
            .hasPriceFeed(conf.underlying)
            .call();
        } catch {}
      }

      if (chainlinkPriceFeed === undefined || !chainlinkPriceFeed) {
        // Check if we can get a UniswapAnchoredView
        var isUniswapAnchoredView = false;

        try {
          var uniswapOrUniswapAnchoredView = new this.web3.eth.Contract(
            JSON.parse(
              openOracleContracts[
                "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView"
              ].abi
            ),
            priceOracle
          );
          await uniswapOrUniswapAnchoredView.methods
            .IS_UNISWAP_ANCHORED_VIEW()
            .call();
          isUniswapAnchoredView = true;
        } catch {
          try {
            var uniswapOrUniswapAnchoredView = new this.web3.eth.Contract(
              JSON.parse(
                openOracleContracts[
                  "contracts/Uniswap/UniswapView.sol:UniswapView"
                ].abi
              ),
              priceOracle
            );
            await uniswapOrUniswapAnchoredView.methods.IS_UNISWAP_VIEW().call();
          } catch {
            // Check for PreferredPriceOracle with underlying UniswapAnchoredView
            var preferredPriceOracle = new this.web3.eth.Contract(
              oracleContracts["PreferredPriceOracle"].abi,
              priceOracle
            );

            try {
              var uniswapOrUniswapAnchoredView =
                await preferredPriceOracle.methods.secondaryOracle().call();
            } catch {
              throw "Underlying token price for this asset is not available via this oracle.";
            }

            try {
              uniswapOrUniswapAnchoredView = new this.web3.eth.Contract(
                JSON.parse(
                  openOracleContracts[
                    "contracts/Uniswap/UniswapAnchoredView.sol:UniswapAnchoredView"
                  ].abi
                ),
                uniswapOrUniswapAnchoredView
              );
              await uniswapOrUniswapAnchoredView.methods
                .IS_UNISWAP_ANCHORED_VIEW()
                .call();
              isUniswapAnchoredView = true;
            } catch {
              try {
                uniswapOrUniswapAnchoredView = new this.web3.eth.Contract(
                  JSON.parse(
                    openOracleContracts[
                      "contracts/Uniswap/UniswapView.sol:UniswapView"
                    ].abi
                  ),
                  uniswapOrUniswapAnchoredView
                );
                await uniswapOrUniswapAnchoredView.methods
                  .IS_UNISWAP_VIEW()
                  .call();
              } catch {
                throw "Underlying token price not available via ChainlinkPriceOracle, and no UniswapAnchoredView or UniswapView was found.";
              }
            }
          }
        }

        // Check if the token already exists
        try {
          await uniswapOrUniswapAnchoredView.methods
            .getTokenConfigByUnderlying(conf.underlying)
            .call();
        } catch {
          // If not, add it!
          var underlyingToken = new this.web3.eth.Contract(
            JSON.parse(
              contracts["contracts/EIP20Interface.sol:EIP20Interface"].abi
            ),
            conf.underlying
          );
          var underlyingSymbol = await underlyingToken.methods.symbol().call();
          var underlyingDecimals = await underlyingToken.methods
            .decimals()
            .call();

          const PriceSource = {
            FIXED_ETH: 0,
            FIXED_USD: 1,
            REPORTER: 2,
            TWAP: 3,
          };

          if (
            conf.underlying.toLowerCase() == Fuse.WETH_ADDRESS.toLowerCase()
          ) {
            // WETH
            await uniswapOrUniswapAnchoredView.methods
              .add([
                {
                  underlying: conf.underlying,
                  symbolHash: Web3.utils.soliditySha3(underlyingSymbol),
                  baseUnit: Web3.utils
                    .toBN(10)
                    .pow(Web3.utils.toBN(underlyingDecimals))
                    .toString(),
                  priceSource: PriceSource.FIXED_ETH,
                  fixedPrice: Web3.utils.toBN(1e18).toString(),
                  uniswapMarket: "0x0000000000000000000000000000000000000000",
                  isUniswapReversed: false,
                },
              ])
              .send({ ...options });
          } else if (
            conf.underlying === "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
          ) {
            // USDC
            if (isUniswapAnchoredView) {
              await uniswapOrUniswapAnchoredView.methods
                .add([
                  {
                    underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    symbolHash: Web3.utils.soliditySha3("USDC"),
                    baseUnit: Web3.utils.toBN(1e6).toString(),
                    priceSource: PriceSource.FIXED_USD,
                    fixedPrice: 1e6,
                    uniswapMarket: "0x0000000000000000000000000000000000000000",
                    isUniswapReversed: false,
                  },
                ])
                .send({ ...options });
            } else {
              await uniswapOrUniswapAnchoredView.methods
                .add([
                  {
                    underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    symbolHash: Web3.utils.soliditySha3("USDC"),
                    baseUnit: Web3.utils.toBN(1e6).toString(),
                    priceSource: PriceSource.TWAP,
                    fixedPrice: 0,
                    uniswapMarket: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
                    isUniswapReversed: false,
                  },
                ])
                .send({ ...options });
              await uniswapOrUniswapAnchoredView.methods
                .postPrices(["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"])
                .send({ ...options });
            }
          } else {
            // Ask about fixed prices if UniswapAnchoredView or if UniswapView is not public; otherwise, prompt for Uniswap V2 pair
            if (
              isUniswapAnchoredView ||
              !(await uniswapOrUniswapAnchoredView.methods.isPublic().call())
            ) {
              // Check for fixed ETH
              var fixedEth = confirm(
                "Should the price of this token be fixed to 1 ETH?"
              );

              if (fixedEth) {
                await uniswapOrUniswapAnchoredView.methods
                  .add([
                    {
                      underlying: conf.underlying,
                      symbolHash: Web3.utils.soliditySha3(underlyingSymbol),
                      baseUnit: Web3.utils
                        .toBN(10)
                        .pow(Web3.utils.toBN(underlyingDecimals))
                        .toString(),
                      priceSource: PriceSource.FIXED_ETH,
                      fixedPrice: Web3.utils.toBN(1e18).toString(),
                      uniswapMarket:
                        "0x0000000000000000000000000000000000000000",
                      isUniswapReversed: false,
                    },
                  ])
                  .send({ ...options });
              } else {
                // Check for fixed USD
                var msg = "Should the price of this token be fixed to 1 USD?";
                if (!isUniswapAnchoredView)
                  msg +=
                    " If so, please note that you will need to run postPrices on your UniswapView for USDC instead of " +
                    underlyingSymbol +
                    " (as technically, the " +
                    underlyingSymbol +
                    " price would be fixed to 1 USDC).";
                var fixedUsd = confirm(msg);

                if (fixedUsd) {
                  var tokenConfigs = [
                    {
                      underlying: conf.underlying,
                      symbolHash: Web3.utils.soliditySha3(underlyingSymbol),
                      baseUnit: Web3.utils
                        .toBN(10)
                        .pow(Web3.utils.toBN(underlyingDecimals))
                        .toString(),
                      priceSource: PriceSource.FIXED_USD,
                      fixedPrice: Web3.utils.toBN(1e6).toString(),
                      uniswapMarket:
                        "0x0000000000000000000000000000000000000000",
                      isUniswapReversed: false,
                    },
                  ];

                  // UniswapView only: add USDC token config if not present so price oracle can convert from USD to ETH
                  if (!isUniswapAnchoredView) {
                    try {
                      await uniswapOrUniswapAnchoredView.methods
                        .getTokenConfigByUnderlying(
                          "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                        )
                        .call();
                    } catch (error) {
                      tokenConfigs.push({
                        underlying:
                          "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                        symbolHash: Web3.utils.soliditySha3("USDC"),
                        baseUnit: Web3.utils.toBN(1e6).toString(),
                        priceSource: PriceSource.TWAP,
                        fixedPrice: 0,
                        uniswapMarket:
                          "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
                        isUniswapReversed: false,
                      });
                    }
                  }

                  // Add token config(s)
                  await uniswapOrUniswapAnchoredView.methods
                    .add(tokenConfigs)
                    .send({ ...options });

                  // UniswapView only: post USDC price
                  if (!isUniswapAnchoredView)
                    await uniswapOrUniswapAnchoredView.methods
                      .postPrices([
                        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                      ])
                      .send({ ...options });
                } else await promptForUniswapV2Pair(this); // Prompt for Uniswap V2 pair
              }
            } else await promptForUniswapV2Pair(this); // Prompt for Uniswap V2 pair

            async function promptForUniswapV2Pair(self) {
              // Predict correct Uniswap V2 pair
              var isNotReversed =
                conf.underlying.toLowerCase() < Fuse.WETH_ADDRESS.toLowerCase();
              var tokens = isNotReversed
                ? [conf.underlying, Fuse.WETH_ADDRESS]
                : [Fuse.WETH_ADDRESS, conf.underlying];
              var uniswapV2Pair = self.getCreate2Address(
                Fuse.UNISWAP_V2_FACTORY_ADDRESS,
                tokens,
                Fuse.UNISWAP_V2_PAIR_INIT_CODE_HASH
              );

              // Double-check with user that pair is correct
              var correctUniswapV2Pair = confirm(
                "We have determined that the correct Uniswap V2 pair for " +
                  (isNotReversed
                    ? underlyingSymbol + "/ETH"
                    : "ETH/" + underlyingSymbol) +
                  " is " +
                  uniswapV2Pair +
                  ". Is this correct?"
              );

              if (!correctUniswapV2Pair) {
                uniswapV2Pair = prompt(
                  "Please enter the underlying token's ETH-based Uniswap V2 pair address:"
                );
                if (uniswapV2Pair.length == 0)
                  throw isUniswapAnchoredView
                    ? "Reported prices must have a Uniswap V2 pair as an anchor!"
                    : "Non-fixed prices must have a Uniswap V2 pair from which to source prices!";
                isNotReversed = confirm(
                  "Press OK if the Uniswap V2 pair is " +
                    underlyingSymbol +
                    "/ETH. If it is reversed (ETH/" +
                    underlyingSymbol +
                    "), press Cancel."
                );
              }

              // Add asset to oracle
              await uniswapOrUniswapAnchoredView.methods
                .add([
                  {
                    underlying: conf.underlying,
                    symbolHash: Web3.utils.soliditySha3(underlyingSymbol),
                    baseUnit: Web3.utils
                      .toBN(10)
                      .pow(Web3.utils.toBN(underlyingDecimals))
                      .toString(),
                    priceSource: isUniswapAnchoredView
                      ? PriceSource.REPORTER
                      : PriceSource.TWAP,
                    fixedPrice: 0,
                    uniswapMarket: uniswapV2Pair,
                    isUniswapReversed: !isNotReversed,
                  },
                ])
                .send({ ...options });

              // Post first price
              if (isUniswapAnchoredView) {
                // Post reported price or (if price has never been reported) have user report and post price
                var priceData = new self.web3.eth.Contract(
                  JSON.parse(
                    openOracleContracts[
                      "contracts/OpenOraclePriceData.sol:OpenOraclePriceData"
                    ].abi
                  ),
                  await uniswapOrUniswapAnchoredView.methods.priceData().call()
                );
                var reporter = await uniswapOrUniswapAnchoredView.methods
                  .reporter()
                  .call();
                if (
                  Web3.utils
                    .toBN(
                      await priceData.methods
                        .getPrice(reporter, underlyingSymbol)
                        .call()
                    )
                    .gt(Web3.utils.toBN(0))
                )
                  await uniswapOrUniswapAnchoredView.methods
                    .postPrices([], [], [underlyingSymbol])
                    .send({ ...options });
                else
                  prompt(
                    "It looks like prices have never been reported for " +
                      underlyingSymbol +
                      ". Please click OK once you have reported and posted prices for" +
                      underlyingSymbol +
                      "."
                  );
              } else {
                await uniswapOrUniswapAnchoredView.methods
                  .postPrices([conf.underlying])
                  .send({ ...options });
              }
            }
          }
        }
      }
    };

    this.getPriceOracle = async function (oracleAddress) {
      // Get PriceOracle type from runtime bytecode hash
      var runtimeBytecodeHash = Web3.utils.sha3(
        await this.web3.eth.getCode(oracleAddress)
      );
      if (!runtimeBytecodeHash || !(typeof runtimeBytecodeHash === 'string' || runtimeBytecodeHash instanceof String)) return "";
      runtimeBytecodeHash = runtimeBytecodeHash.toLowerCase();
      
      for (const model of Object.keys(
        Fuse.PRICE_ORACLE_RUNTIME_BYTECODE_HASHES
      ))
        if (
          runtimeBytecodeHash ==
          Fuse.PRICE_ORACLE_RUNTIME_BYTECODE_HASHES[model].toLowerCase()
        )
          return model;
      return "";
    };

    this.deployRewardsDistributor = async function (rewardToken, options) {
      const distributor = new this.web3.eth.Contract(
        JSON.parse(
          contracts[
            "contracts/RewardsDistributorDelegator.sol:RewardsDistributorDelegator"
          ].abi
        )
      );
      console.log({ options, rewardToken });

      const deployedDistributor = await distributor
        .deploy({
          data:
            "0x" +
            contracts[
              "contracts/RewardsDistributorDelegator.sol:RewardsDistributorDelegator"
            ].bin,
          arguments: [
            options.from,
            rewardToken,
            Fuse.REWARDS_DISTRIBUTOR_DELEGATE_CONTRACT_ADDRESS,
          ],
        })
        .send(options);
      // const rdAddress = distributor.options.address;
      return deployedDistributor;
    };

    this.checkCardinality = async function (uniswapV3Pool) {
      var uniswapV3PoolContract = new this.web3.eth.Contract(
        uniswapV3PoolAbiSlim,
        uniswapV3Pool
      );
      const shouldPrime =
        (await uniswapV3PoolContract.methods.slot0().call())
          .observationCardinalityNext < 64;
      return shouldPrime;
    };

    this.primeUniswapV3Oracle = async function (uniswapV3Pool, options) {
      var uniswapV3PoolContract = new this.web3.eth.Contract(
        uniswapV3PoolAbiSlim,
        uniswapV3Pool
      );
      await uniswapV3PoolContract.methods
        .increaseObservationCardinalityNext(64)
        .send(options);
    };

    this.identifyInterestRateModelName = (irmAddress) => {
      if (!irmAddress || !(typeof irmAddress === 'string' || irmAddress instanceof String)) return "";
      irmAddress = irmAddress.toLowerCase();
      let name = "";

      Object.entries(
        Fuse.PUBLIC_INTEREST_RATE_MODEL_CONTRACT_ADDRESSES
      ).forEach(([key, value]) => {
        if (value.toLowerCase() === irmAddress) {
          name = key;
        }
      });
      return name;
    };
  }

  static Web3 = Web3;
  static BN = Web3.utils.BN;
}

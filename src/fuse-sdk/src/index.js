/* eslint-disable */
import Web3 from "web3";

import JumpRateModel from "./irm/JumpRateModel.js";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2.js";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel.js";

var fusePoolDirectoryAbi = require(__dirname + "/abi/FusePoolDirectory.json");
var fuseSafeLiquidatorAbi = require(__dirname + "/abi/FuseSafeLiquidator.json");
var fuseFeeDistrbutorAbi = require(__dirname + "/abi/FuseFeeDistributor.json");
var contracts = require(__dirname + "/contracts/compound-protocol.min.json")
  .contracts;
var openOracleContracts = require(__dirname + "/contracts/open-oracle.min.json")
  .contracts;

export default class Fuse {
  static FUSE_POOL_DIRECTORY_CONTRACT_ADDRESS =
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // TODO: Set correct mainnet address after deployment
  static FUSE_SAFE_LIQUIDATOR_CONTRACT_ADDRESS =
    "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // TODO: Set correct mainnet address after deployment
  static FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS =
    "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"; // TODO: Set correct mainnet address after deployment

  static COMPTROLLER_IMPLEMENTATION_CONTRACT_ADDRESS =
    "0x1ca334e4bceb0c6d95733d11ed0e9b52caf66807"; // TODO: Set correct mainnet address after deployment
  static CERC20_DELEGATE_CONTRACT_ADDRESS =
    "0xee8163c19f2ff59410edc6494505c129bddd3851"; // TODO: Set correct mainnet address after deployment
  static CETHER_DELEGATE_CONTRACT_ADDRESS =
    "0x8a0ab5a52ddcf13a9d5b68f7961289f5e08ebc5f"; // TODO: Set correct mainnet address after deployment

  static OPEN_ORACLE_PRICE_DATA_CONTRACT_ADDRESS =
    "0xc629c26dced4277419cde234012f8160a0278a79";
  static COINBASE_PRO_REPORTER_ADDRESS =
    "0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC";

  static PUBLIC_PREFERRED_PRICE_ORACLE_CONTRACT_ADDRESS =
    "0xb4c963cc484857e668f884194ee46ea29f6180a2"; // TODO: Set correct mainnet address after deployment
  static PUBLIC_CHAINLINK_PRICE_ORACLE_CONTRACT_ADDRESS =
    "0x026838c33c05cace3495bfe51261f7d942fddf8a"; // TODO: Set correct mainnet address after deployment
  static PUBLIC_UNISWAP_VIEW_CONTRACT_ADDRESS =
    "0x8ff698981fb7673eda1ae2e2723bc9aea33b9f61"; // TODO: Set correct mainnet address after deployment
  static PUBLIC_UNISWAP_SPOT_VIEW_CONTRACT_ADDRESS = ""; // TODO: Set correct mainnet address after deployment

  static DAI_POT = "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7";
  static DAI_JUG = "0x19c0976f590d67707e62397c87829d896dc0f1f1";

  static UNISWAP_V2_FACTORY_ADDRESS =
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  static UNISWAP_V2_PAIR_INIT_CODE_HASH =
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
  static WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  static PRICE_ORACLE_RUNTIME_BYTECODE_HASHES = {
    PreferredPriceOracle:
      "0x76520d6fcfcfa7f457ab83d7b73db055f7bad3bd5f064df2500abcbbdec6f11f",
    ChainlinkPriceOracle:
      "0x7390a299baa380530decfe24773f3b740db1ad552e3a241cde75cd9d74e7a3c7",
    UniswapView:
      "0x262201ec0397bfc12b95236a81826647a722f219c6d789449d287b1917273fbd",
    UniswapAnchoredView:
      "0x688f4a293eda38ea8a0f5e24576aace04b3d16a186838fc1c886bac8f33e1818",
  };

  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider);

    this.contracts = {
      FusePoolDirectory: new this.web3.eth.Contract(
        fusePoolDirectoryAbi,
        Fuse.FUSE_POOL_DIRECTORY_CONTRACT_ADDRESS
      ),
      FuseSafeLiquidator: new this.web3.eth.Contract(
        fuseSafeLiquidatorAbi,
        Fuse.FUSE_SAFE_LIQUIDATOR_CONTRACT_ADDRESS
      ),
      FuseFeeDistrbutor: new this.web3.eth.Contract(
        fuseFeeDistrbutorAbi,
        Fuse.FUSE_FEE_DISTRIBUTOR_CONTRACT_ADDRESS
      ),
    };

    this.compoundContracts = contracts;
    this.openOracleContracts = openOracleContracts;

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
      isPrivate,
      closeFactor,
      maxAssets,
      liquidationIncentive,
      priceOracle,
      priceOracleConf,
      options
    ) {
      // Deploy new price oracle via SDK if requested
      if (
        [
          "SimplePriceOracle",
          "PreferredPriceOracle",
          "ChainlinkPriceOracle",
          "UniswapAnchoredView",
          "UniswapView",
        ].indexOf(priceOracle) >= 0
      ) {
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
            isPrivate,
            closeFactor,
            maxAssets,
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

      return [poolAddress, implementationAddress, priceOracle];
    };

    this._deployPool = async function (
      poolName,
      isPrivate,
      closeFactor,
      maxAssets,
      liquidationIncentive,
      priceOracle,
      priceOracleConf,
      options
    ) {
      // Deploy new price oracle via SDK if requested
      if (
        [
          "SimplePriceOracle",
          "PreferredPriceOracle",
          "ChainlinkPriceOracle",
          "UniswapAnchoredView",
          "UniswapView",
        ].indexOf(priceOracle) >= 0
      ) {
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

      // Deploy new pool via SDK
      try {
        var [poolAddress, implementationAddress] = await this.deployComptroller(
          closeFactor,
          maxAssets,
          liquidationIncentive,
          priceOracle,
          null,
          options
        );
      } catch (error) {
        throw (
          "Deployment of Comptroller failed: " +
          (error.message ? error.message : error)
        );
      }

      // Register new pool with FusePoolDirectory
      try {
        await this.contracts.FusePoolDirectory.methods
          .registerPool(poolName, poolAddress, isPrivate)
          .send(options);
      } catch (error) {
        throw (
          "Registration of new Fuse pool failed: " +
          (error.message ? error.message : error)
        );
      }

      return [poolAddress, implementationAddress, priceOracle];
    };

    this.deployPriceOracle = async function (model, conf, options) {
      if (!model) model = "PreferredPriceOracle";
      if (!conf) conf = {};

      switch (model) {
        case "PreferredPriceOracle":
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
          if (!conf.uniswapPriceOracle)
            conf.uniswapPriceOracle = await this.deployPriceOracle(
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
            JSON.parse(
              contracts[
                "contracts/PreferredPriceOracle.sol:PreferredPriceOracle"
              ].abi
            )
          );
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" +
                contracts[
                  "contracts/PreferredPriceOracle.sol:PreferredPriceOracle"
                ].bin,
              arguments: [conf.chainlinkPriceOracle, conf.uniswapPriceOracle],
            })
            .send(options);

          break;
        case "ChainlinkPriceOracle":
          var priceOracle = new this.web3.eth.Contract(
            JSON.parse(
              contracts[
                "contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle"
              ].abi
            )
          );
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" +
                contracts[
                  "contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle"
                ].bin,
              arguments: [
                conf.maxSecondsBeforePriceIsStale
                  ? conf.maxSecondsBeforePriceIsStale
                  : 0,
              ],
            })
            .send(options);
          break;
        case "UniswapAnchoredView":
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
            conf.maxSecondsBeforePriceIsStale ? conf.maxSecondsBeforePriceIsStale : 0,
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
            conf.maxSecondsBeforePriceIsStale ? conf.maxSecondsBeforePriceIsStale : 0,
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
          break;
        default:
          var priceOracle = new this.web3.eth.Contract(
            JSON.parse(contracts["contracts/" + model + ".sol:" + model].abi)
          );
          priceOracle = await priceOracle
            .deploy({
              data:
                "0x" + contracts["contracts/" + model + ".sol:" + model].bin,
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
          "DAIInterestRateModelV2",
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
        var [assetAddress, implementationAddress] = await this.deployCToken(
          conf,
          true,
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

      return [assetAddress, implementationAddress, conf.interestRateModel];
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
        case "DAIInterestRateModelV2":
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
      supportMarket,
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
        var fuseFee = await this.contracts.FuseFeeDistrbutor.methods
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
            supportMarket,
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
            supportMarket,
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
      supportMarket,
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

      // Deploy CEtherDelegator proxy contract if necessary
      var cEtherDelegator = new this.web3.eth.Contract(
        JSON.parse(
          contracts["contracts/CEtherDelegator.sol:CEtherDelegator"].abi
        )
      );
      let deployArgs = [
        conf.comptroller,
        conf.interestRateModel,
        conf.initialExchangeRateMantissa.toString(),
        conf.name,
        conf.symbol,
        conf.decimals,
        conf.admin,
        implementationAddress,
        "0x0",
        reserveFactor ? reserveFactor : 0,
        adminFee ? adminFee : 0,
      ];
      cEtherDelegator = await cEtherDelegator
        .deploy({
          data:
            "0x" +
            contracts["contracts/CEtherDelegator.sol:CEtherDelegator"].bin,
          arguments: deployArgs,
        })
        .send(options);

      // Register new asset with Comptroller
      var comptroller = new this.web3.eth.Contract(
        JSON.parse(contracts["contracts/Comptroller.sol:Comptroller"].abi),
        conf.comptroller
      );
      cEtherDelegator.options.jsonInterface = JSON.parse(
        contracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi
      );

      if (supportMarket) {
        if (collateralFactor)
          await comptroller.methods
            ._supportMarketAndSetCollateralFactor(
              cEtherDelegator.options.address,
              collateralFactor
            )
            .send(options);
        else
          await comptroller.methods
            ._supportMarket(cEtherDelegator.options.address)
            .send(options);
      }

      // Return cToken proxy and implementation contract addresses
      return [cEtherDelegator.options.address, implementationAddress];
    };

    this.deployCErc20 = async function (
      conf,
      supportMarket,
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
      if (!bypassPriceFeedCheck) await this.checkForCErc20PriceFeed(comptroller, conf);

      // Deploy CErc20Delegate implementation contract if necessary
      if (!implementationAddress) {
        var cErc20Delegate = new this.web3.eth.Contract(
          JSON.parse(
            contracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
          )
        );
        cErc20Delegate = await cErc20Delegate
          .deploy({
            data:
              "0x" +
              contracts["contracts/CErc20Delegate.sol:CErc20Delegate"].bin,
          })
          .send(options);
        implementationAddress = cErc20Delegate.options.address;
      }

      // Deploy CErc20Delegator proxy contract if necessary
      var cErc20Delegator = new this.web3.eth.Contract(
        JSON.parse(
          contracts["contracts/CErc20Delegator.sol:CErc20Delegator"].abi
        )
      );
      let deployArgs = [
        conf.underlying,
        conf.comptroller,
        conf.interestRateModel,
        conf.initialExchangeRateMantissa.toString(),
        conf.name,
        conf.symbol,
        conf.decimals,
        conf.admin,
        implementationAddress,
        "0x0",
        reserveFactor ? reserveFactor : 0,
        adminFee ? adminFee : 0,
      ];
      cErc20Delegator = await cErc20Delegator
        .deploy({
          data:
            "0x" +
            contracts["contracts/CErc20Delegator.sol:CErc20Delegator"].bin,
          arguments: deployArgs,
        })
        .send(options);

      // Register new asset with Comptroller
      cErc20Delegator.options.jsonInterface = JSON.parse(
        contracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi
      );

      if (supportMarket) {
        if (collateralFactor)
          await comptroller.methods
            ._supportMarketAndSetCollateralFactor(
              cErc20Delegator.options.address,
              collateralFactor
            )
            .send(options);
        else
          await comptroller.methods
            ._supportMarket(cErc20Delegator.options.address)
            .send(options);
      }

      // Return cToken proxy and implementation contract addresses
      return [cErc20Delegator.options.address, implementationAddress];
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

      // Get interest rate model type from runtime bytecode hash and init class
      var interestRateModels = {
        JumpRateModel: JumpRateModel,
        DAIInterestRateModelV2: DAIInterestRateModelV2,
        WhitePaperInterestRateModel: WhitePaperInterestRateModel,
      };

      var runtimeBytecodeHash = Web3.utils.sha3(
        await this.web3.eth.getCode(interestRateModelAddress)
      );
      var interestRateModel = null;
      for (const model of [
        "JumpRateModel",
        "DAIInterestRateModelV2",
        "WhitePaperInterestRateModel",
      ])
        if (
          runtimeBytecodeHash == interestRateModels[model].RUNTIME_BYTECODE_HASH
        )
          interestRateModel = new interestRateModels[model]();
      if (interestRateModel === null) return null;
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
        JSON.parse(
          contracts["contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle"]
            .abi
        ),
        priceOracle
      );

      try {
        var chainlinkPriceFeed = await chainlinkPriceOracle.methods
          .priceFeeds(conf.underlying)
          .call();
      } catch {}

      if (
        chainlinkPriceFeed === undefined ||
        Web3.utils.toBN(chainlinkPriceFeed).isZero()
      ) {
        // Check for PreferredPriceOracle with underlying ChainlinkPriceOracle with a corresponding feed
        var preferredPriceOracle = new this.web3.eth.Contract(
          JSON.parse(
            contracts["contracts/PreferredPriceOracle.sol:PreferredPriceOracle"]
              .abi
          ),
          priceOracle
        );

        try {
          var chainlinkPriceOracle = await preferredPriceOracle.methods
            .chainlinkOracle()
            .call();
          chainlinkPriceOracle = new this.web3.eth.Contract(
            JSON.parse(
              contracts[
                "contracts/ChainlinkPriceOracle.sol:ChainlinkPriceOracle"
              ].abi
            ),
            chainlinkPriceOracle
          );
          var chainlinkPriceFeed = await chainlinkPriceOracle.methods
            .priceFeeds(conf.underlying)
            .call();
        } catch {}
      }

      if (
        chainlinkPriceFeed === undefined ||
        Web3.utils.toBN(chainlinkPriceFeed).isZero()
      ) {
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
              JSON.parse(
                contracts[
                  "contracts/PreferredPriceOracle.sol:PreferredPriceOracle"
                ].abi
              ),
              priceOracle
            );

            try {
              var uniswapOrUniswapAnchoredView = await preferredPriceOracle.methods
                .secondaryOracle()
                .call();
            } catch {
              throw "Underlying token price not available via ChainlinkPriceOracle, and no UniswapAnchoredView or UniswapView was found.";
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

          if (conf.underlying == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
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
      // Get price oracle contract name from runtime bytecode hash
      var runtimeBytecodeHash = Web3.utils.sha3(
        await this.web3.eth.getCode(oracleAddress)
      );
      for (const model of [
        "PreferredPriceOracle",
        "ChainlinkPriceOracle",
        "UniswapView",
        "UniswapAnchoredView",
      ])
        if (
          runtimeBytecodeHash ==
          Fuse.PRICE_ORACLE_RUNTIME_BYTECODE_HASHES[model]
        )
          return model;
      return null;
    };
  }

  static Web3 = Web3;
  static BN = Web3.utils.BN;
}

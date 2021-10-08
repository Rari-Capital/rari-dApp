/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
    solidity: "0.7.3",
    networks: {
      hardhat: {
        forking: {
          url: "https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN"
        },
        blockGasLimit: 12500000,
        initialBaseFeePerGas: "0",
        allowUnlimitedContractSize: true,   
      }
    }
  };
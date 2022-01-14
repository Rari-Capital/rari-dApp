export enum ChainID {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    //
    ARBITRUM = 42161,
    ARBITRUM_TESTNET = 421611,
    //
    OPTIMISM = 10,
    //
    FANTOM = 250,
  }
  
  export const isSupportedChainId = (chainId: number) => {
    const isSupported = Object.values(ChainID).includes(chainId);
  //   console.log(Object.values(chainId), chainId, { isSupported });
    return isSupported;
  };
  
  export const coingeckoNetworkPath = {
    [ChainID.MAINNET]: "ethereum",
    [ChainID.ARBITRUM]: "arbitrum-one",
    [ChainID.ARBITRUM_TESTNET]: "arbitrum-one",
    [ChainID.OPTIMISM]: "optimistic-ethereum",
    [ChainID.FANTOM]: "fantom",
  };
  
  export const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;
  
  export const networkData: Record<string, any> = {
    [ChainID.MAINNET]: {
      name: "Ethereum (Mainnet)",
      shortName: "Mainnet",
      color: "#a557fe",
      enabled: true,
      rpc: `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`,
    },
    [ChainID.ARBITRUM]: {
      color: "#a557fe",
      name: "Arbitrum One",
      shortName: "Arbitrum",
      enabled: true,
      rpc: `https://arb-mainnet.g.alchemy.com/v2/rNfYbx5O5Ng09hw9s9YE-huxzVNaWWbX`,
    },
    [ChainID.ARBITRUM_TESTNET]: {
      color: "#a557fe",
      name: "Arbitrum One",
      shortName: "Arbitrum",
      enabled: true,
      rpc: `https://arb-rinkeby.g.alchemy.com/v2/PkZ7ilUhTBT6tHUsgToel62IOcuyKcwb`,
    },
    [ChainID.KOVAN]: {
      color: "#a557fe",
      name: "Ethereum (Kovan Testnet)",
      shortName: "Kovan",
      enabled: true,
      rpc: `https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
    },
  };
  
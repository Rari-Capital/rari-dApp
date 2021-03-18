import Fuse from "../fuse-sdk/src";

// export const infuraURL = `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`;
export const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_ID}`;

export function chooseBestWeb3Provider() {
  if (!window) {
    return alchemyURL;
  }

  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    return alchemyURL;
  }
}

export const initFuseWithProviders = (provider = chooseBestWeb3Provider()) => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  fuse.contracts.FusePoolLens.setProvider(alchemyURL);

  return fuse;
};

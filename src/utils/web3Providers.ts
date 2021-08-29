import Fuse from "lib/fuse-sdk/src";
import Web3 from "web3";

export const infuraURL = `https://mainnet.infura.io/v3/2e56500614ce4496bde29b22e65f1607`;
export const providerURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;

export const web3 = new Web3(chooseBestWeb3Provider());

export function chooseBestWeb3Provider() {
  const isClient = typeof window === "object";
  if (!isClient) {
    return providerURL;
  }

  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    return providerURL;
  }
}

export const initFuseWithProviders = (provider = chooseBestWeb3Provider()) => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  fuse.contracts.FusePoolLens.setProvider(providerURL);

  return fuse;
};

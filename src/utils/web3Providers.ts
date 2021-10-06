import Fuse from "../fuse-sdk/src";

export const alchemyURL =  `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;
export const testnetURL =  `http://localhost:8546`;

export function chooseBestWeb3Provider() {
  if (typeof window === "undefined") {
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
  fuse.contracts.FusePoolLens.setProvider(testnetURL);

  return fuse;
};

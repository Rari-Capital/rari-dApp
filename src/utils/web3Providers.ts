import Fuse from "../fuse-sdk/src";

export const infuraURL = `https://mainnet.infura.io/v3/834349d34934494f80797f2f551cb12e`;

export const dappAlchemyURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;
export const rssAlchemyURL =
  "https://eth-mainnet.alchemyapi.io/v2/gcb3mOaKjNWwjhW-6yjWLjGb1Or1faJk";

export function chooseBestWeb3Provider() {
  if (typeof window === "undefined") {
    return rssAlchemyURL;
  }

  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    return infuraURL;
  }
}

export const initFuseWithProviders = (provider = chooseBestWeb3Provider()) => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  fuse.contracts.FusePoolLens.setProvider(dappAlchemyURL);

  return fuse;
};

import Fuse from "lib/fuse-sdk/src"

export const infuraURL = `https://mainnet.infura.io/v3/2e56500614ce4496bde29b22e65f1607`;
export const turboGethURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;

export function chooseBestWeb3Provider() {
  const isClient = typeof window === "object";
  if (!isClient) {
    return turboGethURL;
  }

  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    return turboGethURL;
  }
}

export const initFuseWithProviders = (provider = chooseBestWeb3Provider()) => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  fuse.contracts.FusePoolLens.setProvider(turboGethURL);

  return fuse;
};

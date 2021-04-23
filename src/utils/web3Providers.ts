import Fuse from "../fuse-sdk/src";

// export const infuraURL = `https://mainnet.infura.io/v3/c52a3970da0a47978bee0fe7988b67b6`;
// export const turboGethURL = `https://turbogeth.crows.sh`;
// export const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;

export const infuraURL = `http://135.181.216.35:21917`;
export const turboGethURL = `http://135.181.216.35:21917`;
export const alchemyURL = `http://135.181.216.35:21917`;

export function chooseBestWeb3Provider() {
  if (typeof window === "undefined") {
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
  // fuse.contracts.FusePoolLens.setProvider(alchemyURL);

  return fuse;
};

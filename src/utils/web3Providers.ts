import Fuse from "../fuse-sdk/src";

export const turboGethURL = "http://135.181.216.35:21918/"

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
  // fuse.contracts.FusePoolLens.setProvider(turboGethURL);
  fuse.contracts.FusePoolLens.setProvider(turboGethURL);

  return fuse;
};

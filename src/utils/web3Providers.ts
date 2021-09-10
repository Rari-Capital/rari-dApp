import { Fuse } from "rari-sdk-sharad-v2";

import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

export const infuraURL = `https://mainnet.infura.io/v3/2e56500614ce4496bde29b22e65f1607`;
export const providerURL = `https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN`;

export function chooseBestWeb3Provider(): JsonRpcProvider | Web3Provider {
  const isClient = typeof window === "object";
  if (!isClient) {
    return new JsonRpcProvider(providerURL);
  }

  if (window.ethereum) {
    return new Web3Provider(window.ethereum);
  } else if (window.web3) {
    return new Web3Provider(window.web3.currentProvider);
  } else {
    return new JsonRpcProvider(providerURL);
  }
}

export const initFuseWithProviders = (
  provider = chooseBestWeb3Provider()
): Fuse => {
  const fuse = new Fuse(provider);

  // @ts-ignore We have to do this to avoid Infura ratelimits on our large calls.
  const turboProvider = new JsonRpcProvider(providerURL);

  fuse.contracts.FusePoolLens =
    fuse.contracts.FusePoolLens.connect(turboProvider);

  return fuse;
};

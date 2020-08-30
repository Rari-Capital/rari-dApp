import React, { useState, useCallback, useEffect } from "react";
import Web3 from "web3";
import FullPageSpinner from "../components/shared/FullPageSpinner";
import { queryCache } from "react-query";

async function launchModalLazy() {
  const [
    WalletConnectProvider,
    Portis,
    Authereum,
    Fortmatic,
    Torus,
    Web3Modal,
  ] = await Promise.all([
    import("@walletconnect/web3-provider"),
    import("@portis/web3"),
    import("authereum"),
    import("fortmatic"),
    import("@toruslabs/torus-embed"),
    import("web3modal"),
  ]);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        infuraId: process.env.REACT_APP_INFURA_ID,
      },
    },
    fortmatic: {
      package: Fortmatic.default,
      options: {
        key: process.env.REACT_APP_FORTMATIC_KEY,
      },
    },
    torus: {
      package: Torus.default,
      options: {},
    },
    portis: {
      package: Portis.default,
      options: {
        id: process.env.REACT_APP_PORTIS_ID,
      },
    },
    authereum: {
      package: Authereum.default,
      options: {},
    },
  };

  const web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    theme: {
      background: "#121212",
      main: "#FFFFFF",
      secondary: "#858585",
      border: "#272727",
      hover: "#000000",
    },
  });

  return web3Modal.connect();
}

export interface Web3ContextData {
  web3Network: Web3;
  web3Authed: Web3 | null;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: () => any;
  logout: () => any;
  address: string | null;
}

export const Web3Context = React.createContext<Web3ContextData | undefined>(
  undefined
);

export const Web3Provider = ({ children }: { children: JSX.Element }) => {
  const [web3Network] = useState<Web3>(
    () =>
      new Web3(
        `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
      )
  );

  const [web3Authed, setWeb3Authed] = useState<Web3 | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const setWeb3AuthedAndAddressFromModal = useCallback(
    (modalProvider) => {
      let authedProvider = new Web3(modalProvider);

      setWeb3Authed(authedProvider);

      authedProvider.eth
        .getAccounts()
        .then((addresses) => setAddress(addresses[0]));
    },
    [setWeb3Authed, setAddress]
  );

  const login = useCallback(async () => {
    const provider = await launchModalLazy();

    setWeb3ModalProvider(provider);

    setWeb3AuthedAndAddressFromModal(provider);
  }, [setWeb3ModalProvider, setWeb3AuthedAndAddressFromModal]);

  const refetchAccountData = useCallback(() => {
    console.log("New account, clearing the queryCache!");

    setWeb3AuthedAndAddressFromModal(web3ModalProvider);

    queryCache.clear();
  }, [setWeb3AuthedAndAddressFromModal, web3ModalProvider]);

  const logout = useCallback(() => {
    setWeb3ModalProvider((past: any) => {
      past?.off("accountsChanged", refetchAccountData);
      past?.off("chainChanged", refetchAccountData);

      return null;
    });

    setWeb3Authed(null);

    setAddress(null);
  }, [setWeb3Authed, setWeb3ModalProvider, refetchAccountData]);

  useEffect(() => {
    if (web3ModalProvider !== null) {
      web3ModalProvider.on("accountsChanged", refetchAccountData);
      web3ModalProvider.on("chainChanged", refetchAccountData);
    }

    return () => {
      web3ModalProvider?.off("accountsChanged", refetchAccountData);
      web3ModalProvider?.off("chainChanged", refetchAccountData);
    };
  }, [web3ModalProvider, refetchAccountData]);

  const value = {
    web3Network,
    web3Authed,
    web3ModalProvider,
    login,
    logout,
    address,
    isAuthed: web3Authed !== null,
  };

  // If the address is still loading in, don't render children who rely on it.
  if (value.isAuthed && address === null) {
    return <FullPageSpinner />;
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export function useWeb3() {
  const context = React.useContext(Web3Context);

  if (context === undefined) {
    throw new Error(`useWeb3Network must be used within a Web3NetworkProvider`);
  }

  return context;
}

export function useAuthedWeb3() {
  const { isAuthed, web3Authed, logout, address: addressOrNull } = useWeb3();

  if (!isAuthed) {
    throw new Error(`Used useAuthedWeb3 while not authenticated!`);
  }

  let web3 = web3Authed!;

  let address = addressOrNull!;

  return {
    web3,
    address,
    logout,
  };
}

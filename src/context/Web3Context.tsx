import React, { useState, useCallback, useMemo, useEffect } from "react";
import Web3 from "web3";
import FullPageSpinner from "../components/shared/FullPageSpinner";

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

  const login = useCallback(async () => {
    const provider = await launchModalLazy();

    setWeb3ModalProvider(provider);

    let authedProvider = new Web3(provider);

    setWeb3Authed(authedProvider);

    authedProvider.eth
      .getAccounts()
      .then((addresses) => setAddress(addresses[0]));
  }, [setWeb3Authed, setWeb3ModalProvider]);

  const logout = useCallback(() => {
    setWeb3ModalProvider(null);

    setWeb3Authed(null);

    setAddress(null);
  }, [setWeb3Authed, setWeb3ModalProvider]);

  useEffect(() => {
    if (web3ModalProvider != null) {
      let refetch = () => {
        let authedProvider = new Web3(web3ModalProvider);

        setWeb3Authed(authedProvider);

        authedProvider.eth
          .getAccounts()
          .then((addresses) => setAddress(addresses[0]));
      };

      web3ModalProvider.on("accountsChanged", () => {
        refetch();
      });

      web3ModalProvider.on("chainChanged", () => {
        refetch();
      });

      web3ModalProvider.on("networkChanged", () => {
        refetch();
      });
    }

    return () => {
      web3ModalProvider?.off("accountsChanged", () => {});
      web3ModalProvider?.off("chainChanged", () => {});
      web3ModalProvider?.off("networkChanged", () => {});
    };
  }, [web3ModalProvider]);

  let value = useMemo(
    () => ({
      web3Network,
      web3Authed,
      web3ModalProvider,
      login,
      logout,
      address,
      isAuthed: web3Authed != null,
    }),
    [web3Network, web3Authed, login, logout, address, web3ModalProvider]
  );

  // If the address is still loading in, don't render children who rely on it.
  if (value.isAuthed && address == null) {
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

export interface Web3AuthedContextData {
  web3: Web3;
  address: string;
}

export function useAuthedWeb3() {
  const { isAuthed, web3Authed, logout, address: addressOrNull } = useWeb3();

  let web3 = web3Authed!;

  let address = addressOrNull!;

  const value = {
    web3,
    address,
    logout,
  };

  if (isAuthed) {
    return value;
  } else {
    throw new Error(`Used useAuthedWeb3 while not authenticated!`);
  }
}

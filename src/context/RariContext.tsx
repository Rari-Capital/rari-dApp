import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import Web3 from "web3";
import FullPageSpinner from "../components/shared/FullPageSpinner";
import { useQueryCache } from "react-query";
import { useTranslation } from "react-i18next";
import { DASHBOARD_BOX_PROPS } from "../components/shared/DashboardBox";

const Rari = require("../rari-sdk/index.js");

async function launchModalLazy(t: (text: string, extra?: any) => string) {
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
    injected: {
      display: {
        description: t("Connect with a browser extension"),
      },
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        infuraId: process.env.REACT_APP_INFURA_ID,
      },
      display: {
        description: t("Scan with a wallet to connect"),
      },
    },
    fortmatic: {
      package: Fortmatic.default,
      options: {
        key: process.env.REACT_APP_FORTMATIC_KEY,
      },
      display: {
        description: t("Connect with your {{provider}} account", {
          provider: "Fortmatic",
        }),
      },
    },
    torus: {
      package: Torus.default,
      display: {
        description: t("Connect with your {{provider}} account", {
          provider: "Torus",
        }),
      },
    },
    portis: {
      package: Portis.default,
      options: {
        id: process.env.REACT_APP_PORTIS_ID,
      },
      display: {
        description: t("Connect with your {{provider}} account", {
          provider: "Portis",
        }),
      },
    },
    authereum: {
      package: Authereum.default,
      display: {
        description: t("Connect with your {{provider}} account", {
          provider: "Authereum",
        }),
      },
    },
  };

  const web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    theme: {
      background: DASHBOARD_BOX_PROPS.backgroundColor,
      main: "#FFFFFF",
      secondary: "#858585",
      border: DASHBOARD_BOX_PROPS.borderColor,
      hover: "#000000",
    },
  });

  return web3Modal.connect();
}

export interface RariContextData {
  rari: any;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: () => Promise<any>;
  logout: () => any;
  address: string;
}

export const EmptyAddress = "0x0000000000000000000000000000000000000000";

export const RariContext = React.createContext<RariContextData | undefined>(
  undefined
);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();

  //`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`

  const [rari, setRari] = useState<any | null>(null);
  const [address, setAddress] = useState<string>(EmptyAddress);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const queryCache = useQueryCache();

  const setRariAndAddressFromModal = useCallback(
    (modalProvider) => {
      let authedProvider = new Web3(modalProvider);

      setRari(new Rari(authedProvider));

      authedProvider.eth
        .getAccounts()
        .then((addresses) => setAddress(addresses[0]));
    },
    [setRari, setAddress]
  );

  const login = useCallback(async () => {
    const provider = await launchModalLazy(t);

    setWeb3ModalProvider(provider);

    setRariAndAddressFromModal(provider);
  }, [setWeb3ModalProvider, setRariAndAddressFromModal, t]);

  const refetchAccountData = useCallback(() => {
    console.log("New account, clearing the queryCache!");

    setRariAndAddressFromModal(web3ModalProvider);

    queryCache.clear();
  }, [setRariAndAddressFromModal, web3ModalProvider, queryCache]);

  const logout = useCallback(() => {
    setWeb3ModalProvider((past: any) => {
      if (past?.off) {
        past.off("accountsChanged", refetchAccountData);
        past.off("chainChanged", refetchAccountData);
      }

      return null;
    });

    setAddress(EmptyAddress);
  }, [setWeb3ModalProvider, refetchAccountData]);

  useEffect(() => {
    if (web3ModalProvider !== null && web3ModalProvider.on) {
      web3ModalProvider.on("accountsChanged", refetchAccountData);
      web3ModalProvider.on("chainChanged", refetchAccountData);
    }

    return () => {
      if (web3ModalProvider?.off) {
        web3ModalProvider.off("accountsChanged", refetchAccountData);
        web3ModalProvider.off("chainChanged", refetchAccountData);
      }
    };
  }, [web3ModalProvider, refetchAccountData]);

  const value = useMemo(
    () => ({
      web3ModalProvider,
      rari,
      isAuthed: address !== EmptyAddress,
      login,
      logout,
      address,
    }),
    [rari, web3ModalProvider, login, logout, address]
  );

  // If the address is still loading in, don't render children who rely on it.
  if (value.isAuthed && address === EmptyAddress) {
    return <FullPageSpinner />;
  }

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

export function useRari() {
  const context = React.useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}

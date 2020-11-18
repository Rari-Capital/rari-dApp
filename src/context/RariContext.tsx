import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

import { useQueryCache } from "react-query";
import { useTranslation } from "react-i18next";
import { DASHBOARD_BOX_PROPS } from "../components/shared/DashboardBox";

import Rari from "../rari-sdk/index";

import { useToast } from "@chakra-ui/react";

import Honeybadger from "honeybadger-js";

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
  rari: Rari;
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

  const [rari, setRari] = useState<Rari>(() => {
    if (window.ethereum) {
      console.log("Using window.ethereum!");
      return new Rari(window.ethereum);
    } else if (window.web3) {
      console.log("Using window.web3!");
      return new Rari(window.web3.currentProvider);
    } else {
      console.log("Using infura!");
      return new Rari(
        `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
      );
    }
  });

  const toast = useToast();

  // Check the user's network:
  useEffect(() => {
    Promise.all([rari.web3.eth.net.getId(), rari.web3.eth.getChainId()]).then(
      ([netId, chainId]) => {
        console.log("Network ID: " + netId, "Chain ID: " + chainId);
        if (netId !== 1 || chainId !== 1) {
          setTimeout(() => {
            toast({
              title: "Wrong network!",
              description:
                "You are on the wrong network! Switch to the mainnet and reload this page!",
              status: "warning",
              position: "top-right",
              duration: 300000,
              isClosable: true,
            });
          }, 1500);
        }
      }
    );
  }, [rari, toast]);

  const [address, setAddress] = useState<string>(EmptyAddress);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const queryCache = useQueryCache();

  const setRariAndAddressFromModal = useCallback(
    (modalProvider) => {
      const rariInstance = new Rari(modalProvider);

      setRari(rariInstance);

      rariInstance.web3.eth.getAccounts().then((addresses) => {
        console.log("Address array: ", addresses);
        if (addresses.length === 0) {
          console.log("Address array was empty. Reloading!");
          window.location.reload();
        }

        const address = addresses[0];

        setAddress(address);
      });
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

  useEffect(() => {
    if (address !== EmptyAddress) {
      console.log("Setting Honeybadger user to new address: " + address);
      Honeybadger.setContext({
        user_id: address,
      });
    } else {
      Honeybadger.resetContext();
    }
  }, [address]);

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

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

export function useRari() {
  const context = React.useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { DASHBOARD_BOX_PROPS } from "../components/shared/DashboardBox";

import Rari from "../rari-sdk/index";

import LogRocket from "logrocket";
import { useToast } from "@chakra-ui/react";
import Fuse from "../fuse-sdk/src";
import {
  chooseBestWeb3Provider,
  infuraURL,
  initFuseWithProviders,
} from "../utils/web3Providers";
import { useIsMobile } from "buttered-chakra";
import { useLocation } from "react-router-dom";

async function launchModalLazy(
  t: (text: string, extra?: any) => string,
  cacheProvider: boolean = true
) {
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
        infuraId: infuraURL.replace("https://mainnet.infura.io/v3/", ""),
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

  if (!cacheProvider) {
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  }

  const web3Modal = new Web3Modal.default({
    cacheProvider,
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
  fuse: Fuse;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: (cacheProvider?: boolean) => Promise<any>;
  logout: () => any;
  address: string;
}

export const EmptyAddress = "0x0000000000000000000000000000000000000000";

export const RariContext = React.createContext<RariContextData | undefined>(
  undefined
);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();

  const location = useLocation();

  const [rari, setRari] = useState<Rari>(
    () => new Rari(chooseBestWeb3Provider())
  );
  const [fuse, setFuse] = useState<Fuse>(() => initFuseWithProviders());

  const toast = useToast();

  // Check the user's network:
  useEffect(() => {
    Promise.all([rari.web3.eth.net.getId(), rari.web3.eth.getChainId()]).then(
      ([netId, chainId]) => {
        console.log("Network ID: " + netId, "Chain ID: " + chainId);

        if (process.env.NODE_ENV === "development") {
          return;
        }

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

  const queryClient = useQueryClient();

  const setRariAndAddressFromModal = useCallback(
    (modalProvider) => {
      const rariInstance = new Rari(modalProvider);
      const fuseInstance = initFuseWithProviders(modalProvider);

      setRari(rariInstance);
      setFuse(fuseInstance);

      rariInstance.web3.eth.getAccounts().then((addresses) => {
        if (addresses.length === 0) {
          console.log("Address array was empty. Reloading!");
          window.location.reload();
        }

        const address = addresses[0];
        const requestedAddress = new URLSearchParams(location.search).get(
          "address"
        );

        console.log("Setting Logrocket user to new address: " + address);
        LogRocket.identify(address);

        console.log("Requested address: ", requestedAddress);
        setAddress(requestedAddress ?? address);
      });
    },
    [setRari, setAddress, location.search]
  );

  const login = useCallback(
    async (cacheProvider: boolean = true) => {
      const provider = await launchModalLazy(t, cacheProvider);

      setWeb3ModalProvider(provider);

      setRariAndAddressFromModal(provider);
    },
    [setWeb3ModalProvider, setRariAndAddressFromModal, t]
  );

  const refetchAccountData = useCallback(() => {
    console.log("New account, clearing the queryClient!");

    setRariAndAddressFromModal(web3ModalProvider);

    queryClient.clear();
  }, [setRariAndAddressFromModal, web3ModalProvider, queryClient]);

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

  // Automatically open the web3modal if not on mobile (or just login if they have already used the site)
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isMobile) {
      login();
    }
  }, [login, isMobile]);

  const value = useMemo(
    () => ({
      web3ModalProvider,
      rari,
      fuse,
      isAuthed: address !== EmptyAddress,
      login,
      logout,
      address,
    }),
    [rari, web3ModalProvider, login, logout, address, fuse]
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

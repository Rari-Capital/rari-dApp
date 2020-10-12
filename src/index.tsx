/* istanbul ignore file */
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

import * as serviceWorker from "./serviceWorker";

import "./index.css";

// Remove this ignore when TypeScript PR gets merged.
// @ts-ignore
import PWAPrompt from "react-ios-pwa-prompt";

import { ThemeProvider, CSSReset, theme } from "@chakra-ui/core";

import ErrorPage from "./components/pages/ErrorPage";
import { ErrorBoundary } from "react-error-boundary";
import { Web3Provider } from "./context/Web3Context";
import { ContractsProvider } from "./context/ContractsContext";

import "focus-visible";

import { ReactQueryDevtools } from "react-query-devtools";

import "./utils/i18n.ts";
import { BrowserRouter, useLocation } from "react-router-dom";

const customTheme = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: `'Avenir Next', ${theme.fonts.body}`,
    heading: `'Avenir Next', ${theme.fonts.heading}`,
  },
};

// Scrolls to the top of the new page when we switch pages
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

ReactDOM.render(
  <>
    <ReactQueryDevtools initialIsOpen={false} />
    <PWAPrompt
      timesToShow={2}
      permanentlyHideOnDismiss={false}
      copyTitle="Add this site to your home screen!"
      copyBody="The Rari Portal works best when added to your homescreen. Without doing this, you may have a degraded experience."
      copyClosePrompt="Close"
    />
    <ThemeProvider theme={customTheme}>
      <CSSReset />

      <ErrorBoundary FallbackComponent={ErrorPage}>
        <Web3Provider>
          <ContractsProvider>
            <BrowserRouter>
              <ScrollToTop />
              <App />
            </BrowserRouter>
          </ContractsProvider>
        </Web3Provider>
      </ErrorBoundary>
    </ThemeProvider>
  </>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change

/* istanbul ignore file */
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

import "./index.css";

// Remove this ignore when TypeScript PR gets merged.
// @ts-ignore
import PWAPrompt from "react-ios-pwa-prompt";

import { ThemeProvider, CSSReset, theme } from "@chakra-ui/core";

import ErrorPage from "./components/pages/ErrorPage";

import { RariProvider } from "./context/RariContext";

import "focus-visible";

import { ReactQueryDevtools } from "react-query-devtools";

import "./utils/i18n.ts";
import { BrowserRouter, useLocation } from "react-router-dom";

import Honeybadger from "honeybadger-js";
import ErrorBoundary from "@honeybadger-io/react";

import { version } from "../package.json";
export { version };

Honeybadger.configure({
  apiKey: "d90cb361",
  environment: process.env.NODE_ENV,
  revision: version,
  ignorePatterns: [
    /transaction signature/i,
    /Unexpected token/i,
    /expected expression/i,
  ],
});

console.log("Version " + version);

const customTheme = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: `'Avenir Next', ${theme.fonts.body}`,
    heading: `'Avenir Next', ${theme.fonts.heading}`,
  },
};

// Scrolls to the top of the new page when we switch pages
function ScrollToTop() {
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
      copyTitle="Add Rari to your homescreen!"
      copyBody="The Rari Portal works best when added to your homescreen. Without doing this, you may have a degraded experience."
      copyClosePrompt="Close"
    />
    <ThemeProvider theme={customTheme}>
      <CSSReset />

      <ErrorBoundary honeybadger={Honeybadger} ErrorComponent={ErrorPage}>
        <RariProvider>
          <BrowserRouter>
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </RariProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </>,
  document.getElementById("root")
);

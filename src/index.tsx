/* istanbul ignore file */
import { useEffect } from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

import "./index.css";

// Remove this ignore when TypeScript PR gets merged.
// @ts-ignore
import PWAPrompt from "react-ios-pwa-prompt";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { ChakraProvider, theme } from "@chakra-ui/react";

import ErrorPage from "./components/pages/ErrorPage";

import { RariProvider } from "./context/RariContext";

import "focus-visible";

import "./utils/i18n.ts";
import { BrowserRouter, useLocation } from "react-router-dom";

import LogRocket from "logrocket";

import { ErrorBoundary } from "react-error-boundary";

import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { createLocalStoragePersistor } from "react-query/createLocalStoragePersistor-experimental";

import { version } from "../package.json";
export { version };

if (process.env.NODE_ENV === "production") {
  console.log("Connecting to LogRocket...");
  LogRocket.init("eczu2e/rari-capital", {
    console: {
      shouldAggregateConsoleErrors: true,
    },
    release: version,
  });
}

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const localStoragePersistor = createLocalStoragePersistor();

persistQueryClient({
  queryClient,
  persistor: localStoragePersistor,
});

ReactDOM.render(
  <>
    <PWAPrompt
      timesToShow={2}
      permanentlyHideOnDismiss={false}
      copyTitle="Add Rari to your homescreen!"
      copyBody="The Rari Portal works best when added to your homescreen. Without doing this, you may have a degraded experience."
      copyClosePrompt="Close"
    />
    <ChakraProvider theme={customTheme}>
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <BrowserRouter>
            <RariProvider>
              <ScrollToTop />
              <App />
            </RariProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </>,
  document.getElementById("root")
);

import { useEffect } from 'react'

// Next
import { AppProps } from "next/app";
import dynamic from "next/dynamic";

// Providers
import { ChakraProvider, theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { appWithTranslation } from 'next-i18next'

// Providers
import { RariProvider } from "context/RariContext";
import Layout from "components/shared/Layout/Layout";

// Styles
import "../index.css";

// Components
const AuthMiddleware = dynamic(() => import("components/Auth"), {
  ssr: false,
});

// Utils
// import LogRocket from "logrocket";

// // Version
// import { version } from "../../package.json";

// if (process.env.NODE_ENV === "production") {
//   console.log("Connecting to LogRocket...");
//   LogRocket.init("eczu2e/rari-capital", {
//     console: {
//       shouldAggregateConsoleErrors: true,
//     },
//     release: version,
//   });
// }

// console.log("Version " + version);

const customTheme = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: `'Avenir Next', ${theme.fonts.body}`,
    heading: `'Avenir Next', ${theme.fonts.heading}`,
  },
};

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    console.log("render")
  }, [])

  return (
    <ChakraProvider theme={customTheme}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <RariProvider>
          <Layout>
            <AuthMiddleware />
            <Component {...pageProps} />
          </Layout>
        </RariProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp)


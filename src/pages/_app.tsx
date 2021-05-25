import { useEffect } from 'react'

// Next
import { AppProps } from "next/app";
import dynamic from "next/dynamic";

// Providers
import { ChakraProvider, theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

// Providers
import { RariProvider } from "context/RariContext";
import Layout from "components/shared/Layout/Layout";

// Styles
import "../index.css";

// Components
const AuthMiddleware = dynamic(() => import("components/Auth"), {
  ssr: false,
});

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

export default MyApp;

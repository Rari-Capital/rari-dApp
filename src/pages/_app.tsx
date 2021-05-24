// Next
import { AppProps } from "next/app";
import dynamic from "next/dynamic";

// Providers
import { ChakraProvider, theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

// Providers
import { RariProvider } from "context/RariContext";

// Styles
// import "../index.css";

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
  return (
    <ChakraProvider theme={customTheme}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <RariProvider>
          <AuthMiddleware />
          <Component {...pageProps} />
        </RariProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;

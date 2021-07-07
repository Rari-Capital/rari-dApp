// Components
import { Alert, AlertIcon, Link } from "@chakra-ui/react";
import { Column } from "utils/chakraUtils";
import InterestRatesView from "./InterestRatesView";
import { Header } from "components/shared/Header";
import Footer from "components/shared/Footer";
// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useRari } from "context/RariContext";

export default function InterestRates() {
  const isMobile = useIsSmallScreen();

  const { isAuthed } = useRari();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      width={isMobile ? "100%" : "1000px"}
      height="100%"
      px={isMobile ? 4 : 0}
    >
      <Header isAuthed={isAuthed} />
      <Alert colorScheme="green" borderRadius={5} mt="5">
        <AlertIcon />
        <span style={{ color: "#2F855A" }}>
          This page is currently in beta. If you notice any issues, please{" "}
          <Link
            isExternal={true}
            href="https://discord.gg/3uWWeQGq"
            textDecoration="underline"
          >
            let us know!
          </Link>
        </span>
      </Alert>
      <InterestRatesView />
      <Footer />
    </Column>
  );
}

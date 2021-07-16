// Components
import { Alert, Link, AlertIcon } from "@chakra-ui/react";
import { Column } from "utils/chakraUtils";
import InterestRatesView from "./InterestRatesView";
import { Header } from "components/shared/Header";
import Footer from "components/shared/Footer";
// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useRari } from "context/RariContext";
import { useTranslation } from "react-i18next";

export default function InterestRates() {
  const isMobile = useIsSmallScreen();

  const { isAuthed } = useRari();

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      width="100%"
      height="100%"
      px={4}
    >
      <Header isAuthed={isAuthed} />
      <Alert colorScheme="green" borderRadius={5} mt="5">
        <AlertIcon />
        <span style={{ color: "#2F855A" }}>
          {t(
            "This page is currently in beta. If you notice any issues, please"
          )}{" "}
          <Link
            isExternal={true}
            href="https://discord.gg/3uWWeQGq"
            textDecoration="underline"
          >
            {t("let us know!")}
          </Link>
        </span>
      </Alert>
      {isMobile ? (
        <Alert colorScheme="orange" borderRadius={5} mt={5}>
          <AlertIcon />
          <span style={{ color: "#C05621" }}>
            {t(
              "This page is not optimized for use on smaller screens. Sorry for the inconvenience!"
            )}
          </span>
        </Alert>
      ) : null}
      <InterestRatesView />
      <Footer />
    </Column>
  );
}

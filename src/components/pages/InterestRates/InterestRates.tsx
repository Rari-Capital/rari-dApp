// Components
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
      <InterestRatesView />
      <Footer />
    </Column>
  );
}

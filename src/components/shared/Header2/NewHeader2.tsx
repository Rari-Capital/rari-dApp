import { PixelSize, Row } from "lib/chakraUtils";

//  Components
import { DASHBOARD_BOX_SPACING } from "../DashboardBox";
import { AccountButton } from "../AccountButton";

import { SmallLogo } from "components/shared/Logos";
import { useRari } from "context/RariContext";
import { useTranslation } from "next-i18next";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { DropDownLink, HeaderLink, MenuItemType } from "./HeaderLink";
import HeaderSearchbar from "./HeaderSearchbar";
import AppLink from "../AppLink";
import {
  GOVERNANCE_DROPDOWN_ITEMS,
  PRODUCTS_DROPDOWN_ITEMS,
  UTILS_DROPDOWN_ITEMS,
} from "constants/nav";
import { Button } from "@chakra-ui/react";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const NewHeader = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  // const [expanded, setExpanded] = useState(false);

  return (
    <Row
      color="#FFFFFF"
      px={4}
      height="38px"
      my={4}
      mainAxisAlignment="space-around"
      crossAxisAlignment="center"
      overflowX="visible"
      overflowY="visible"
      width="100%"
      zIndex={3}
      mb={5}
      // bg="pink"
    >
      <AppLink href="/">
        <SmallLogo />
      </AppLink>

      <Row
        mx={4}
        expand
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        overflowX="auto"
        overflowY="hidden"
        // transform="translate(0px, 7px)"
        height="100%"
      >
        {/* <HeaderLink name={t("Home")} route="/" /> */}

        {/* Dropdown  */}
        <DropDownLink
          name={t("Products")}
          ml={2}
          links={PRODUCTS_DROPDOWN_ITEMS}
        />
        <DropDownLink
          name={t("Governance")}
          links={GOVERNANCE_DROPDOWN_ITEMS}
        />
        <DropDownLink name={t("Utils")} ml={2} links={UTILS_DROPDOWN_ITEMS} />

        <HeaderLink name={t("Explore")} route="/explore" ml={5} />

      </Row>

      {!isMobile && <HeaderSearchbar />}
      <AccountButton />
    </Row>
  );
};

export default NewHeader;

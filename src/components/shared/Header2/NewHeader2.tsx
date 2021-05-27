import { useState } from "react";

import { PixelSize, Row } from "utils/chakraUtils";

//  Components
import { DASHBOARD_BOX_SPACING } from "../DashboardBox";
import { Heading } from "@chakra-ui/layout";
import { AccountButton } from "../AccountButton";

import { SmallLogo } from "components/shared/Logos";
import { useRari } from "context/RariContext";
import { useTranslation } from "react-i18next";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { HeaderLink } from "./HeaderLink";
import HeaderSearchbar from "./HeaderSearchbar";
import AppLink from "../AppLink";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const NewHeader = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  // const isMobile = useIsSmallScreen();

  const [expanded, setExpanded] = useState(false);

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
        <HeaderLink name={t("Overview")} route="/overview" />
        <HeaderLink name={t("Pools")} route="/" ml={5} />
        <HeaderLink name={t("Fuse")} route="/" ml={5} />
        <HeaderLink name={t("Pool2")} route="/" ml={5} />
        <HeaderLink name={t("Tranches")} route="/" ml={5} />
        {isAuthed && <HeaderLink ml={5} name={t("Positions")} route="/" />}
      </Row>

      <HeaderSearchbar />
      <AccountButton />
    </Row>
  );
};

export default NewHeader;

import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from "@chakra-ui/react";

import { PixelSize, Row } from "utils/chakraUtils";

//  Components
import { AccountButton } from "../AccountButton";
import { DASHBOARD_BOX_PROPS, DASHBOARD_BOX_SPACING } from "../DashboardBox";
import { AnimatedSmallLogo } from "../Logos";

import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { HeaderLink } from "./HeaderLink";
import HeaderSearchbar from "./HeaderSearchbar";

import { useIsSmallScreen } from "hooks/useIsSmallScreen";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const NewHeader = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

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
      <AnimatedSmallLogo />

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
        <HeaderLink name={t("Overview")} route="/" />

        <PoolsLink ml={5} />

        <HeaderLink ml={5} name={t("Fuse")} route="/fuse" />

        <HeaderLink ml={5} name={t("Pool2")} route="/pool2" />

        <HeaderLink ml={5} name={t("Tranches")} route="/tranches" />

        {/* <HeaderLink ml={5} name={t("Vote")} route="https://vote.rari.capital" /> */}

        <GovernanceLink ml={5} />

        {isAuthed && (
          <HeaderLink ml={5} name={t("Positions")} route="/positions" />
        )}
      </Row>

      {!isMobile && <HeaderSearchbar />}

      <AccountButton />
    </Row>
  );
};

export const PoolsLink = ({ ml }: { ml?: number | string }) => {
  const { t } = useTranslation();
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text="Pools" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <SubMenuItem name={t("Stable Pool")} link="/pools/stable" />
            <SubMenuItem name={t("Yield Pool")} link="/pools/yield" />
            <SubMenuItem name={t("ETH Pool")} link="/pools/eth" />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const GovernanceLink = ({ ml }: { ml?: number | string }) => {
  const { t } = useTranslation();
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text="Governance" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <SubMenuItem
              name={t("Snapshot")}
              link="https://vote.rari.capital/"
            />
            <SubMenuItem
              name={t("Forums")}
              link="https://forums.rari.capital/"
            />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const SubMenuText = ({ text }: { text: string }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isOnThisRoute = location.pathname.includes("pools");

  return (
    <Text
      fontWeight={isOnThisRoute ? "bold" : "normal"}
      _hover={{ textDecoration: "underline" }}
    >
      {t(text)}
    </Text>
  );
};

export const SubMenuItem = ({ name, link }: { name: string; link: string }) => {
  return (
    <MenuItem _focus={{ bg: "#2b2a2a" }} _hover={{ bg: "#2b2a2a" }}>
      <Box mx="auto">
        <HeaderLink noUnderline name={name} route={link} />
      </Box>
    </MenuItem>
  );
};

export default NewHeader;

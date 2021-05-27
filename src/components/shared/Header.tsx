import {
  Box,
  Link,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from "@chakra-ui/react";
import { PixelSize, Row } from "utils/buttered-chakra";

import { AccountButton } from "./AccountButton";
import { DASHBOARD_BOX_PROPS, DASHBOARD_BOX_SPACING } from "./DashboardBox";
import {
  AnimatedFuseSmallLogo,
  AnimatedPoolLogo,
  AnimatedSmallLogo,
  FuseSmallLogo,
  PoolLogo,
} from "./Logos";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const Header = ({
  isAuthed,
  isPool,
  isFuse,
  padding,
}: {
  isAuthed: boolean;
  isFuse?: boolean;
  isPool?: boolean;
  padding?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Row
      color="#FFFFFF"
      px={padding ? 4 : 0}
      height="38px"
      my={4}
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      overflowX="visible"
      overflowY="visible"
      width="100%"
    >
      {isAuthed ? (
        isPool ? (
          <AnimatedPoolLogo />
        ) : isFuse ? (
          <AnimatedFuseSmallLogo />
        ) : (
          <AnimatedSmallLogo />
        )
      ) : isPool ? (
        <PoolLogo />
      ) : isFuse ? (
        <FuseSmallLogo />
      ) : (
        <AnimatedSmallLogo />
      )}

      <Row
        mx={4}
        expand
        mainAxisAlignment={{ md: "space-around", base: "space-between" }}
        crossAxisAlignment="flex-start"
        overflowX="auto"
        overflowY="hidden"
        transform="translate(0px, 7px)"
      >
        <HeaderLink name={t("Overview")} route="/" />

        <PoolsLink ml={4} />

        <HeaderLink ml={4} name={t("Fuse")} route="/fuse" />

        <HeaderLink ml={4} name={t("Pool2")} route="/pool2" />

        <HeaderLink ml={4} name={t("Tranches")} route="/tranches" />

        {/* <HeaderLink ml={4} name={t("Vote")} route="https://vote.rari.capital" /> */}

        <GovernanceLink ml={4} />

        {isAuthed && (
          <HeaderLink ml={4} name={t("Positions")} route="/positions" />
        )}
      </Row>

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

export const HeaderLink = ({
  name,
  route,
  ml,
  noUnderline,
}: {
  name: string;
  route: string;
  noUnderline?: boolean;
  ml?: number | string;
}) => {
  const location = useLocation();

  const isExternal = route.startsWith("http");

  const isOnThisRoute =
    location.pathname === route ||
    location.pathname.replace(/\/+$/, "") === route;

  return isExternal ? (
    <Link
      href={route}
      isExternal
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className={noUnderline ? "no-underline" : ""}
    >
      <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
    </Link>
  ) : (
    <Link
      /* @ts-ignore */
      as={RouterLink}
      to={route}
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className={noUnderline ? "no-underline" : ""}
    >
      <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
    </Link>
  );
};

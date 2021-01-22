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
import { PixelSize, Row } from "buttered-chakra";
import React from "react";
import { AccountButton } from "./AccountButton";
import { DASHBOARD_BOX_PROPS, DASHBOARD_BOX_SPACING } from "./DashboardBox";
import {
  AnimatedFuseSmallLogo,
  AnimatedPoolLogo,
  AnimatedSmallLogo,
  FuseSmallLogo,
  PoolLogo,
  SmallLogo,
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
  lessLinks,
  padding,
}: {
  isAuthed: boolean;
  isFuse?: boolean;
  isPool?: boolean;
  lessLinks?: boolean;
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

        <HeaderLink ml={4} name={t("Tranches")} route="/tranches" />

        {lessLinks ? null : (
          <HeaderLink
            ml={4}
            name={t("Governance")}
            route="https://vote.rari.capital"
          />
        )}

        <HeaderLink
          ml={4}
          name={t("Audit")}
          route="https://www.notion.so/Rari-Capital-Audit-Quantstamp-December-2020-24a1d1df94894d6881ee190686f47bc7"
        />
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
          <PoolText />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <PoolMenuItem name={t("Stable Pool")} linkSuffix="stable" />
            <PoolMenuItem name={t("Yield Pool")} linkSuffix="yield" />
            <PoolMenuItem name={t("ETH Pool")} linkSuffix="eth" />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const PoolText = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isOnThisRoute = location.pathname.includes("pools");

  return (
    <Text fontWeight={isOnThisRoute ? "normal" : "bold"}>{t("Pools")}</Text>
  );
};

export const PoolMenuItem = ({
  name,
  linkSuffix,
}: {
  name: string;
  linkSuffix: string;
}) => {
  return (
    <MenuItem _focus={{ bg: "#2b2a2a" }} _hover={{ bg: "#2b2a2a" }}>
      <Box mx="auto">
        <HeaderLink noUnderline name={name} route={"/pools/" + linkSuffix} />
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
      <Text fontWeight={isOnThisRoute ? "normal" : "bold"}>{name}</Text>
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
      <Text fontWeight={isOnThisRoute ? "normal" : "bold"}>{name}</Text>
    </Link>
  );
};

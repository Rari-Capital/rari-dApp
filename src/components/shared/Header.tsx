import { MouseEventHandler } from "react";

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
import { PixelSize, Row } from "utils/chakraUtils";

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

        <HeaderLink ml={4} name={t("Fuse")} route="/fuse" />

        <PoolsLink ml={3} />

        <HeaderLink ml={4} name={t("Pool2")} route="/pool2" />

        <HeaderLink ml={4} name={t("Tranches")} route="/tranches" />

        <Box ml={4}>
          <Menu autoSelect={false} placement="bottom">
            <MenuButton>
              <SubMenuText text={t("Governance")} />
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

        <UtilsLink ml={4} isAuthed={isAuthed} />
      </Row>

      <AccountButton />
    </Row>
  );
};

export const UtilsLink = ({
  isAuthed,
  ml,
}: {
  isAuthed: boolean;
  ml?: number | string;
}) => {
  const { t } = useTranslation();

  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text={t("Utilities")} parentLink="/utils" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            {isAuthed && (
              <SubMenuItem name={t("Positions")} link="/utils/positions" />
            )}

            <SubMenuItem
              name={t("Metrics")}
              link="https://metrics.rari.capital"
            />

            <SubMenuItem
              name={t("Fuse Liquidations")}
              link="/fuse/liquidations"
            />

            <SubMenuItem
              name={t("Interest Rates")}
              link="/utils/interest-rates"
            />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const PoolsLink = ({ ml }: { ml?: number | string }) => {
  const { t } = useTranslation();
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text={t("Pools")} parentLink="/pools" />
        </MenuButton>

        <Portal>
          <MenuList {...DASHBOARD_BOX_PROPS} color="#FFF" minWidth="110px">
            <SubMenuItem name={t("USDC Pool")} link="/pools/usdc" />
            <SubMenuItem name={t("DAI Pool")} link="/pools/dai" />
            <SubMenuItem name={t("Yield Pool")} link="/pools/yield" />
            <SubMenuItem name={t("ETH Pool")} link="/pools/eth" />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const SubMenuText = ({
  text,
  parentLink,
}: {
  text: string;
  parentLink?: string;
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isOnThisRoute = parentLink
    ? location.pathname.includes(parentLink)
    : false;

  return <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{t(text)}</Text>;
};

export const SubMenuItem = ({ name, link }: { name: string; link: string }) => {
  return (
    <MenuItem _focus={{ bg: "#2b2a2a" }} _hover={{ bg: "#2b2a2a" }}>
      <Box mx="auto">
        <HeaderLink name={name} route={link} />
      </Box>
    </MenuItem>
  );
};

export const HeaderLink = ({
  name,
  route,
  ml,
  onMouseOver,
  onMouseOut,
}: {
  name: string;
  route: string;

  ml?: number | string;
  onMouseOver?: MouseEventHandler<HTMLAnchorElement>;
  onMouseOut?: MouseEventHandler<HTMLAnchorElement>;
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
      className="no-underline"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
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
      className="no-underline"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Text fontWeight={isOnThisRoute ? "bold" : "normal"}>{name}</Text>
    </Link>
  );
};

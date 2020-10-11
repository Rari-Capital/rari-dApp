import { Link, Text } from "@chakra-ui/core";
import { PixelSize, Row } from "buttered-chakra";
import React from "react";
import { AccountButton } from "./AccountButton";
import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import { AnimatedSmallLogo, SmallLogo } from "./Logos";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const Header = React.memo(
  ({ isAuthed, padding }: { isAuthed: boolean; padding?: boolean }) => {
    const { t } = useTranslation();

    return (
      <Row
        px={padding ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        height="38px"
        my={DASHBOARD_BOX_SPACING.asPxString()}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        overflowX="visible"
        overflowY="visible"
        width="100%"
      >
        {isAuthed ? <AnimatedSmallLogo /> : <SmallLogo />}

        <Row
          mx={4}
          expand
          mainAxisAlignment={{ md: "space-around", xs: "space-between" }}
          crossAxisAlignment="flex-start"
          overflowX="auto"
          overflowY="hidden"
          transform="translate(0px, 7px)"
        >
          <HeaderLink mr={4} name={t("Pools")} route="/" />
          <HeaderLink mr={4} name={t("Stable Pool")} route="/pools/stable" />
          <HeaderLink mr={4} name={t("Yield Pool")} route="/pools/yield" />
          <HeaderLink mr={4} name={t("ETH Pool")} route="/pools/eth" />
        </Row>

        <AccountButton />
      </Row>
    );
  }
);

export const HeaderLink = React.memo(
  ({
    name,
    route,
    mr,
  }: {
    name: string;
    route: string;
    mr?: number | string;
  }) => {
    const location = useLocation();

    return (
      <Link
        /* @ts-ignore */
        as={RouterLink}
        to={route}
        mr={mr ?? 0}
        whiteSpace="nowrap"
      >
        <Text
          as={
            location.pathname === route ||
            location.pathname.replace(/\/+$/, "") === route
              ? "u"
              : "p"
          }
          fontWeight="bold"
        >
          {name}
        </Text>
      </Link>
    );
  }
);

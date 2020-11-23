import { Link, Text } from "@chakra-ui/react";
import { PixelSize, Row } from "buttered-chakra";
import React from "react";
import { AccountButton } from "./AccountButton";
import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import {
  AnimatedPoolLogo,
  AnimatedSmallLogo,
  PoolLogo,
  SmallLogo,
} from "./Logos";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Pool } from "../../context/PoolContext";
import { usePoolInfo } from "../../hooks/usePoolInfo";
import { useTranslation } from "react-i18next";

export const HeaderHeightWithTopPadding = new PixelSize(
  38 + DASHBOARD_BOX_SPACING.asNumber()
);

export const Header = React.memo(
  ({
    isAuthed,
    isPool,
    padding,
  }: {
    isAuthed: boolean;
    isPool?: boolean;
    padding?: boolean;
  }) => {
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
        {isAuthed ? (
          isPool ? (
            <AnimatedPoolLogo />
          ) : (
            <AnimatedSmallLogo />
          )
        ) : isPool ? (
          <PoolLogo />
        ) : (
          <SmallLogo />
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
          {/* <HeaderLink mr={4} name={t("Pools")} route="/" />

          {Object.values(Pool).map(
            (pool: Pool, index: number, array: Pool[]) => {
              return (
                <PoolLink
                  key={pool}
                  pool={pool}
                  isLast={index === array.length - 1}
                />
              );
            }
          )} */}
        </Row>

        <AccountButton />
      </Row>
    );
  }
);

export const PoolLink = React.memo(
  ({ pool, isLast }: { pool: Pool; isLast: boolean }) => {
    const { poolName } = usePoolInfo(pool);

    return (
      <HeaderLink
        mr={isLast ? 0 : 4}
        name={poolName}
        route={"/pools/" + pool}
      />
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

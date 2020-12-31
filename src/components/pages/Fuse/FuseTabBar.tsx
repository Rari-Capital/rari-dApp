import { InfoIcon, SmallAddIcon } from "@chakra-ui/icons";
import { ButtonGroup, Input, Link } from "@chakra-ui/react";
import { RowOrColumn, Row, Center } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import { Link as RouterLink } from "react-router-dom";

const activeStyle = { bg: "#FFF", color: "#000" };

const noop = {};

const FuseTabBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  let { poolId } = useParams();

  return (
    <DashboardBox
      width="100%"
      mt={DASHBOARD_BOX_SPACING.asPxString()}
      height={isMobile ? "auto" : "65px"}
    >
      <RowOrColumn
        isRow={!isMobile}
        expand
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        p={4}
      >
        <DashboardBox height="35px">
          <Row
            pl={2}
            expand
            crossAxisAlignment="center"
            mainAxisAlignment="flex-start"
            fontWeight="bold"
          >
            {t("Search:")}
            <Input
              height="100%"
              ml={2}
              placeholder="RGT, USDC, ETH, USDT"
              variant="filled"
              size="sm"
              _placeholder={{ color: "#FFF" }}
              _focus={{ bg: "#282727" }}
              _hover={{ bg: "#4d4b4b" }}
              bg="#282727"
              borderRadius="0px 9px 9px 0px"
            />
          </Row>
        </DashboardBox>

        <TabLink route="/fuse/my-pools" text={t("My Pools")} />

        <TabLink route="/fuse" text={t("All Pools")} />

        {poolId ? (
          <ButtonGroup
            size="sm"
            isAttached
            variant="outline"
            height="35px"
            ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
            mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
          >
            <DashboardBox {...activeStyle}>
              <Center expand px={2} fontWeight="bold">
                {t("Pool #{{poolId}}", { poolId })}
              </Center>
            </DashboardBox>

            <DashboardBox {...activeStyle}>
              <Link
                /* @ts-ignore */
                as={RouterLink}
                to={"/fuse/pool-info/" + poolId}
              >
                <Center expand pl="9px" pr="10px" fontWeight="bold">
                  <InfoIcon />
                </Center>
              </Link>
            </DashboardBox>
          </ButtonGroup>
        ) : null}

        <DashboardBox
          mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
          ml={isMobile ? 0 : "auto"}
          height="35px"
          as="button"
        >
          <Center expand pl={2} pr={3} fontWeight="bold">
            <SmallAddIcon mr={1} /> {t("New Pool")}
          </Center>
        </DashboardBox>
      </RowOrColumn>
    </DashboardBox>
  );
});

const TabLink = React.memo(
  ({ route, text }: { route: string; text: string }) => {
    const isMobile = useIsSmallScreen();

    const location = useLocation();

    const currentRoute = location.pathname.replace(/\/+$/, "");

    return (
      <Link
        /* @ts-ignore */
        as={RouterLink}
        className="no-underline"
        to={route}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
      >
        <DashboardBox
          height="35px"
          {...(route === currentRoute ? activeStyle : noop)}
        >
          <Center expand px={2} fontWeight="bold">
            {text}
          </Center>
        </DashboardBox>
      </Link>
    );
  }
);

export default FuseTabBar;

import { DeleteIcon, InfoIcon, SmallAddIcon } from "@chakra-ui/icons";
import { ButtonGroup, Input, Link, Text } from "@chakra-ui/react";
import { RowOrColumn, Row, Center } from "buttered-chakra";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import { Link as RouterLink } from "react-router-dom";

const activeStyle = { bg: "#FFF", color: "#000" };

const noop = {};

export function useFilter() {
  return new URLSearchParams(useLocation().search).get("filter");
}

const FuseTabBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  let { poolId } = useParams();

  let navigate = useNavigate();

  const filter = useFilter();

  const setFilter = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = encodeURIComponent(event.target.value);

      if (value) {
        navigate("?filter=" + value);
      } else {
        navigate("");
      }
    },
    [navigate]
  );

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
        <ButtonGroup size="sm" isAttached variant="outline" height="35px">
          <DashboardBox height="35px">
            <Row
              pl={2}
              expand
              crossAxisAlignment="center"
              mainAxisAlignment="flex-start"
              fontWeight="bold"
            >
              <Text flexShrink={0}>{t("Search:")}</Text>

              <Input
                value={filter ?? ""}
                onChange={setFilter}
                height="100%"
                ml={2}
                placeholder={t("Try searching for RGT")}
                variant="filled"
                size="sm"
                _placeholder={{ color: "#e0e0e0" }}
                _focus={{ bg: "#282727" }}
                _hover={{ bg: "#282727" }}
                bg="#282727"
                borderRadius={filter ? "0px" : "0px 9px 9px 0px"}
              />
            </Row>
          </DashboardBox>
          {filter ? (
            <DashboardBox bg="#282727" ml={-1}>
              <Link
                /* @ts-ignore */
                as={RouterLink}
                to=""
              >
                <Center expand pr={2} fontWeight="bold">
                  <DeleteIcon mb="2px" />
                </Center>
              </Link>
            </DashboardBox>
          ) : null}
        </ButtonGroup>

        <TabLink route="/fuse?filter=my-pools" text={t("My Pools")} />

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
              <Link
                /* @ts-ignore */
                as={RouterLink}
                to={`/fuse/pool/${poolId}`}
                className="no-underline"
              >
                <Center expand px={2} fontWeight="bold">
                  {t("Pool #{{poolId}}", { poolId })}
                </Center>
              </Link>
            </DashboardBox>

            <DashboardBox {...activeStyle}>
              <Link
                /* @ts-ignore */
                as={RouterLink}
                to={`/fuse/pool/${poolId}/info`}
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
        >
          <Link
            /* @ts-ignore */
            as={RouterLink}
            to={`/fuse/new-pool`}
            className="no-underline"
          >
            <Center expand pl={2} pr={3} fontWeight="bold">
              <SmallAddIcon mr={1} /> {t("New Pool")}
            </Center>
          </Link>
        </DashboardBox>
      </RowOrColumn>
    </DashboardBox>
  );
});

const TabLink = React.memo(
  ({ route, text }: { route: string; text: string }) => {
    const isMobile = useIsSmallScreen();

    const location = useLocation();

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
          {...(route ===
          location.pathname.replace(/\/+$/, "") + window.location.search
            ? activeStyle
            : noop)}
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

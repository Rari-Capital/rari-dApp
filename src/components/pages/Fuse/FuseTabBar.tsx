import { DeleteIcon, SmallAddIcon } from "@chakra-ui/icons";
import { ButtonGroup, Input, Link, Text } from "@chakra-ui/react";
import { RowOrColumn, Row, Center } from "utils/chakraUtils";
import { useTranslation } from "react-i18next";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox from "../../shared/DashboardBox";
import { Link as RouterLink } from "react-router-dom";
import { useFilter } from "hooks/useFilter";
import { useRouter } from "next/router";
import AppLink from "components/shared/AppLink";

const activeStyle = { bg: "#FFF", color: "#000" };

const noop = {};

const FuseTabBar = () => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const filter = useFilter();
  const router = useRouter();
  const { poolId } = router.query;

  return (
    <DashboardBox width="100%" mt={4} height={isMobile ? "auto" : "65px"}>
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
              // expand
              crossAxisAlignment="center"
              mainAxisAlignment="flex-start"
              fontWeight="bold"
            >
              <Text flexShrink={0}>{t("Search:")}</Text>

              <Input
                value={filter ?? ""}
                onChange={(event) => {
                  const value = encodeURIComponent(event.target.value);

                  if (value) {
                    router.push("?filter=" + value);
                  } else {
                    router.push("");
                  }
                }}
                width="185px"
                height="100%"
                ml={2}
                placeholder={t("Try searching for USDC")}
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
        <TabLink route="/fuse?filter=created-pools" text={t("Created Pools")} />
        <TabExternalLink
          route="https://rari.grafana.net/goto/61kctV_Gk"
          text={t("Metrics")}
        />
        <TabLink route="/fuse/liquidations" text={t("Liquidations")} />

        {poolId ? (
          <>
            <DashboardBox
              {...(!router.pathname.includes("info") ? activeStyle : {})}
              ml={isMobile ? 0 : 4}
              mt={isMobile ? 4 : 0}
              height="35px"
            >
              <AppLink href={`/fuse/pool/${poolId}`} className="no-underline">
                <Center expand px={2} fontWeight="bold">
                  {t("Pool #{{poolId}}", { poolId })}
                </Center>
              </AppLink>
            </DashboardBox>

            <DashboardBox
              {...(router.pathname.includes("info") ? activeStyle : {})}
              ml={isMobile ? 0 : 4}
              mt={isMobile ? 4 : 0}
              height="35px"
            >
              <AppLink
                href={`/fuse/pool/${poolId}/info`}
                className="no-underline"
              >
                <Center expand px={2} fontWeight="bold">
                  {t("Pool #{{poolId}} Info", { poolId })}
                </Center>
              </AppLink>
            </DashboardBox>
          </>
        ) : null}

        {/* <NewPoolButton /> */}
      </RowOrColumn>
    </DashboardBox>
  );
};

const TabLink = ({ route, text }: { route: string; text: string }) => {
  const isMobile = useIsSmallScreen();

  const router = useRouter();
  console.log({ router });

  return (
    <AppLink
      className="no-underline"
      href={route}
      ml={isMobile ? 0 : 4}
      mt={isMobile ? 4 : 0}
      shallow
    >
      <DashboardBox
        height="35px"
        // {...(route ===
        // router.pathname.replace(/\/+$/, "") + window.location.search
        //   ? activeStyle
        //   : noop)}
      >
        <Center expand px={2} fontWeight="bold">
          {text}
        </Center>
      </DashboardBox>
    </AppLink>
  );
};

const TabExternalLink = ({ route, text }: { route: string; text: string }) => {
  const isMobile = useIsSmallScreen();

  return (
    <Link
      className="no-underline"
      href={route}
      isExternal
      ml={isMobile ? 0 : 4}
      mt={isMobile ? 4 : 0}
    >
      <DashboardBox height="35px">
        <Center expand px={2} fontWeight="bold">
          {text}
        </Center>
      </DashboardBox>
    </Link>
  );
};

const NewPoolButton = () => {
  const isMobile = useIsSmallScreen();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <DashboardBox
      mt={isMobile ? 4 : 0}
      ml={isMobile ? 0 : "auto"}
      height="35px"
      // {...("/fuse/new-pool" ===
      // router.pathname.replace(/\/+$/, "") + window.location.search
      //   ? activeStyle
      //   : noop)}
    >
      <AppLink href={`/fuse/new-pool`} className="no-underline">
        <Center expand pl={2} pr={3} fontWeight="bold">
          <SmallAddIcon mr={1} /> {t("New Pool")}
        </Center>
      </AppLink>
    </DashboardBox>
  );
};

export default FuseTabBar;

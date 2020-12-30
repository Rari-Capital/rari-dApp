import { SmallAddIcon } from "@chakra-ui/icons";
import { Input, Center } from "@chakra-ui/react";
import { RowOrColumn, Row } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";

const FuseTabBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

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

        <DashboardBox
          height="35px"
          ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
          mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
          as="button"
        >
          <Center expand px={2} fontWeight="bold">
            My Pools
          </Center>
        </DashboardBox>

        <DashboardBox
          height="35px"
          ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
          mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
          bg="#FFF"
          color="#000"
          as="button"
        >
          <Center expand px={2} fontWeight="bold">
            {t("Public Pools")}
          </Center>
        </DashboardBox>

        <DashboardBox
          height="35px"
          ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
          mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
          as="button"
        >
          <Center expand px={2} fontWeight="bold">
            {t("Private Pools")}
          </Center>
        </DashboardBox>

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

export default FuseTabBar;

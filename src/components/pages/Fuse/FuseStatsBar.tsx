import { Heading } from "@chakra-ui/react";
import { RowOrColumn, Column, Center } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import CaptionedStat from "../../shared/CaptionedStat";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";

const FuseStatsBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  return (
    <RowOrColumn
      width="100%"
      isRow={!isMobile}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "120px"}
    >
      <DashboardBox width="100%" height={isMobile ? "auto" : "100%"}>
        <Column
          expand
          mainAxisAlignment="center"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
          textAlign={isMobile ? "center" : "left"}
          p={4}
        >
          <Heading size="lg">{t("Fuse")}</Heading>

          {t(
            "Isolated money markets you can use today that will power the decentralized future of tommorow."
          )}
        </Column>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "245px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
      >
        <Center expand p={4}>
          <CaptionedStat
            crossAxisAlignment="center"
            captionFirst={false}
            statSize="3xl"
            captionSize="sm"
            stat={"$75,000.00"}
            caption={t("Total Supply Balance")}
          />
        </Center>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "245px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
      >
        <Center expand p={4}>
          <CaptionedStat
            crossAxisAlignment="center"
            captionFirst={false}
            statSize="3xl"
            captionSize="sm"
            stat={"$21,000.00"}
            caption={t("Total Borrow Balance")}
          />
        </Center>
      </DashboardBox>
    </RowOrColumn>
  );
});

export default FuseStatsBar;

import { Column } from "buttered-chakra";
import React from "react";
import { useParams } from "react-router-dom";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";

const FusePoolPage = React.memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSmallScreen();

  let { poolId } = useParams();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        px={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
      >
        <Header isAuthed={isAuthed} />

        <FuseStatsBar />

        <FuseTabBar />

        <DashboardBox
          width="100%"
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height={isMobile ? "auto" : "600px"}
        >
          {poolId}
        </DashboardBox>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolPage;

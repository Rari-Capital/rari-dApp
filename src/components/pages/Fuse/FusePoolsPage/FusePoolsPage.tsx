import { memo } from "react";

// Components
import DashboardBox from "components/shared/DashboardBox";
import FuseStatsBar from "../FuseStatsBar";
import FuseTabBar from "../FuseTabBar";

// Hooks
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";

// Utils
import { Column } from "utils/chakraUtils";
import { PoolList } from "./PoolList";
import { useFilter } from "hooks/useFilter";
import { useFusePools } from "hooks/fuse/useFusePools";

const FusePoolsPage = memo(() => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
  const filter = useFilter();
  const { filteredPools } = useFusePools(filter);

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        height="100%"
        px={isMobile ? 4 : 0}
      >
        <FuseStatsBar />

        <FuseTabBar />

        <DashboardBox width="100%" mt={4}>
          <PoolList pools={filteredPools}/>
        </DashboardBox>
      </Column>
    </>
  );
});

export default FusePoolsPage;


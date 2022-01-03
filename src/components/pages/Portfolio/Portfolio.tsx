import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { sumBy } from "lodash";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import DashboardBox from "components/shared/DashboardBox";
import Footer from "components/shared/Footer";
import { Header } from "components/shared/Header";

import { useRari } from "context/RariContext";

import { useFusePools } from "hooks/fuse/useFusePools";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useFusePoolsData } from "hooks/useFusePoolData";

import { Column } from "utils/chakraUtils";
import { FusePoolData } from "utils/fetchFusePoolData";
import { smallUsdFormatter } from "utils/bigUtils";

import PoolsTable from "./PoolsTable";

const PortfolioPage = () => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
  const { t } = useTranslation();

  const { filteredPools: myPools } = useFusePools("my-pools");
  const poolIds: number[] = useMemo(
    () => myPools?.map(({ id }) => id) ?? [],
    [myPools]
  );
  const fusePoolsData: FusePoolData[] | null = useFusePoolsData(poolIds);

  const totalBorrowBalanceUsd = useMemo(
    () => sumBy(fusePoolsData, (it) => it.totalBorrowBalanceUSD),
    [fusePoolsData]
  );
  const totalSupplyBalanceUsd = useMemo(
    () => sumBy(fusePoolsData, (it) => it.totalSupplyBalanceUSD),
    [fusePoolsData]
  );
  const netBalanceUsd = totalSupplyBalanceUsd - totalBorrowBalanceUsd;

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      color="#FFFFFF"
      mx="auto"
      width={isMobile ? "100%" : "1000px"}
      height="100%"
      px={isMobile ? 4 : 0}
    >
      <Header isAuthed={isAuthed} />
      <DashboardBox width="100%" p={4}>
        <Text>{t("Your total balance")}</Text>
        <Heading size="lg" pt={1}>
          {smallUsdFormatter(netBalanceUsd)}
        </Heading>
      </DashboardBox>
      <DashboardBox width="100%" p={4} mt={4}>
        <Flex>
          <Box flex={1}>
            <Text>{t("Total supplied")}</Text>
            <Heading size="md" pt={1}>
              {smallUsdFormatter(totalSupplyBalanceUsd)}
            </Heading>
          </Box>
          <Box flex={1}>
            <Text>{t("Total borrowed")}</Text>
            <Heading size="md" pt={1}>
              {smallUsdFormatter(totalBorrowBalanceUsd)}
            </Heading>
          </Box>
        </Flex>
        <Box pt={4}>
          <PoolsTable />
        </Box>
      </DashboardBox>
      <Footer />
    </Column>
  );
};

export default PortfolioPage;

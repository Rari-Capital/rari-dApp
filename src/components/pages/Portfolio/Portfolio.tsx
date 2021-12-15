import {
  Box,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Column } from "utils/chakraUtils";
import { sumBy } from "lodash";

import DashboardBox from "components/shared/DashboardBox";
import Footer from "components/shared/Footer";
import { Header } from "components/shared/Header";

import { useRari } from "context/RariContext";

import { useFusePools } from "hooks/fuse/useFusePools";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useFusePoolsData } from "hooks/useFusePoolData";
import { FusePoolData } from "utils/fetchFusePoolData";
import { smallUsdFormatter } from "utils/bigUtils";
import { useTranslation } from "react-i18next";

const PortfolioPage = () => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
  const { t } = useTranslation();

  const { filteredPools: myPools } = useFusePools("my-pools");
  const poolIds: number[] = myPools?.map(({ id }) => id) ?? [];
  const fusePoolsData: FusePoolData[] | null = useFusePoolsData(poolIds);

  const totalBorrowBalanceUsd = sumBy(
    fusePoolsData,
    (it) => it.totalBorrowBalanceUSD
  );
  const totalSupplyBalanceUsd = sumBy(
    fusePoolsData,
    (it) => it.totalSupplyBalanceUSD
  );
  const netBalanceUsd = totalSupplyBalanceUsd - totalBorrowBalanceUsd;
  const thStyle: React.CSSProperties = {
    borderBottomColor: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    textTransform: "none",
    fontWeight: "normal",
    paddingLeft: 0,
    fontSize: "initial",
    letterSpacing: 0,
  };
  const tdStyle: React.CSSProperties = {
    borderBottomColor: "rgba(255,255,255,0.1)",
    color: "white",
    paddingLeft: 0,
  };

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
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th style={thStyle}>{t("Fuse Pool")}</Th>
                <Th style={thStyle}>{t("Supplied")}</Th>
                <Th style={thStyle}>{t("Borrowed")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {myPools.map((pool, index) => {
                const fusePoolData = fusePoolsData?.[index];

                return (
                  <Tr key={pool.id}>
                    <Td style={tdStyle}>
                      <Text fontWeight="bold">{pool.name}</Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </DashboardBox>
      <Footer />
    </Column>
  );
};

export default PortfolioPage;

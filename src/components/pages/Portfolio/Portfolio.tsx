import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Link,
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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

import DashboardBox from "components/shared/DashboardBox";
import Footer from "components/shared/Footer";
import { Header } from "components/shared/Header";

import { useRari } from "context/RariContext";

import { useFusePools, MergedPool } from "hooks/fuse/useFusePools";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useFusePoolsData } from "hooks/useFusePoolData";
import { useTokensDataAsMap } from "hooks/useTokenData";
import {
  filterPoolName,
  FusePoolData,
  USDPricedFuseAsset,
} from "utils/fetchFusePoolData";
import { smallUsdFormatter } from "utils/bigUtils";
import { convertMantissaToAPY } from "utils/apyUtils";

const borderBottomColor = "rgba(255,255,255,0.1)";
const thStyle: React.CSSProperties = {
  borderBottomColor,
  color: "rgba(255,255,255,0.5)",
  textTransform: "none",
  fontWeight: "normal",
  paddingLeft: 0,
  fontSize: "initial",
  letterSpacing: 0,
};

const PoolTr = ({
  pool,
  poolData,
}: {
  pool: MergedPool;
  poolData: FusePoolData;
}) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const tdStyle: React.CSSProperties = {
    color: "white",
    paddingLeft: 0,
    borderBottomColor: dropdownOpened ? "transparent" : borderBottomColor,
  };
  const assets: USDPricedFuseAsset[] = poolData.assets;
  const tokensData = useTokensDataAsMap(
    assets.map(({ underlyingToken }) => underlyingToken)
  );

  return (
    <>
      <Tr onClick={() => setDropdownOpened(!dropdownOpened)}>
        <Td style={tdStyle}>
          <Flex alignItems="center">
            {dropdownOpened ? (
              <FaCaretDown cursor="pointer" />
            ) : (
              <FaCaretRight cursor="pointer" />
            )}
            &nbsp;
            {/* Prevent selection on double click */}
            <Text fontWeight="bold" userSelect="none">
              {filterPoolName(pool.name)}
            </Text>
          </Flex>
        </Td>
        <Td style={tdStyle}>
          {smallUsdFormatter(poolData?.totalSupplyBalanceUSD)}
        </Td>
        <Td style={tdStyle}>
          {smallUsdFormatter(poolData?.totalBorrowBalanceUSD)}
        </Td>
        <Td style={tdStyle}>
          <Link
            as={RouterLink}
            width="100%"
            className="no-underline"
            to={"/fuse/pool/" + pool.id}
            // Call `stopPropagation` to prevent dropdown from opening
            // when a user specifically clicks on the `ExternalLinkIcon`
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon />
          </Link>
        </Td>
      </Tr>
      {dropdownOpened && (
        <Tr>
          <Td colSpan={99} pt={0} pl={0} borderBottomColor={borderBottomColor}>
            <DashboardBox width="100%" p={4}>
              <Text fontWeight="bold">Supply positions</Text>
              <Box mt={2}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th style={thStyle} borderBottomWidth={0}>
                        Amount
                      </Th>
                      <Th style={thStyle} borderBottomWidth={0}>
                        APY
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {poolData.assets.map((asset: USDPricedFuseAsset) => {
                      const supplyAPY = convertMantissaToAPY(
                        asset.supplyRatePerBlock,
                        365
                      );

                      return (
                        asset.supplyBalanceUSD > 0 && (
                          <Tr>
                            <Td style={tdStyle}>
                              <Flex alignItems="center">
                                <Avatar
                                  src={
                                    tokensData[asset.underlyingToken]
                                      ?.logoURL ?? ""
                                  }
                                  size="xs"
                                  marginRight={2}
                                />
                                {(
                                  asset.supplyBalance /
                                  10 ** asset.underlyingDecimals
                                ).toFixed(2)}{" "}
                                {asset.underlyingSymbol}
                              </Flex>
                              <Text
                                color="rgba(255,255,255,0.5)"
                                fontSize="sm"
                                mt="3"
                              >
                                {smallUsdFormatter(asset.supplyBalanceUSD)}
                              </Text>
                            </Td>
                            <Td style={tdStyle}>{supplyAPY.toFixed(2)}%</Td>
                          </Tr>
                        )
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
              <Text fontWeight="bold">Borrow positions</Text>
            </DashboardBox>
          </Td>
        </Tr>
      )}
    </>
  );
};

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
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th style={thStyle}>{t("Fuse Pool")}</Th>
                <Th style={thStyle}>{t("Supplied")}</Th>
                <Th style={thStyle}>{t("Borrowed")}</Th>
                <Th style={thStyle} />
              </Tr>
            </Thead>
            <Tbody>
              {myPools.map((pool, index) => {
                const fusePoolData = fusePoolsData?.[index];

                return fusePoolData ? (
                  <PoolTr key={pool.id} pool={pool} poolData={fusePoolData} />
                ) : null;
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

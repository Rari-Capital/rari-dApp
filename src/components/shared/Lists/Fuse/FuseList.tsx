import { Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import {
  AvatarGroup,
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import AppLink from "components/shared/AppLink";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import CTokenIcon from "components/pages/Fuse/FusePoolsPage/CTokenIcon";

// Hooks
import { useFusePools } from "hooks/fuse/useFusePools";
import { useTranslation } from "next-i18next";
import { useSortableList } from "hooks/useSortableList";

// Utils
import { Center, Column, useIsMobile } from "lib/chakraUtils";
import { filterPoolName, FusePoolData } from "utils/fetchFusePoolData";
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { letterScore, usePoolRSS } from "hooks/useRSS";

// Types
import { SortableTableHeader } from "../Common";
import { TokenData } from "hooks/useTokenData";
import { RariApiTokenData } from "types/tokens";
import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import { useMemo } from "react";
import { convertMantissaToAPR, convertMantissaToAPY } from "utils/apyUtils";
import DashboardBox from "components/shared/DashboardBox";

export const FuseList = ({
  token,
}: {
  token?: TokenData | RariApiTokenData; // same thing
  displayRatesForToken?: boolean; // same thing
}) => {
  const { poolsWithThisAsset } = useFuseDataForAsset(token?.address);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const {
    sorted: sortedPools,
    handleSortClick,
    sortBy,
    sortDir,
  } = useSortableList(poolsWithThisAsset);

  return (
    <DashboardBox h="100%" w="100%">
      {!sortedPools.length ? (
        <Box w="100%" h="100px" bg="pink">
          <Center>
            <Spinner />
          </Center>
        </Box>
      ) : (
        <Table variant="unstyled">
          <Thead position="sticky" top={0} left={0} bg="#121212" zIndex={4}>
            <Tr bg="#121212">
              <Th fontSize="sm">
                {!isMobile ? t("Pool Assets") : t("Pool Directory")}
              </Th>

              {isMobile ? null : (
                <>
                  {/* Pool # */}
                  <SortableTableHeader
                    text="Pool"
                    sortDir={sortDir}
                    handleSortClick={() => handleSortClick("id")}
                    isActive={sortBy === "id"}
                  />

                  {/* Pool # */}
                  <SortableTableHeader
                    text="Total Supplied"
                    sortDir={sortDir}
                    handleSortClick={() => handleSortClick("totalSuppliedUSD")}
                    isActive={sortBy === "totalSuppliedUSD"}
                  />

                  {/* Pool # */}
                  <SortableTableHeader
                    text="Total Borrowed"
                    sortDir={sortDir}
                    handleSortClick={() => handleSortClick("totalBorrowedUSD")}
                    isActive={sortBy === "totalBorrowedUSD"}
                  />

                  {/* Pool # */}
                  <Th fontSize="sm">{t("Pool Risk Score")}</Th>
                </>
              )}
            </Tr>
          </Thead>

          <Tbody w="100%">
            {sortedPools.map((pool, index) => {
              return (
                <FusePoolRow
                  key={pool.id}
                  pool={pool}
                  noBottomDivider={index === sortedPools.length - 1}
                  token={token}
                />
              );
            })}
          </Tbody>
        </Table>
      )}
    </DashboardBox>
  );
};

export const FusePoolRow = ({
  pool,
  noBottomDivider,
  smaller = false,
  showRatesForAsset,
  token,
  ...rowProps
}: {
  pool: FusePoolData;
  noBottomDivider?: boolean;
  smaller?: boolean;
  token?: TokenData | RariApiTokenData;
  [x: string]: any;
}) => {
  const isMobile = useIsMobile();

  // Pooldata
  const {
    id: poolNumber,
    totalSuppliedUSD: tvl,
    totalBorrowedUSD: borrowed,
    assets,
  } = pool;
  const name = filterPoolName(pool.name);

  const tokens = useMemo(
    () =>
      assets.map((asset) => ({
        symbol: asset.underlyingSymbol,
        address: asset.underlyingToken,
      })),
    [assets]
  );

  const isEmpty = tokens.length === 0;
  const rss = usePoolRSS(poolNumber);
  const rssScore = rss ? letterScore(rss.totalScore) : "?";

  return (
    <AppLink
      href={`fuse/pool/${poolNumber}`}
      as={Tr}
      className="hover-row no-underline"
      width="100%"
      height="90px"
      borderTop="1px solid #272727"
      {...rowProps}
    >
      {/* Pool */}
      <Td>
        <Column
          pt={2}
          width={isMobile ? "100%" : "40%"}
          height="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
        >
          {isEmpty ? null : (
            <SimpleTooltip label={tokens.map((t) => t.symbol).join(" / ")}>
              <AvatarGroup size="xs" max={30} mr={2}>
                {tokens.map(({ address }) => {
                  return <CTokenIcon key={address} address={address} />;
                })}
              </AvatarGroup>
            </SimpleTooltip>
          )}
          <Text mt={isEmpty ? 0 : 2}>{name}</Text>
        </Column>
      </Td>
      {!isMobile && (
        <>
          {/* Pool # */}
          <Td isNumeric={true} fontWeight="bold">
            {poolNumber}
          </Td>
          {/* Total Supply*/}
          <Td isNumeric={true} fontWeight="bold">
            {smaller ? shortUsdFormatter(tvl) : smallUsdFormatter(tvl)}
          </Td>
          {/* Total Borrow */}
          <Td isNumeric={true} fontWeight="bold">
            {smaller
              ? shortUsdFormatter(borrowed)
              : smallUsdFormatter(borrowed)}
          </Td>
          {/* Risk Score # */}
          <Td isNumeric={true} fontWeight="bold">
            <SimpleTooltip
              label={
                "Underlying RSS: " +
                (rss ? rss.totalScore.toFixed(2) : "?") +
                "%"
              }
            >
              {rssScore}
            </SimpleTooltip>
          </Td>
        </>
      )}
    </AppLink>
  );
};

export default FuseList;

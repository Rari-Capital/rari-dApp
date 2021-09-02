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
import { Column, useIsMobile } from "lib/chakraUtils";
import {
  filterPoolName,
  FusePoolData,
  USDPricedFuseAsset,
} from "utils/fetchFusePoolData";
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { letterScore, usePoolRSS } from "hooks/useRSS";

// Types
import { SortableTableHeader } from "../Common";
import { TokenData } from "hooks/useTokenData";
import { RariApiTokenData } from "types/tokens";
import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import { useMemo } from "react";
import { convertMantissaToAPR, convertMantissaToAPY } from "utils/apyUtils";

// Extends FusePoolData with USDPriceFuseAsset data
interface FusePoolDataForAsset extends FusePoolData {
  asset: USDPricedFuseAsset;
  assetBorrowedUSD: number;
  assetSuppliedUSD: number;
  assetLiquidityUSD: number;
  assetSupplyAPY: number;
  assetBorrowAPR: number;
}

// For this table, we have to format the data in a specific way
export const FuseListForToken = ({
  token,
}: {
  token?: TokenData | RariApiTokenData;
}) => {
  const { poolsWithThisAsset, poolAssetIndex } = useFuseDataForAsset(
    token?.address
  );
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const fusePoolsDataForAsset: FusePoolDataForAsset[] = useMemo(() => {
    return poolsWithThisAsset.map((pool) => {
      const asset = pool.assets[poolAssetIndex[pool.id]];
      return {
        ...pool,
        asset,
        assetBorrowedUSD: asset.totalBorrowUSD,
        assetSuppliedUSD: asset.totalSupplyUSD,
        assetLiquidityUSD: asset.liquidityUSD,
        assetSupplyAPY: parseFloat(
          convertMantissaToAPY(asset.supplyRatePerBlock).toFixed(2)
        ),
        assetBorrowAPR: parseFloat(
          convertMantissaToAPY(asset.borrowRatePerBlock).toFixed(2)
        ),
      };
    });
  }, [poolsWithThisAsset, poolAssetIndex]);

  console.log({ fusePoolsDataForAsset });

  const {
    sorted: sortedPools,
    handleSortClick,
    sortBy,
    sortDir,
  } = useSortableList(fusePoolsDataForAsset);

  return (
    <Box h="100%" w="100%">
      <Table variant="unstyled">
        <Thead position="sticky" top={0} left={0} bg="#121212" zIndex={4}>
          <Tr bg="#121212">
            <Th fontSize="sm">
              {!isMobile ? t("Pool Assets") : t("Pool Directory")}
            </Th>

            {isMobile ? null : (
              <>
                {/* Pool # */}
                {/* <SortableTableHeader
                  text="Pool"
                  sortDir={sortDir}
                  handleSortClick={() => handleSortClick("id")}
                  isActive={sortBy === "id"}
                /> */}

                {/* Pool # */}
                <SortableTableHeader
                  text="Asset Liquidity"
                  sortDir={sortDir}
                  handleSortClick={() => handleSortClick("assetLiquidityUSD")}
                  isActive={sortBy === "assetLiquidityUSD"}
                />

                {/* Pool # */}
                {/* <SortableTableHeader
                  text="Asset Borrowed"
                  sortDir={sortDir}
                  handleSortClick={() => handleSortClick("assetBorrowedUSD")}
                  isActive={sortBy === "assetBorrowedUSD"}
                /> */}

                {/* Pool # */}
                <Th fontSize="sm">{t("Pool Risk Score")}</Th>

                {/* Pool APY */}
                <SortableTableHeader
                  text="Lend APY"
                  sortDir={sortDir}
                  handleSortClick={() => handleSortClick("assetSupplyAPY")}
                  isActive={sortBy === "assetSupplyAPY"}
                />

                <SortableTableHeader
                  text="Borrow APR"
                  sortDir={sortDir}
                  handleSortClick={() => handleSortClick("assetSuppliedUSD")}
                  isActive={sortBy === "assetSuppliedUSD"}
                />
              </>
            )}
          </Tr>
        </Thead>
        <Tbody w="100%">
          {sortedPools ? (
            sortedPools.map((pool, index) => {
              return (
                <FusePoolAssetRow
                  key={pool.id}
                  pool={pool}
                  noBottomDivider={index === sortedPools.length - 1}
                  token={token}
                />
              );
            })
          ) : (
            <Tr>
              <Spinner my={8} />
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export const FusePoolAssetRow = ({
  pool,
  noBottomDivider,
  smaller = false,
  token,
  ...rowProps
}: {
  pool: FusePoolDataForAsset;
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
          {/* <Td isNumeric={true} fontWeight="bold">
            {poolNumber} 
          </Td> */}
          {/* Total Supply*/}
          <Td isNumeric={true} fontWeight="bold">
            {smaller
              ? shortUsdFormatter(pool.assetLiquidityUSD)
              : smallUsdFormatter(pool.assetLiquidityUSD)}
          </Td>
          {/* Total Borrow */}
          {/* <Td isNumeric={true} fontWeight="bold">
            {smaller
              ? shortUsdFormatter(pool.assetBorrowedUSD)
              : smallUsdFormatter(pool.assetBorrowedUSD)}
          </Td> */}
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
          <Td
            isNumeric={true}
            fontWeight="bold"
            color={
              !!pool.assetSupplyAPY && pool.assetSupplyAPY > 0
                ? token?.color
                : ""
            }
          >
            {pool.assetSupplyAPY}%
          </Td>
          <Td
            isNumeric={true}
            fontWeight="bold"
            color={
              !!pool.assetBorrowAPR && pool.assetBorrowAPR > 0
                ? token?.color
                : ""
            }
          >
            {pool.assetBorrowAPR}%
          </Td>
        </>
      )}
    </AppLink>
  );
};

export default FuseListForToken;

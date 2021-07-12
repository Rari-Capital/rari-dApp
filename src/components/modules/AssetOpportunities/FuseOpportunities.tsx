import { Box, Center, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { PoolList } from "components/pages/Fuse/FusePoolsPage/PoolList";
import PoolRow from "components/pages/Fuse/FusePoolsPage/PoolRow";
import { useFuseDataForAsset } from "hooks/fuse/useFuseDataForAsset";
import { TokenData } from "hooks/useTokenData";
import { useTranslation } from 'next-i18next';
import { Row, useIsMobile } from "utils/chakraUtils";
import { filterPoolName, USDPricedFuseAsset } from "utils/fetchFusePoolData";

const FuseOpportunities = ({ token }: { token: TokenData }) => {
  const fuseDataForAsset = useFuseDataForAsset(token.address);
  const { poolsWithThisAsset } = fuseDataForAsset;

  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <Box h="100%" w="100%">
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        pl={4}
        pr={1}
        position="sticky"
        top={-1}
        bg="#121212"
        zIndex={9}
      >
        <Text fontWeight="bold" width={isMobile ? "100%" : "40%"}>
          {!isMobile ? t("Pool Assets") : t("Pool Directory")}
        </Text>

        {isMobile ? null : (
          <>
            <Text fontWeight="bold" textAlign="center" width="13%">
              {t("Pool #")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="16%">
              {t("Supplied")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="16%">
              {t("Borrowed")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="15%">
              {t("Risk Score")}
            </Text>
          </>
        )}
      </Row>
      {poolsWithThisAsset?.length ? (
        poolsWithThisAsset.map((pool, index) => {
          return (
            <PoolRow
              key={pool.id}
              poolNumber={pool.id!}
              name={filterPoolName(pool.name)}
              tvl={pool.totalSuppliedUSD}
              borrowed={pool.totalBorrowedUSD}
              tokens={pool.assets.map((asset: USDPricedFuseAsset) => ({
                symbol: asset.underlyingSymbol,
                address: asset.underlyingToken,
              }))}
              noBottomDivider={index === poolsWithThisAsset.length - 1}
              smaller={true}
            />
          );
        })
      ) : (
        <Center h="100%">
          <Spinner />
        </Center>
      )}
    </Box>
  );
};

export default FuseOpportunities;

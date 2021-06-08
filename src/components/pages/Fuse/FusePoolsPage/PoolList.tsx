import { Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { ModalDivider } from "components/shared/Modal";
import PoolRow from "./PoolRow";

// Hooks
import { MergedPool } from "hooks/fuse/useFusePools";
import { useTranslation } from "react-i18next";

// Utils
import { Column, Row, useIsMobile } from "utils/chakraUtils";
import { filterPoolName } from "utils/fetchFusePoolData";

export const PoolList = ({ pools }: { pools: MergedPool[] | null }) => {
  const { t } = useTranslation();

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
    >
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        pl={4}
        pr={1}
      >
        <Text fontWeight="bold" width={isMobile ? "100%" : "40%"}>
          {!isMobile ? t("Pool Assets") : t("Pool Directory")}
        </Text>

        {isMobile ? null : (
          <>
            <Text fontWeight="bold" textAlign="center" width="13%">
              {t("Pool Number")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="16%">
              {t("Total Supplied")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="16%">
              {t("Total Borrowed")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="15%">
              {t("Pool Risk Score")}
            </Text>
          </>
        )}
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        {pools ? (
          pools.map((pool, index) => {
            return (
              <PoolRow
                key={pool.id}
                poolNumber={pool.id}
                name={filterPoolName(pool.pool.name)}
                tvl={pool.suppliedUSD}
                borrowed={pool.borrowedUSD}
                tokens={pool.underlyingTokens.map((address, index) => ({
                  symbol: pool.underlyingSymbols[index],
                  address,
                }))}
                noBottomDivider={index === pools.length - 1}
              />
            );
          })
        ) : (
          <Spinner my={8} />
        )}
      </Column>
    </Column>
  );
};

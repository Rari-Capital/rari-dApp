import { Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Avatar } from "@chakra-ui/react";
import EarnOpportunities from "components/modules/AssetOpportunities/EarnOpportunities";
import AppLink from "components/shared/AppLink";
import { ModalDivider } from "components/shared/Modal";
import PoolRow from "components/pages/Fuse/FusePoolsPage/PoolRow";

// Hooks
import { useFusePools } from "hooks/fuse/useFusePools";
import useSWR from "swr";
import { useTranslation } from "next-i18next";

// Utils
import { Column, Row, useIsMobile } from "lib/chakraUtils";
import { filterPoolName } from "utils/fetchFusePoolData";
import axios from "axios";

// Types
import { RariApiTokenData, TokensDataMap } from "types/tokens";
import { ExploreNavType } from "../ExplorePage";
import { AllAssetsResponse } from "pages/api/explore/allAssets";
import { queryAllUnderlyingAssets } from "services/gql";
import { SubgraphUnderlyingAsset } from "pages/api/explore";
import { fetchTokensAPIDataAsMap } from "utils/services";

// Fetchers
const allTokensFetcher = async (): Promise<{
  assets: SubgraphUnderlyingAsset[];
  tokensData: TokensDataMap;
}> => {
  const underlyingAssets = await queryAllUnderlyingAssets();

  const addrs = underlyingAssets.map((asset) => asset.address);
  const tokensData = await fetchTokensAPIDataAsMap(addrs);

  return {
    assets: underlyingAssets,
    tokensData,
  };
};

const PoolList = ({ nav }: { nav: ExploreNavType }) => {
  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
    >
      {nav === ExploreNavType.FUSE && <FuseList />}
      {nav === ExploreNavType.EARN && <EarnOpportunities />}
      {nav === ExploreNavType.ALL && <AllAssetsList />}
    </Column>
  );
};

export default PoolList;

const FuseList = () => {
  const { pools } = useFusePools(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <>
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        position="sticky"
        bg="#121212"
        zIndex={9}
        top={-1}
        pl={4}
        pr={1}
        borderBottom="1px solid #272727"
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
    </>
  );
};

const AllAssetsList = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { data, error } = useSWR("allAssets", allTokensFetcher);

  const { assets, tokensData } = data ?? {
    assets: [],
    tokensData: {},
  };

  return (
    <>
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="45px"
        width="100%"
        flexShrink={0}
        position="sticky"
        bg="#121212"
        zIndex={9}
        top={-1}
        pl={4}
        pr={1}
      >
        <Text fontWeight="bold" width={isMobile ? "100%" : "40%"}>
          {t("Asset")}
        </Text>

        {/* {isMobile ? null : (
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
        )} */}
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
      >
        {assets?.length ? (
          assets.map((underlyingAsset) => {
            return (
              <AssetRow
                asset={underlyingAsset}
                tokenData={tokensData[underlyingAsset.id]}
                key={underlyingAsset.symbol}
              />
            );
          })
        ) : (
          <Spinner my={8} />
        )}
      </Column>
    </>
  );
};

export const AssetRow = ({
  asset,
  tokenData,
}: {
  asset: SubgraphUnderlyingAsset;
  tokenData?: RariApiTokenData;
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <AppLink
        href={`/token/${asset.id}`}
        className="no-underline"
        width="100%"
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height="90px"
          className="hover-row"
          pl={4}
          pr={1}
        >
          <Row
            py={2}
            width={isMobile ? "100%" : "40%"}
            height="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <Avatar src={tokenData?.logoURL} boxSize={10} />
            <Text ml={2} fontWeight="bold">
              {asset.symbol}
            </Text>
          </Row>
          {/* 
          {isMobile ? null : (
            <>
              <Center height="100%" width="13%">
                <b>{poolNumber}</b>
              </Center>
              <Center height="100%" width="16%">
                <b>
                  {smaller ? shortUsdFormatter(tvl) : smallUsdFormatter(tvl)}
                </b>
              </Center>
              <Center height="100%" width="16%">
                <b>
                  {smaller
                    ? shortUsdFormatter(borrowed)
                    : smallUsdFormatter(borrowed)}
                </b>
              </Center>
              <Center height="100%" width="15%">
                <SimpleTooltip
                  label={
                    "Underlying RSS: " +
                    (rss ? rss.totalScore.toFixed(2) : "?") +
                    "%"
                  }
                >
                  <b>{rssScore}</b>
                </SimpleTooltip>
              </Center>
            </>
          )} */}
        </Row>
      </AppLink>
    </>
  );
};

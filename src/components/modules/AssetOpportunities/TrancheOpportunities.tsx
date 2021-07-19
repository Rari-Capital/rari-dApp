import { Box, Text } from "@chakra-ui/layout";
import { SaffronProvider } from "components/pages/Tranches/SaffronContext";
import AppLink from "components/shared/AppLink";
import {
  TrancheData,
  useTranchesDataForAsset,
} from "hooks/tranches/useTranchesDataForAsset";
import { TokenData } from "hooks/useTokenData";
import { useTranslation } from 'next-i18next';
import { Center, Column, Row, useIsMobile } from "lib/chakraUtils";

const TrancheOpportunities = ({ token }: { token: TokenData }) => {
  return (
    <SaffronProvider>
      <InternalTrancheOpportunities token={token} />
    </SaffronProvider>
  );
};

const InternalTrancheOpportunities = ({ token }: { token: TokenData }) => {
  const tranches = useTranchesDataForAsset(token.address);
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
          {!isMobile ? t("Pool") : t("Tranches Directory")}
        </Text>

        {isMobile ? null : (
          <>
            <Text fontWeight="bold" textAlign="center" width="13%">
              {t("Tranche")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="16%">
              {t(`${token.symbol} APY`)}
            </Text>
            <Text fontWeight="bold" textAlign="center" width="16%">
              {t("SFI APY")}
            </Text>

            <Text fontWeight="bold" textAlign="center" width="15%">
              {t("Total APY")}
            </Text>
          </>
        )}
      </Row>
      {tranches.length ? (
        tranches.map((tranche) => <TranchePoolRow tranche={tranche} />)
      ) : (
        <Text my="auto" mx="auto">
          No Tranche Opportunities
        </Text>
      )}
    </Box>
  );
};

export default TrancheOpportunities;

const TranchePoolRow = ({ tranche }: { tranche: TrancheData }) => {
  const isMobile = useIsMobile();

  return (
    <>
      <AppLink href={"/tranches"} className="no-underline" width="100%">
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height="90px"
          className="hover-row"
          pl={4}
          pr={1}
        >
          <Column
            pt={2}
            width={isMobile ? "100%" : "40%"}
            height="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
          >
            {/* <SimpleTooltip label={tokens.map((t) => t.symbol).join(" / ")}>
                  <AvatarGroup size="xs" max={30} mr={2}>
                    {tokens.map(({ address }) => {
                      return <CTokenIcon key={address} address={address} />;
                    })}
                  </AvatarGroup>
                </SimpleTooltip> */}
            <Text mt={2}>{tranche.poolName}</Text>
          </Column>

          {isMobile ? null : (
            <>
              <Center height="100%" width="13%">
                <b>{tranche.trancheRating}</b>
              </Center>
              <Center height="100%" width="16%">
                {tranche.assetAPY}%
              </Center>
              <Center height="100%" width="16%">
                {tranche.sfiAPY}%
              </Center>
              <Center height="100%" width="15%">
                {tranche.sfiAPY}%
                {/* <SimpleTooltip
                    label={
                      "Underlying RSS: " +
                      (rss ? rss.totalScore.toFixed(2) : "?") +
                      "%"
                    }
                  >
                    <b>{rssScore}</b>
                  </SimpleTooltip> */}
              </Center>
            </>
          )}
        </Row>
      </AppLink>

      {/* {noBottomDivider ? null : <ModalDivider />} */}
    </>
  );
};

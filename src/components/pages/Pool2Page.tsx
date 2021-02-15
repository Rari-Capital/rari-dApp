import React from "react";
import {
  Center,
  Column,
  Row,
  RowOrColumn,
  useWindowSize,
} from "buttered-chakra";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { Heading, Link, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../context/RariContext";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import DashboardBox from "../shared/DashboardBox";
import ForceAuthModal from "../shared/ForceAuthModal";
import { Header } from "../shared/Header";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import { useQuery } from "react-query";

const Pool2Page = () => {
  const { isAuthed } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />

        <RowOrColumn
          width="100%"
          isRow={!isMobile}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
        >
          <Column
            width={isMobile ? "100%" : "75%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            mr={4}
          >
            <DashboardBox height={isMobile ? "110px" : "95px"} width="100%">
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment={isMobile ? "center" : "flex-start"}
                textAlign="center"
                px={4}
              >
                <Heading size="lg">{t("Sushiswap LP Rewards")}</Heading>

                {t(
                  "Earn additional rewards for providing RGT liquidity on Sushiswap!"
                )}
              </Column>
            </DashboardBox>
          </Column>

          <Column
            mt={isMobile ? 4 : 0}
            width={isMobile ? "100%" : "25%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <DashboardBox height="95px" width="100%">
              <GeneralStats />
            </DashboardBox>
          </Column>
        </RowOrColumn>
      </Column>
      <CopyrightSpacer forceShow />
    </>
  );
};

export const GeneralStats = () => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const { data: totalStaked } = useQuery("totalStaked", async () => {
    return await rari.governance.rgt.sushiSwapDistributions.totalStaked();
  });

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">{t("Total LP Tokens Staked")}</Heading>
      <Text>{totalStaked ? totalStaked : "?"}</Text>
    </Column>
  );
};

export default Pool2Page;

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};

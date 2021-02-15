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

const FarmPage = () => {
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
                <Heading size="lg">{t("Farm Sushiswap Rewards")}</Heading>

                {t(
                  "Access Saffron Finance tranches through the Rari Capital interface!"
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
    return await rari.governance.sushiSwapDistributions.totalStaked();
  });
  const { data: rewardsEnd } = useQuery("rewardsEnd", async () => {});

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">
        {t("Epoch {{epoch}} Redemption Date", {
          epoch: data?.currentEpoch ?? "?",
        })}
      </Heading>
      <Text>{data ? data.endDate.toDateString() : "?"}</Text>
      <Text fontSize="13px" mt="3px">
        <Link isExternal href="https://app.saffron.finance/#redeem">
          <u>{t("Withdraw From Past Epochs")}</u>
        </Link>
      </Text>
    </Column>
  );
};

export default FarmPage;

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};

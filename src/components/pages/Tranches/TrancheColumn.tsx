import React from "react";

import { Center, Column } from "lib/chakraUtils";
import DashboardBox from "../../shared/DashboardBox";
import { Heading, Text, Icon, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import DepositModal from "./SaffronDepositModal";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import {
  TranchePool,
  TrancheRating,
  tranchePoolIndex,
  usePrincipal,
  useSaffronData,
} from "hooks/tranches/useSaffronData";
import { useAuthedCallback } from "hooks/useAuthedCallback";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import SwapHoriz from "components/shared/Icons/SwapHoriz";

const TrancheColumn = ({
  tranchePool,
  trancheRating,
}: {
  tranchePool: TranchePool;
  trancheRating: TrancheRating;
}) => {
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  const { saffronData } = useSaffronData();

  const principal = usePrincipal(tranchePool, trancheRating);

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openDepositModal);

  return (
    <>
      <DepositModal
        trancheRating={trancheRating}
        tranchePool={tranchePool}
        isOpen={isDepositModalOpen}
        onClose={closeDepositModal}
      />

      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
        ml={isMobile ? 0 : 4}
        mt={isMobile ? 8 : 0}
        // TODO: REMOVE STYLE ONCE AA TRANCHE IS ADDED
        style={
          trancheRating === TrancheRating.AA
            ? {
                opacity: tranchePool !== "USDC" ? "0.3" : "1",
                pointerEvents: "none",
              }
            : {}
        }
      >
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Heading size="sm">
            {trancheRating} {t("Tranche")}
          </Heading>
          <SimpleTooltip label={t("Your balance in this tranche")}>
            <Text textAlign="center" mt={4}>
              {principal ?? "?"} {tranchePool}
            </Text>
          </SimpleTooltip>
          <Text textAlign="center" fontWeight="bold" mt={4}>
            {trancheRating === "AA"
              ? // TODO REMOVE HARDCODED CHECK ABOUT AA TRANCHE ONCE IT'S IMPLEMENTED
                "0.45%"
              : saffronData
              ? saffronData.pools[tranchePoolIndex(tranchePool)].tranches?.[
                  trancheRating
                ]?.["total-apy"] + "% APY"
              : "?% APY"}
          </Text>
        </Column>

        <DashboardBox
          onClick={authedOpenModal}
          mt={4}
          as="button"
          height="45px"
          width={isMobile ? "100%" : "85%"}
          borderRadius="7px"
          fontSize="xl"
          fontWeight="bold"
        >
          <Center expand>
            <SwapHoriz />
          </Center>
        </DashboardBox>
      </Column>
    </>
  );
};

export default TrancheColumn;

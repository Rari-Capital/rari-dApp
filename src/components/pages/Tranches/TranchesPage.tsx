import React from "react";
import { Center, Column, Row, RowOrColumn } from "buttered-chakra";
import { useRari } from "../../../context/RariContext";
import DashboardBox from "../../shared/DashboardBox";
import { Header } from "../../shared/Header";
import {
  Heading,
  Link,
  Text,
  Icon,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdSwapHoriz } from "react-icons/md";
import DepositModal from "./SaffronDepositModal";
import { SaffronProvider } from "./SaffronContext";
import { SimpleTooltip } from "../../shared/SimpleTooltip";
import { WarningTwoIcon } from "@chakra-ui/icons";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import {
  TranchePool,
  TrancheRating,
  tranchePoolIndex,
  useEpochEndDate,
  useEstimatedSFI,
  usePrincipal,
  usePrincipalBalance,
  useSaffronData,
} from "hooks/tranches/useSaffronData";
import { useSFIDistributions } from "hooks/tranches/useSFIDistributions";
import { useSFIEarnings } from "hooks/tranches/useSFIEarnings";
import { useAuthedCallback } from "hooks/useAuthedCallback";
import Footer from "components/shared/Footer";

const WrappedTranchePage = React.memo(() => {
  return (
    <SaffronProvider>
      <TranchePage />
    </SaffronProvider>
  );
});

export default WrappedTranchePage;

const TranchePage = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  return (
    <>
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
            {/* Header */}
            <DashboardBox height={isMobile ? "110px" : "95px"} width="100%">
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment={isMobile ? "center" : "flex-start"}
                textAlign="center"
                px={4}
              >
                <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
                  <Heading size="lg">{t("Tranches")}</Heading>

                  <SimpleTooltip
                    placement="bottom"
                    label={t(
                      "Saffron Finance has not been fully audited. Take caution when entering these tranches and do not deposit more than you are comfortable losing."
                    )}
                  >
                    <Link
                      isExternal
                      href="https://defisafety.com/2020/12/28/saffron-finance/"
                    >
                      <WarningTwoIcon ml={2} boxSize="25px" color="#C34535" />
                    </Link>
                  </SimpleTooltip>
                </Row>

                {t(
                  "Access Saffron Finance tranches through the Rari Capital interface!"
                )}
              </Column>
            </DashboardBox>

            {/* Information ab. Tranche Ratings */}
            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchesRatingInfo />
            </DashboardBox>

            {/* Dai Pool */}
            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchePoolInfo tranchePool={TranchePool.DAI} />
            </DashboardBox>

            {/* USDC Pool */}
            {isMobile ? null : (
              <DashboardBox
                mt={4}
                height="200px"
                width="100%"
                style={{ filter: "blur(3px)", pointerEvents: "none" }}
              >
                <TranchePoolInfo tranchePool={TranchePool.USDC} />
              </DashboardBox>
            )}
          </Column>

          {/* Other Metrics */}
          <Column
            mt={isMobile ? 4 : 0}
            width={isMobile ? "100%" : "25%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <DashboardBox height="95px" width="100%">
              <RedemptionDate />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <PrincipalAmount />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <SFIPrice />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%" p={4}>
              <SFIDistributions />
            </DashboardBox>
          </Column>
        </RowOrColumn>
        <Footer />
      </Column>
    </>
  );
};

export const TranchesRatingInfo = () => {
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();

  return (
    <RowOrColumn
      isRow={!isMobile}
      p={4}
      expand
      crossAxisAlignment="flex-start"
      mainAxisAlignment="space-between"
    >
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment={isMobile ? "center" : "flex-start"}
        expand
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
        >
          <Heading size="md">{t("Tranche Details")}</Heading>
          <Text mt={1} textAlign={isMobile ? "center" : "left"}>
            {t(
              "SFI and interest is distributed to LPs proportionally at the end of each epoch."
            )}
          </Text>
        </Column>

        <Link isExternal href="https://app.saffron.finance/#docs">
          <u>{t("Learn More")}</u>
        </Link>
      </Column>

      <TrancheRatingColumn trancheRating={TrancheRating.S} />
      <TrancheRatingColumn trancheRating={TrancheRating.AA} />
      <TrancheRatingColumn trancheRating={TrancheRating.A} />
    </RowOrColumn>
  );
};

export const TrancheRatingColumn = ({
  trancheRating,
}: {
  trancheRating: TrancheRating;
}) => {
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();
  const data = useSFIEarnings();

  return (
    <Column
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      expand
      ml={isMobile ? 0 : 4}
      mt={isMobile ? 6 : 0}
    >
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        mb={isMobile ? 2 : 0}
      >
        <Heading size="sm">
          {trancheRating} {t("Tranche")}
        </Heading>
        <Text textAlign="center" mt={1}>
          {trancheRating === TrancheRating.S
            ? t("Liquidity added to other tranches as needed.")
            : trancheRating === TrancheRating.AA
            ? t(
                "Reduced interest earned. Covered in case of failure by A tranche."
              )
            : t(
                "10x interest earned. Cover provided to AA tranche in case of failure."
              )}
        </Text>
      </Column>

      <i>
        SFI Earnings: <b>{data ? data[trancheRating] + "%" : "?%"}</b>
      </i>
    </Column>
  );
};

export const TranchePoolInfo = ({
  tranchePool,
}: {
  tranchePool: TranchePool;
}) => {
  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  return (
    <RowOrColumn
      isRow={!isMobile}
      p={4}
      expand
      crossAxisAlignment="flex-start"
      mainAxisAlignment="space-between"
    >
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment={isMobile ? "center" : "flex-start"}
        expand
        textAlign={isMobile ? "center" : "left"}
      >
        <Heading size="md">
          {tranchePool} {t("Pool")}
        </Heading>
        <Text mt={2}>
          {t("Deposits are locked until the end of each 2 week epoch.")}
        </Text>
        <Text mt={3}>
          <i>{t("SFI staking is required to enter the A tranche!")}</i>
        </Text>
      </Column>

      <TrancheColumn
        tranchePool={tranchePool}
        trancheRating={TrancheRating.S}
      />

      {isMobile ? null : (
        <TrancheColumn
          tranchePool={tranchePool}
          trancheRating={TrancheRating.AA}
        />
      )}

      <TrancheColumn
        tranchePool={tranchePool}
        trancheRating={TrancheRating.A}
      />
    </RowOrColumn>
  );
};

export const TrancheColumn = ({
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
              ? saffronData.pools[tranchePoolIndex(tranchePool)].tranches[
                  trancheRating
                ]["total-apy"] + "% APY"
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
            <Icon as={MdSwapHoriz} boxSize="30px" />
          </Center>
        </DashboardBox>
      </Column>
    </>
  );
};

export const RedemptionDate = () => {
  const { t } = useTranslation();
  const { data } = useEpochEndDate();

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

export const PrincipalAmount = () => {
  const { t } = useTranslation();

  const principal = usePrincipalBalance();
  const estimatedSFI = useEstimatedSFI();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading lineHeight={1.4} fontSize="18px">
        {t("Principal Amount")}
      </Heading>
      <Text>{principal ?? "$?"}</Text>

      <Heading lineHeight={1.4} fontSize="18px" mt={10}>
        {t("Estimated SFI Earnings")}
      </Heading>
      <Text>{estimatedSFI?.formattedTotalSFIEarned ?? "? SFI"}</Text>
    </Column>
  );
};

export const SFIPrice = () => {
  const { t } = useTranslation();

  const { saffronData } = useSaffronData();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Image
        mt={2}
        boxSize="90px"
        src="https://assets.coingecko.com/coins/images/13117/large/sfi_red_250px.png?1606020144"
      />

      <Heading size="sm" mt={3}>
        {t("Current SFI Price")}
      </Heading>
      <Text>{saffronData ? "$" + saffronData.SFI.USD : "$?"}</Text>
    </Column>
  );
};

export const SFIDistributions = () => {
  const { t } = useTranslation();

  const sfiDistributions = useSFIDistributions();

  // TODO: ADD USDC
  return (
    <Column mainAxisAlignment="center" crossAxisAlignment="center" expand>
      <Heading size="sm">{t("SFI Pool Distributions")}</Heading>

      <Row
        width="100%"
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
        mt={4}
      >
        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Pool")}</Text>
          <Text>DAI</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Tranche")}</Text>
          <Text>S + A</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">SFI</Text>
          <Text>{sfiDistributions ? sfiDistributions.DAI : "?"}</Text>
        </Column>
      </Row>

      <Link mt={4} isExternal href="https://app.saffron.finance/#dashboard">
        <u>{t("Learn More")}</u>
      </Link>
    </Column>
  );
};

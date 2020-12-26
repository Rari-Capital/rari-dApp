import React from "react";
import { Center, Column, Row, useWindowSize } from "buttered-chakra";
import { useRari } from "../../context/RariContext";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import ForceAuthModal from "../shared/ForceAuthModal";
import { Header } from "../shared/Header";
import { Heading, Link, Text, Icon, Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdSwapHoriz } from "react-icons/md";
import CopyrightSpacer from "../shared/CopyrightSpacer";

enum TranchePool {
  DAI = "DAI",
  USDC = "USDC",
}

enum TrancheRating {
  AA = "AA",
  A = "A",
  S = "S",
}

const TranchePage = React.memo(() => {
  const { isAuthed } = useRari();

  const { width } = useWindowSize();

  // Determine the column width based on the width of the window.
  const columnWidth = width > 1030 ? "1000px" : width > 830 ? "800px" : "100%";

  const { t } = useTranslation();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={columnWidth}
        px={columnWidth === "100%" ? DASHBOARD_BOX_SPACING.asPxString() : 0}
      >
        <Header isAuthed={isAuthed} />

        <Row
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
        >
          <Column
            width="75%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            mr={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <DashboardBox height="95px" width="100%">
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment="flex-start"
                px={4}
              >
                <Heading size="lg">{t("Tranches")}</Heading>
                {t(
                  "Access Saffron Finance tranches through the Rari Capital interface!"
                )}
              </Column>
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <TranchesRatingInfo />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <TranchePoolInfo tranchePool={TranchePool.DAI} />
            </DashboardBox>

            <DashboardBox
              mt={4}
              height="200px"
              width="100%"
              style={{ filter: "blur(3px)", opacity: "0.7" }}
            >
              <TranchePoolInfo tranchePool={TranchePool.USDC} />
            </DashboardBox>
          </Column>
          <Column
            width="25%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <DashboardBox height="95px" width="100%">
              <RedemptionDate />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <InterestEarned />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%">
              <EstimatedReturns />
            </DashboardBox>

            <DashboardBox mt={4} height="200px" width="100%" p={4}>
              <SFIDistributions />
            </DashboardBox>
          </Column>
        </Row>
      </Column>
      <CopyrightSpacer forceShow />
    </>
  );
});

export const TranchesRatingInfo = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Row
      p={4}
      expand
      crossAxisAlignment="flex-start"
      mainAxisAlignment="space-between"
    >
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
        expand
      >
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          <Heading size="md">{t("Tranche Details")}</Heading>
          <Text mt={1}>
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
    </Row>
  );
});

export const TrancheRatingColumn = React.memo(
  ({ trancheRating }: { trancheRating: TrancheRating }) => {
    const { t } = useTranslation();

    return (
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
        ml={4}
      >
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Heading size="sm">
            {trancheRating} {t("Tranche")}
          </Heading>
          <Text textAlign="center" mt={1}>
            {trancheRating === TrancheRating.S ? (
              <>
                {t("Liquidity added to other tranches as needed")}{" "}
                <i>
                  {t("(currently {{currentAllocatedTranche}} tranche)", {
                    currentAllocatedTranche: "AA",
                  })}
                  .
                </i>
              </>
            ) : trancheRating === TrancheRating.A ? (
              "Reduced interest earned. Covered in case of failure by AA tranche."
            ) : (
              "10x interest earned. Cover provided to A tranche in case of failure."
            )}
          </Text>
        </Column>

        <i>
          SFI Earnings: <b>90%</b>
        </i>
      </Column>
    );
  }
);

export const TranchePoolInfo = React.memo(
  ({ tranchePool }: { tranchePool: TranchePool }) => {
    const { t } = useTranslation();

    return (
      <Row
        p={4}
        expand
        crossAxisAlignment="flex-start"
        mainAxisAlignment="space-between"
      >
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          expand
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

        <Box
          width="100%"
          height="100%"
          style={{ filter: "blur(3px)", opacity: "0.7" }}
        >
          <TrancheColumn
            tranchePool={tranchePool}
            trancheRating={TrancheRating.AA}
          />
        </Box>

        <TrancheColumn
          tranchePool={tranchePool}
          trancheRating={TrancheRating.A}
        />
      </Row>
    );
  }
);

export const TrancheColumn = React.memo(
  ({
    tranchePool,
    trancheRating,
  }: {
    tranchePool: TranchePool;
    trancheRating: TrancheRating;
  }) => {
    const { t } = useTranslation();
    return (
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
        ml={4}
      >
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Heading size="sm">
            {trancheRating} {t("Tranche")}
          </Heading>
          <Text textAlign="center" mt={4}>
            0 {tranchePool}
          </Text>
          <Text textAlign="center" fontWeight="bold" mt={4}>
            5.3% APY
          </Text>
        </Column>

        <DashboardBox
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          as="button"
          height="45px"
          width="85%"
          borderRadius="7px"
          fontSize="xl"
          fontWeight="bold"
        >
          <Center expand>
            <Icon as={MdSwapHoriz} boxSize="30px" />
          </Center>
        </DashboardBox>
      </Column>
    );
  }
);

export const RedemptionDate = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">{t("Redemption Date")}</Heading>
      <Text>12/13/2020</Text>
      <Text>6:00:00 AM PT</Text>
    </Column>
  );
});

export const InterestEarned = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">{t("Account Balance")}</Heading>
      <Text>$24,000</Text>

      <Heading size="sm" mt={3}>
        {t("Interest Earned")}
      </Heading>
      <Text>$24.0000</Text>

      <Heading size="sm" mt={3}>
        {t("SFI Earned")}
      </Heading>
      <Text>1.25</Text>
    </Column>
  );
});

export const EstimatedReturns = React.memo(() => {
  const { t } = useTranslation();
  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">{t("Interest Estimated")}</Heading>
      <Text>$125.21</Text>

      <Heading size="sm" mt={3}>
        {t("Estimated SFI")}
      </Heading>
      <Text>11.47</Text>

      <Heading size="sm" mt={3}>
        {t("Current SFI Price")}
      </Heading>
      <Text>$347.12</Text>
    </Column>
  );
});

export const SFIDistributions = React.memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <Center>
        <Heading size="sm">{t("SFI Pool Distributions")}</Heading>
      </Center>
      <Row
        mt={4}
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
      >
        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Pool")}</Text>
          <Text>DAI</Text>
          <Text>USDC</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Tranche")}</Text>
          <Text>S, A</Text>
          <Text>S, A</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">SFI</Text>
          <Text>2,750</Text>
          <Text>2,750</Text>
        </Column>
      </Row>
      <Center mt={6}>
        <Link isExternal href="https://app.saffron.finance/#docs">
          <u>{t("Learn More")}</u>
        </Link>
      </Center>
    </>
  );
});

export default TranchePage;

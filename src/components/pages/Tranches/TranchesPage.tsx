import { Column, Row, RowOrColumn } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { Heading, Link, Text, Image } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { SaffronProvider } from "./SaffronContext";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { memo } from "react";

// Hooks
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import {
  TranchePool,
  TrancheRating,
  useEpochEndDate,
  useEstimatedSFI,
  usePrincipalBalance,
  useSaffronData,
} from "hooks/tranches/useSaffronData";
import { useSFIDistributions } from "hooks/tranches/useSFIDistributions";
import { useSFIEarnings } from "hooks/tranches/useSFIEarnings";
import dynamic from "next/dynamic";

const TrancheColumn = dynamic(() => import("./TrancheColumn"), { ssr: false });

const WrappedTranchePage = memo(() => {
  return (
    <SaffronProvider>
      <TranchePage />
    </SaffronProvider>
  );
});

export default WrappedTranchePage;

const TranchePage = () => {
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

import React, { useEffect, useMemo, useState } from "react";
import {
  Center,
  Column,
  Row,
  RowOrColumn,
  useWindowSize,
} from "buttered-chakra";
import { useRari } from "../../../context/RariContext";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { Heading, Link, Text, Icon, Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdSwapHoriz } from "react-icons/md";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import { useQuery } from "react-query";
import { Contract } from "web3-eth-contract";
import SaffronPoolABI from "./SaffronPoolABI.json";
import SaffronStrategyABI from "./SaffronStrategyABI.json";

enum TranchePool {
  DAI = "DAI",
  USDC = "USDC",
}

enum TrancheRating {
  AA = "AA",
  A = "A",
  S = "S",
}

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};

interface SaffronContextType {
  saffronStrategy: Contract;
  saffronPool: Contract;
}

export const SaffronContext = React.createContext<
  SaffronContextType | undefined
>(undefined);

const SaffronStrategyAddress = "0xF4aA3b60eaD8DF9768816F20710a99bBF372393c";
const SaffronPoolAddress = "0xbbDfc1f8B6e73B6751A098574D0172945beD2953";

const WrappedTranchePage = React.memo(() => {
  const { rari } = useRari();

  const [saffronStrategy, setSaffronStrategy] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronStrategyABI as any,
      SaffronStrategyAddress
    );
  });

  const [saffronPool, setSaffronPool] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronPoolABI as any,
      SaffronPoolAddress
    );
  });

  useEffect(() => {
    setSaffronStrategy(
      new rari.web3.eth.Contract(
        SaffronStrategyABI as any,
        SaffronStrategyAddress
      )
    );

    setSaffronPool(
      new rari.web3.eth.Contract(SaffronPoolABI as any, SaffronPoolAddress)
    );
  }, [rari]);

  const value = useMemo(() => {
    return { saffronStrategy, saffronPool };
  }, [saffronStrategy, saffronPool]);

  return (
    <SaffronContext.Provider value={value}>
      <TranchePage />
    </SaffronContext.Provider>
  );
});

const useSaffronData = () => {
  const context = React.useContext(SaffronContext);

  const { data } = useQuery("saffronData", async () => {
    return (await fetch("https://api.spice.finance/apy")).json();
  });

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return {
    saffronData: data as {
      SFI: { USD: number };
      pools: {
        name: string;
        tranches: { A: { "total-apy": number }; S: { "total-apy": number } };
      }[];
    },
    ...context,
  };
};

export default WrappedTranchePage;

const TranchePage = React.memo(() => {
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
        px={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
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
            mr={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <DashboardBox height={isMobile ? "110px" : "95px"} width="100%">
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment={isMobile ? "center" : "flex-start"}
                textAlign="center"
                px={4}
              >
                <Heading size="lg">{t("Tranches")}</Heading>
                {t(
                  "Access Saffron Finance tranches through the Rari Capital interface!"
                )}
              </Column>
            </DashboardBox>

            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchesRatingInfo />
            </DashboardBox>

            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchePoolInfo tranchePool={TranchePool.DAI} />
            </DashboardBox>

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
          <Column
            mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
            width={isMobile ? "100%" : "25%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <DashboardBox height="95px" width="100%">
              <RedemptionDate />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
            >
              <InterestEarned />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
            >
              <EstimatedReturns />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
              p={4}
            >
              <SFIDistributions />
            </DashboardBox>
          </Column>
        </RowOrColumn>
      </Column>
      <CopyrightSpacer forceShow />
    </>
  );
});

export const TranchesRatingInfo = React.memo(() => {
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
});

export const TrancheRatingColumn = React.memo(
  ({ trancheRating }: { trancheRating: TrancheRating }) => {
    const { t } = useTranslation();

    const isMobile = useIsSmallScreen();

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
              : trancheRating === TrancheRating.A
              ? "Reduced interest earned. Covered in case of failure by AA tranche."
              : "10x interest earned. Cover provided to A tranche in case of failure."}
          </Text>
        </Column>

        <i>
          SFI Earnings:{" "}
          <b>
            {trancheRating === TrancheRating.S
              ? "90%"
              : trancheRating === TrancheRating.A
              ? "10%"
              : "0%"}
          </b>
        </i>
      </Column>
    );
  }
);

export const TranchePoolInfo = React.memo(
  ({ tranchePool }: { tranchePool: TranchePool }) => {
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
          <Box
            width="100%"
            height="100%"
            style={{ filter: "blur(3px)", pointerEvents: "none" }}
          >
            <TrancheColumn
              tranchePool={tranchePool}
              trancheRating={TrancheRating.AA}
            />
          </Box>
        )}

        <TrancheColumn
          tranchePool={tranchePool}
          trancheRating={TrancheRating.A}
        />
      </RowOrColumn>
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
    const isMobile = useIsSmallScreen();

    const { saffronData } = useSaffronData();

    return (
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
        ml={isMobile ? 0 : 4}
        mt={isMobile ? 8 : 0}
      >
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Heading size="sm">
            {trancheRating} {t("Tranche")}
          </Heading>
          <Text textAlign="center" mt={4}>
            0 {tranchePool}
          </Text>
          <Text textAlign="center" fontWeight="bold" mt={4}>
            {trancheRating === "AA"
              ? // TODO REMOVE HARDCODED CHECK ABOUT AA TRANCHE ONCE IT'S IMPLEMENTED
                "0.45%"
              : saffronData
              ? // TODO: REPLACE POOL WITH 9 INDEX FOR RARI DAI POOl AND ONCE THEY ADD USDC POOL DO A CONDITIONAL CHECK
                saffronData.pools[0].tranches[trancheRating]["total-apy"] + "%"
              : "?%"}
          </Text>
        </Column>

        <DashboardBox
          mt={DASHBOARD_BOX_SPACING.asPxString()}
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
    );
  }
);

export const RedemptionDate = React.memo(() => {
  const { t } = useTranslation();

  const { saffronStrategy } = useSaffronData();

  const { data } = useQuery("epochEndDate", async () => {
    const currentEpoch = await saffronStrategy.methods
      .get_current_epoch()
      .call();

    const endDate = new Date(
      (await saffronStrategy.methods.get_epoch_end(currentEpoch).call()) * 1000
    );

    return { currentEpoch, endDate };
  });

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">
        {t("Epoch {{epoch}} Redemption Date", {
          epoch: data?.currentEpoch ?? "?",
        })}
      </Heading>
      <Text>{data ? data.endDate.toDateString() : "?"}</Text>
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

  const { saffronData } = useSaffronData();

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
      <Text>{saffronData ? "$" + saffronData.SFI.USD : "$?"}</Text>
    </Column>
  );
});

export const SFIDistributions = React.memo(() => {
  const { t } = useTranslation();

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

      <Link mt={4} isExternal href="https://app.saffron.finance/#docs">
        <u>{t("Learn More")}</u>
      </Link>
    </Column>
  );
});

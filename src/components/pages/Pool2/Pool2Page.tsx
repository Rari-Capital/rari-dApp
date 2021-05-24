import { useState } from "react";
import {
  useInterval,
  useDisclosure,
  Heading,
  Link,
  Spinner,
  Text,
  Box,
} from "@chakra-ui/react";

import { Center, RowOrColumn, Column } from "buttered-chakra";
import { NewsAndTwitterLink } from "../MultiPoolPortal";
import Pool2Modal from "./Pool2Modal";
import { ClaimRGTModal } from "components/shared/ClaimRGTModal";
import DashboardBox from "components/shared/DashboardBox";
import { Header } from "components/shared/Header";

// Hooks
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { usePool2Balance } from "hooks/pool2/usePool2Balance";
import { usePool2UnclaimedRGT } from "hooks/pool2/usePool2UnclaimedRGT";
import { usePool2APR } from "hooks/pool2/usePool2APR";
import { usePool2TotalStaked } from "hooks/pool2/usePool2TotalStaked";
import { useHasSushiswapRewardsStarted } from "hooks/pool2/useSushiswapRewards";
import { useAuthedCallback } from "hooks/useAuthedCallback";

// Utils
import { smallUsdFormatter } from "utils/bigUtils";
import Footer from "components/shared/Footer";

const Pool2Page = () => {
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
        height="100%"
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
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

          <DashboardBox mt={4} width="100%" height="100px">
            <NewsAndTwitterLink />
          </DashboardBox>

          <RowOrColumn
            mt={4}
            isRow={!isMobile}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            height={isMobile ? "auto" : "200px"}
          >
            <DashboardBox
              height={isMobile ? "auto" : "100%"}
              width={isMobile ? "100%" : "70%"}
              p={4}
            >
              <RowOrColumn
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                height="100%"
                width="100%"
                isRow={!isMobile}
              >
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment={isMobile ? "center" : "flex-start"}
                  width={isMobile ? "100%" : "164px"}
                  flexShrink={0}
                >
                  <Heading fontSize="25px">{t("RGT-ETH Pool")} </Heading>

                  <Text mt={3} textAlign={isMobile ? "center" : "left"}>
                    {t(
                      "Provide liquidity to the RGT-ETH pool to acquire LP tokens"
                    )}{" "}
                    <Link
                      isExternal
                      href="https://app.sushiswap.fi/pair/0x18a797c7c70c1bf22fdee1c09062aba709cacf04"
                    >
                      <u>{t("here")}</u>
                    </Link>{" "}
                    {t("and stake them for extra rewards!")}
                  </Text>
                </Column>

                <Column
                  mt={isMobile ? 4 : 0}
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  width="100%"
                  height="100%"
                  ml={isMobile ? 0 : 3}
                >
                  <GeneralInfo />
                </Column>

                <Column
                  mt={isMobile ? 4 : 0}
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  width="100%"
                  height="100%"
                  ml={isMobile ? 0 : 3}
                >
                  <YourBalance />
                </Column>
              </RowOrColumn>
            </DashboardBox>

            <Column
              mt={isMobile ? 4 : 0}
              pl={isMobile ? 0 : 4}
              width={isMobile ? "100%" : "30%"}
              height={isMobile ? "auto" : "100%"}
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
            >
              <DashboardBox
                p={4}
                width="100%"
                height={isMobile ? "auto" : "50%"}
              >
                <TotalStaked />
              </DashboardBox>

              <Box pt={4} width="100%" height={isMobile ? "auto" : "50%"}>
                <DashboardBox p={4} height="100%">
                  <StartAndEnd />
                </DashboardBox>
              </Box>
            </Column>
          </RowOrColumn>
        </Column>
        <Footer />
      </Column>
    </>
  );
};

export const TotalStaked = () => {
  const { t } = useTranslation();

  const totalStaked = usePool2TotalStaked();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading mb={1} size="sm">
        {t("Total Staked (USD)")}
      </Heading>
      <Text>{totalStaked ? smallUsdFormatter(totalStaked) : "?"}</Text>
    </Column>
  );
};

const startDate = Date.parse("22 Feb 2021 00:10:00 PST");
// 3 years = 9.461e+10
const endDate = startDate + 9.461e10;

export const StartAndEnd = () => {
  const { t } = useTranslation();

  const hasStarted = useHasSushiswapRewardsStarted();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading mb={1} size="sm">
        {hasStarted ? t("Bonus Rewards End") : t("Bonus Rewards Begin")}
      </Heading>
      {hasStarted !== undefined ? (
        <Countdown endDate={hasStarted ? endDate : startDate} />
      ) : (
        <Spinner m={2} />
      )}
    </Column>
  );
};

const Countdown = ({ endDate }: { endDate: number }) => {
  const [msLeft, setMsLeft] = useState(endDate - Date.now());

  const seconds = Math.floor((msLeft / 1000) % 60);
  const minutes = Math.floor((msLeft / 1000 / 60) % 60);
  const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));

  useInterval(() => {
    setMsLeft(endDate - Date.now());
  }, 1000);

  return (
    <Text fontSize="sm">
      <b>{days}</b> days&nbsp; <b>{hours}</b> hrs&nbsp; <b>{minutes}</b>{" "}
      mins&nbsp; <b>{seconds}</b> sec
    </Text>
  );
};

const YourBalance = () => {
  const { t } = useTranslation();

  const balance = usePool2Balance();
  const earned = usePool2UnclaimedRGT();

  const {
    isOpen: isClaimRGTModalOpen,
    onOpen: openClaimRGTModal,
    onClose: closeClaimRGTModal,
  } = useDisclosure();
  const authedOpenModal = useAuthedCallback(openClaimRGTModal);

  const isMobile = useIsSmallScreen();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
      height="100%"
      style={
        !balance?.hasDeposited ? { opacity: "0.3", pointerEvents: "none" } : {}
      }
    >
      <ClaimRGTModal
        isOpen={isClaimRGTModalOpen}
        onClose={closeClaimRGTModal}
        defaultMode="pool2"
      />
      <Heading fontSize="20px">{t("Your Balance")}</Heading>
      <Text fontSize="sm" mt={2} width="70%" textAlign="center">
        {balance?.hasDeposited ? balance.SLP!.toFixed(4) : "0.0000"} Staked SLP
      </Text>
      <Text mt={1} fontSize="xs" width="70%" textAlign="center">
        {balance?.hasDeposited ? balance.eth!.toFixed(0) : "0.0000"} ETH{" + "}
        {balance?.hasDeposited ? balance.rgt!.toFixed(0) : "0.0000"} RGT
      </Text>
      <Text mt={2} width="70%" textAlign="center">
        <b>
          {earned ? earned.toFixed(2) : "0.00"} {t("RGT Earned")}
        </b>
      </Text>
      <DashboardBox
        mt={isMobile ? 4 : "auto"}
        width="70%"
        height="45px"
        borderRadius="7px"
        fontSize="xl"
        fontWeight="bold"
        as="button"
        onClick={authedOpenModal}
      >
        <Center expand>{t("Claim RGT")}</Center>
      </DashboardBox>
    </Column>
  );
};

const GeneralInfo = () => {
  const { t } = useTranslation();

  const apr = usePool2APR();
  const isMobile = useIsSmallScreen();

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  const authedOpenDepositModal = useAuthedCallback(openDepositModal);

  return (
    <>
      <Pool2Modal isOpen={isDepositModalOpen} onClose={closeDepositModal} />
      <Heading fontSize="20px">{apr ?? "?"}% APR</Heading>
      <Text mt={3} width="70%" textAlign="center">
        {t("Deposit your LP tokens here to earn bonus RGT rewards!")}
      </Text>
      <DashboardBox
        mt={isMobile ? 4 : "auto"}
        width="70%"
        height="45px"
        borderRadius="7px"
        fontSize="xl"
        fontWeight="bold"
        as="button"
        onClick={authedOpenDepositModal}
      >
        <Center expand>{t("Deposit")}</Center>
      </DashboardBox>
    </>
  );
};

export default Pool2Page;

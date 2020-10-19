import React, { ReactNode, useEffect, useState } from "react";

import {
  Center,
  Column,
  Row,
  RowOnDesktopColumnOnMobile,
  useWindowSize,
} from "buttered-chakra";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";

import SmallLogo from "../../static/small-logo.png";

import CopyrightSpacer from "../shared/CopyrightSpacer";

import CaptionedStat from "../shared/CaptionedStat";

import { FaTwitter } from "react-icons/fa";
import {
  Box,
  Heading,
  Link,
  Text,
  Image,
  Spinner,
  useDisclosure,
} from "@chakra-ui/core";
import { ModalDivider } from "../shared/Modal";
//@ts-ignore
import Marquee from "react-double-marquee";
import { useRari } from "../../context/RariContext";
import PoolsPerformanceChart from "../shared/PoolsPerformance";

import { MdSwapHoriz } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { Pool, PoolTypeProvider } from "../../context/PoolContext";
import { usePoolInfo } from "../../hooks/usePoolInfo";
import { useQuery } from "react-query";
import { useContracts } from "../../context/ContractsContext";
import { format1e18BigAsUSD, toBig } from "../../utils/bigUtils";
import DepositModal from "./DepositModal";
import { Header } from "../shared/Header";
import ForceAuthModal from "../shared/ForceAuthModal";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import {
  APYMovingStat,
  APYWithRefreshMovingStat,
  RefetchMovingStat,
} from "../shared/MovingStat";

function usdFormatter(num: number) {
  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 5,
  });

  return formatter.format(num);
}

export const RGTStat = React.memo(() => {
  const { t } = useTranslation();

  return (
    <RefetchMovingStat
      queryKey="rgtPrice"
      interval={5000}
      //TODO: ACTUAL FETCHING PLS
      fetch={() => usdFormatter(Date.now() / 10000000000)}
      loadingPlaceholder="$?"
      statSize="3xl"
      captionSize="xs"
      caption={t("Rari Governance Token Price")}
      crossAxisAlignment="center"
      captionFirst={false}
    />
  );
});

const MultiPoolPortal = React.memo(() => {
  const { width } = useWindowSize();

  const { isAuthed } = useRari();

  // Determine the column width based on the width of the window.
  const columnWidth = width > 930 ? "900px" : width > 730 ? "700px" : "100%";

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

        <FundStats />

        <DashboardBox
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          width="100%"
          height="100px"
        >
          <NewsAndTwitterLink />
        </DashboardBox>

        <DashboardBox
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height="300px"
          width="100%"
          color="#292828"
          overflow="hidden"
          px={1}
        >
          <PoolsPerformanceChart size={300} />
        </DashboardBox>

        <DashboardBox
          width="100%"
          height={{ md: "100px", xs: "250px" }}
          mt={DASHBOARD_BOX_SPACING.asPxString()}
        >
          <GovernanceStats />
        </DashboardBox>

        <PoolCards />

        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
});

export default MultiPoolPortal;

const GovernanceStats = React.memo(() => {
  const { t } = useTranslation();

  return (
    <RowOnDesktopColumnOnMobile
      expand
      mainAxisAlignment="space-around"
      crossAxisAlignment="center"
    >
      <Center expand>
        <CaptionedStat
          stat={"10,000,000"}
          statSize="3xl"
          captionSize="xs"
          caption={t("RGT Supply")}
          crossAxisAlignment="center"
          captionFirst={false}
        />
      </Center>

      <Center expand>
        <RGTStat />
      </Center>
      <Center expand>
        <CaptionedStat
          stat={"200 RGT"}
          statSize="3xl"
          captionSize="xs"
          caption={t("RGT Balance")}
          crossAxisAlignment="center"
          captionFirst={false}
        />
      </Center>
    </RowOnDesktopColumnOnMobile>
  );
});

const FundStats = React.memo(() => {
  const { t } = useTranslation();

  const { RariFundManager } = useContracts();

  const { address } = useRari();

  //TODO: Actually fetch all pool balance
  const { isLoading: isBalanceLoading, data: balanceData } = useQuery(
    address + " allPoolBalance",
    () =>
      RariFundManager.methods
        .balanceOf(address)
        .call()
        .then((balance) => format1e18BigAsUSD(toBig(balance)))
  );

  if (isBalanceLoading) {
    return (
      <Center height={{ md: "120px", xs: "215px" }}>
        <Spinner />
      </Center>
    );
  }

  const myBalance = balanceData!;
  const hasNotDeposited = myBalance === "$0.00";

  return (
    <RowOnDesktopColumnOnMobile
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
      height={{ md: "120px", xs: "auto" }}
    >
      <DashboardBox
        width={{ md: "50%", xs: "100%" }}
        height={{ md: "100%", xs: "100px" }}
        mr={{ md: DASHBOARD_BOX_SPACING.asPxString(), xs: 0 }}
        mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
      >
        <Center expand>
          {hasNotDeposited ? (
            <APYWithRefreshMovingStat
              formatStat={usdFormatter}
              startingAmount={10000000}
              fetchInterval={5000}
              apyInterval={100}
              // TODO: Actually fetch
              fetch={() => Date.now() / 100000}
              queryKey={"totalValueLocked"}
              apy={2}
              statSize="3xl"
              captionSize="xs"
              caption={t("Total Value Locked")}
              crossAxisAlignment="center"
              captionFirst={false}
            />
          ) : (
            <APYMovingStat
              formatStat={usdFormatter}
              startingAmount={100000}
              interval={100}
              apy={0.1}
              statSize="3xl"
              captionSize="xs"
              caption={t("Account Balance")}
              crossAxisAlignment="center"
              captionFirst={false}
            />
          )}
        </Center>
      </DashboardBox>

      <DashboardBox
        width={{ md: "50%", xs: "100%" }}
        height={{ md: "100%", xs: "100px" }}
      >
        <Center expand>
          {hasNotDeposited ? (
            <RGTStat />
          ) : (
            <RefetchMovingStat
              queryKey="interestEarned"
              interval={100}
              //TODO: ACTUAL FETCH
              fetch={() => usdFormatter(Date.now() / 100000000)}
              loadingPlaceholder="$?"
              statSize="3xl"
              captionSize="xs"
              caption={t("Interest Earned")}
              crossAxisAlignment="center"
              captionFirst={false}
            />
          )}
        </Center>
      </DashboardBox>
    </RowOnDesktopColumnOnMobile>
  );
});

const PoolCards = React.memo(() => {
  return (
    <RowOnDesktopColumnOnMobile
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      width="100%"
    >
      {Object.values(Pool).map((pool: Pool, index: number, array: Pool[]) => {
        return (
          <DashboardBox
            key={pool}
            width={{ md: "33%", xs: "100%" }}
            mr={{
              md:
                // Don't add right margin on the last child
                index === array.length - 1
                  ? 0
                  : DASHBOARD_BOX_SPACING.asPxString(),
              xs: 0,
            }}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <PoolDetailCard pool={pool} />
          </DashboardBox>
        );
      })}
    </RowOnDesktopColumnOnMobile>
  );
});

const PoolDetailCard = React.memo(({ pool }: { pool: Pool }) => {
  const { t } = useTranslation();

  const { poolName, poolLogo } = usePoolInfo(pool);

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  return (
    <>
      {isDepositModalOpen ? (
        <PoolTypeProvider pool={pool}>
          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={closeDepositModal}
          />
        </PoolTypeProvider>
      ) : null}
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        expand
        p={DASHBOARD_BOX_SPACING.asPxString()}
      >
        <Box width="50px" height="50px" flexShrink={0}>
          <Image src={poolLogo} />
        </Box>

        <Heading fontSize="xl" mt={3}>
          {poolName}
        </Heading>

        <SimpleTooltip label={t("Your balance in this pool")}>
          <Text my={5} fontSize="md" textAlign="center">
            {"$25,000"}
          </Text>
        </SimpleTooltip>

        <Text fontWeight="bold" textAlign="center">
          {pool === Pool.ETH ? "25% " : pool === Pool.STABLE ? "27% " : "56%"}{" "}
          APY +{" "}
          <SimpleTooltip label={t("Extra yield from $RGT")}>
            <span>
              (45% <Image display="inline" src={SmallLogo} size="20px" />)
            </span>
          </SimpleTooltip>
        </Text>

        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
        >
          <Link
            /* @ts-ignore */
            as={RouterLink}
            width="100%"
            to={"/pools/" + pool.toString()}
          >
            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              width="100%"
              height="45px"
              borderRadius="7px"
              fontSize="xl"
              fontWeight="bold"
            >
              <Center expand>{t("Access")}</Center>
            </DashboardBox>
          </Link>

          <DashboardBox
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            flexShrink={0}
            as="button"
            onClick={openDepositModal}
            height="45px"
            ml={2}
            width="45px"
            borderRadius="7px"
            fontSize="xl"
            fontWeight="bold"
          >
            <Center expand>
              <Box as={MdSwapHoriz} size="30px" />
            </Center>
          </DashboardBox>
        </Row>
      </Column>
    </>
  );
});

const NewsAndTwitterLink = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Column
      expand
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
    >
      <Link href="https://twitter.com/RariCapital" isExternal>
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          px={DASHBOARD_BOX_SPACING.asPxString()}
          py={3}
        >
          <Box as={FaTwitter} size="20px" />

          <Heading ml={2} size="sm">
            {t("Latest Rari News")}
          </Heading>
        </Row>
      </Link>

      <ModalDivider />

      <Column
        expand
        px={DASHBOARD_BOX_SPACING.asPxString()}
        mainAxisAlignment="center"
        crossAxisAlignment="flex-start"
      >
        <NewsMarquee />
      </Column>
    </Column>
  );
});

const NewsMarquee = React.memo(() => {
  const [news, setNews] = useState<string[]>([]);
  useEffect(() => {
    let isCanceled = false;
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (!isCanceled) {
          setNews(data);
        }
      });

    return () => {
      isCanceled = true;
    };
  }, [setNews]);

  return (
    <Box whiteSpace="nowrap" overflow="hidden" width="100%" fontSize="sm">
      {news.length === 0 ? (
        "Loading..."
      ) : (
        <MarqueeIfAuthed>
          {news.map((text: string) => (
            <span key={text}>
              {text}
              <NewsMarqueeSpacer />
            </span>
          ))}
        </MarqueeIfAuthed>
      )}
    </Box>
  );
});

const NewsMarqueeSpacer = React.memo(() => {
  return <b> &nbsp;&nbsp;&nbsp;&nbsp;📣 &nbsp;&nbsp;&nbsp;&nbsp; </b>;
});

const MarqueeIfAuthed = ({ children }: { children: ReactNode }) => {
  const { isAuthed } = useRari();

  return isAuthed ? (
    <Marquee delay={1200} childMargin={0} speed={0.015}>
      {children}
    </Marquee>
  ) : (
    <>{children}</>
  );
};

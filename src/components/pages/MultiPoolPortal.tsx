import React, { ReactNode } from "react";

import {
  Center,
  Column,
  Row,
  RowOnDesktopColumnOnMobile,
  useWindowSize,
} from "buttered-chakra";
import DashboardBox from "../shared/DashboardBox";

// import SmallLogo from "../../static/small-logo.png";

import CopyrightSpacer from "../shared/CopyrightSpacer";

import CaptionedStat from "../shared/CaptionedStat";
import { Link as RouterLink } from "react-router-dom";

import { FaTwitter } from "react-icons/fa";
import {
  Box,
  Heading,
  Link,
  Text,
  Image,
  Spinner,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import { ModalDivider } from "../shared/Modal";

//@ts-ignore
import Marquee from "react-double-marquee";
import { useRari } from "../../context/RariContext";

import { MdSwapHoriz } from "react-icons/md";
import { useTranslation } from "react-i18next";

import { Pool, PoolTypeProvider } from "../../context/PoolContext";
import { usePoolInfo } from "../../hooks/usePoolInfo";
import { useQuery } from "react-query";

import DepositModal from "./RariDepositModal";
import { Header } from "../shared/Header";
import ForceAuthModal from "../shared/ForceAuthModal";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import {
  APYMovingStat,
  APYWithRefreshMovingStat,
  RefetchMovingStat,
} from "../shared/MovingStat";
import {
  smallStringUsdFormatter,
  stringUsdFormatter,
  usdFormatter,
} from "../../utils/bigUtils";
import { usePoolBalance } from "../../hooks/usePoolBalance";
import PoolsPerformanceChart from "../shared/PoolsPerformance";
import { useTVLFetchers } from "../../hooks/useTVL";
import { usePoolAPY } from "../../hooks/usePoolAPY";

import BigNumber from "bignumber.js";
import { InfoIcon, QuestionIcon } from "@chakra-ui/icons";
import { getSDKPool } from "../../utils/poolUtils";
import { useNoSlippageCurrencies } from "../../hooks/useNoSlippageCurrencies";

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
        px={columnWidth === "100%" ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />

        <FundStats />

        <DashboardBox mt={4} width="100%" height="100px">
          <NewsAndTwitterLink />
        </DashboardBox>

        <DashboardBox
          mt={4}
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
          height={{ md: "100px", base: "250px" }}
          mt={4}
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

export const RGTPrice = () => {
  const { t } = useTranslation();

  const { rari } = useRari();

  return (
    <RefetchMovingStat
      queryKey="rgtPrice"
      interval={5000}
      fetch={() => {
        return rari.governance.rgt.getExchangeRate().then((data) => {
          return stringUsdFormatter(rari.web3.utils.fromWei(data));
        });
      }}
      loadingPlaceholder="$?"
      statSize="3xl"
      captionSize="xs"
      caption={t("Rari Governance Token Price")}
      crossAxisAlignment="center"
      captionFirst={false}
    />
  );
};

const GovernanceStats = () => {
  const { t } = useTranslation();

  const { rari, address } = useRari();

  const { data: rgtBalance } = useQuery(
    address + " balanceOf RGT",
    async () => {
      const rawBalance = await rari.governance.rgt.balanceOf(address);

      return stringUsdFormatter(rari.web3.utils.fromWei(rawBalance)).replace(
        "$",
        ""
      );
    }
  );

  const { data: rgtSupply } = useQuery("rgtSupply", async () => {
    //@ts-ignore
    const rawSupply = await rari.governance.contracts.RariGovernanceToken.methods
      .totalSupply()
      .call();

    return smallStringUsdFormatter((parseFloat(rawSupply) / 1e18).toFixed(0))
      .replace("$", "")
      .replace(".00", "");
  });

  return (
    <RowOnDesktopColumnOnMobile
      expand
      mainAxisAlignment="space-around"
      crossAxisAlignment="center"
    >
      <Center expand>
        <CaptionedStat
          stat={rgtSupply ?? "?"}
          statSize="3xl"
          captionSize="xs"
          caption={t("RGT Supply")}
          crossAxisAlignment="center"
          captionFirst={false}
        />
      </Center>

      <Center expand>
        <RGTPrice />
      </Center>
      <Center expand>
        <CaptionedStat
          stat={rgtBalance ?? "$?"}
          statSize="3xl"
          captionSize="xs"
          caption={t("RGT Balance (Claimed)")}
          crossAxisAlignment="center"
          captionFirst={false}
        />
      </Center>
    </RowOnDesktopColumnOnMobile>
  );
};

const FundStats = () => {
  const { t } = useTranslation();

  const { rari, address, isAuthed } = useRari();

  const { isLoading: isBalanceLoading, data: balanceData } = useQuery(
    address + " allPoolBalance",
    async () => {
      const [stableBal, yieldBal, ethBalInETH, ethPriceBN] = await Promise.all([
        rari.pools.stable.balances.balanceOf(address),
        rari.pools.yield.balances.balanceOf(address),
        rari.pools.ethereum.balances.balanceOf(address),
        rari.getEthUsdPriceBN(),
      ]);

      const ethBal = ethBalInETH.mul(
        ethPriceBN.div(rari.web3.utils.toBN(1e18))
      );

      return parseFloat(
        rari.web3.utils.fromWei(stableBal.add(yieldBal).add(ethBal))
      );
    }
  );

  const { getNumberTVL } = useTVLFetchers();

  if (isBalanceLoading) {
    return (
      <Center
        height={{
          md: isAuthed ? "235px" : "110px",
          base: isAuthed ? "330px" : "215px",
        }}
      >
        <Spinner />
      </Center>
    );
  }

  const myBalance = balanceData!;
  const hasNotDeposited = myBalance === 0;

  return (
    <>
      {hasNotDeposited ? null : (
        <DashboardBox width="100%" mb={4} height="110px">
          <Center expand>
            <APYWithRefreshMovingStat
              formatStat={usdFormatter}
              fetchInterval={40000}
              loadingPlaceholder="$?"
              apyInterval={100}
              fetch={getNumberTVL}
              queryKey={"totalValueLocked"}
              apy={0.15}
              statSize="3xl"
              captionSize="xs"
              caption={t("Total Value Locked")}
              crossAxisAlignment="center"
              captionFirst={false}
            />
          </Center>
        </DashboardBox>
      )}

      <RowOnDesktopColumnOnMobile
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        width="100%"
        height={{ md: "110px", base: "auto" }}
      >
        <DashboardBox
          width={{ md: hasNotDeposited ? "100%" : "50%", base: "100%" }}
          height={{ md: "100%", base: "110px" }}
          mr={{
            md: hasNotDeposited ? "0px" : 4,
            base: 0,
          }}
        >
          <Center expand>
            {hasNotDeposited ? (
              <APYWithRefreshMovingStat
                formatStat={usdFormatter}
                fetchInterval={40000}
                loadingPlaceholder="$?"
                apyInterval={100}
                fetch={getNumberTVL}
                queryKey={"totalValueLocked"}
                apy={0.15}
                statSize="3xl"
                captionSize="xs"
                caption={t("Total Value Locked")}
                crossAxisAlignment="center"
                captionFirst={false}
              />
            ) : (
              <APYMovingStat
                formatStat={usdFormatter}
                startingAmount={myBalance}
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

        {hasNotDeposited ? null : (
          <DashboardBox
            mt={{ md: 0, base: 4 }}
            width={{ md: "50%", base: "100%" }}
            height={{ md: "100%", base: "100px" }}
          >
            <Center expand>
              <InterestEarned />
            </Center>
          </DashboardBox>
        )}
      </RowOnDesktopColumnOnMobile>
    </>
  );
};

const PoolCards = () => {
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
            width={{ md: "33%", base: "100%" }}
            height="280px"
            mr={{
              md:
                // Don't add right margin on the last child
                index === array.length - 1 ? 0 : 4,
              base: 0,
            }}
            mt={4}
          >
            <PoolDetailCard pool={pool} />
          </DashboardBox>
        );
      })}
    </RowOnDesktopColumnOnMobile>
  );
};

const PoolDetailCard = ({ pool }: { pool: Pool }) => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const { poolType, poolName, poolLogo } = usePoolInfo(pool);

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  const { balanceData, isPoolBalanceLoading } = usePoolBalance(pool);

  const poolAPY = usePoolAPY(pool);

  const noSlippageCurrencies = useNoSlippageCurrencies(pool);

  // const rgtAPR = useRGTAPR();

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
        p={4}
      >
        <Box width="50px" height="50px" flexShrink={0}>
          <Image src={poolLogo} />
        </Box>

        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" mt={2}>
          <Heading fontSize="xl" lineHeight="2.5rem" ml="12px">
            {poolName}
          </Heading>

          <SimpleTooltip
            label={
              "Rebalances " +
              (noSlippageCurrencies
                ? noSlippageCurrencies.join(" + ")
                : " ? ") +
              " between " +
              getSDKPool({ rari, pool: poolType }).allocations.POOLS.join(", ")
            }
          >
            <QuestionIcon ml={2} mb="3px" boxSize="12px" />
          </SimpleTooltip>
        </Row>

        <SimpleTooltip label={t("Your balance in this pool")}>
          <Text mt={4} mb={5} fontSize="md" textAlign="center">
            {isPoolBalanceLoading ? "$?" : balanceData!.formattedBalance}
          </Text>
        </SimpleTooltip>

        <Text fontWeight="bold" textAlign="center">
          {poolAPY ?? "?"}% APY
          {/* +{" "}
          <SimpleTooltip label={t("Extra returns from $RGT")}>
            <span>
              ({rgtAPR ?? "?"}%{" "}
              <Image display="inline" src={SmallLogo} boxSize="20px" />)
            </span>
          </SimpleTooltip> */}
        </Text>

        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          mt="auto"
        >
          <Link
            /* @ts-ignore */
            as={RouterLink}
            width="100%"
            className="no-underline"
            to={"/pools/" + pool.toString()}
          >
            <DashboardBox
              mt={4}
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
            mt={4}
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
              <Icon as={MdSwapHoriz} boxSize="30px" />
            </Center>
          </DashboardBox>
        </Row>
      </Column>
    </>
  );
};

const InterestEarned = () => {
  const { rari, address } = useRari();

  const { data: interestEarned } = useQuery("interestEarned", async () => {
    const [
      stableInterest,
      yieldInterest,
      ethInterestInETH,
      ethPriceBN,
    ] = await Promise.all([
      rari.pools.stable.balances.interestAccruedBy(address),
      rari.pools.yield.balances.interestAccruedBy(address),
      rari.pools.ethereum.balances.interestAccruedBy(address),
      rari.getEthUsdPriceBN(),
    ]);

    const ethInterest = ethInterestInETH.mul(
      ethPriceBN.div(rari.web3.utils.toBN(1e18))
    );

    return {
      formattedEarnings: stringUsdFormatter(
        rari.web3.utils.fromWei(
          stableInterest.add(yieldInterest).add(ethInterest)
        )
      ),
      yieldPoolInterestEarned: yieldInterest,
    };
  });

  const { balanceData: yieldPoolBalance } = usePoolBalance(Pool.YIELD);

  const isSufferingDivergenceLoss = (() => {
    if (interestEarned && yieldPoolBalance) {
      if (
        interestEarned.yieldPoolInterestEarned.isZero() &&
        new BigNumber(yieldPoolBalance.bigBalance.toString()).div(1e18).gt(20)
      ) {
        return true;
      } else {
        return false;
      }
    }
  })();

  const { t } = useTranslation();

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading fontSize="3xl">
        {interestEarned?.formattedEarnings ?? "$?"}
      </Heading>

      {isSufferingDivergenceLoss ? (
        <SimpleTooltip
          label={t(
            "You may experience divergence loss when depositing stablecoins into the Yield Pool that are above their peg at the time of deposit. The Yield Pool is composed of various stablecoins which shift in value, causing your balance to fluctuate."
          )}
        >
          <Text
            textTransform="uppercase"
            letterSpacing="wide"
            color="#858585"
            fontSize="xs"
            textAlign="center"
          >
            {t("Interest Earned")}

            <InfoIcon ml="5px" boxSize="10px" mb="3px" />
          </Text>
        </SimpleTooltip>
      ) : (
        <Text
          textTransform="uppercase"
          letterSpacing="wide"
          color="#858585"
          fontSize="xs"
          textAlign="center"
        >
          {t("Interest Earned")}
        </Text>
      )}
    </Column>
  );
};

export const NewsAndTwitterLink = () => {
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
          px={4}
          py={3}
        >
          <Icon as={FaTwitter} boxSize="20px" />

          <Heading ml={2} size="sm">
            {t("Latest Rari News")}
          </Heading>
        </Row>
      </Link>

      <ModalDivider />

      <Column
        expand
        px={4}
        mainAxisAlignment="center"
        crossAxisAlignment="flex-start"
      >
        <NewsMarquee />
      </Column>
    </Column>
  );
};

const NewsMarquee = React.memo(() => {
  const news = [
    "Saffron x Rari tranches are now open for deposits under the Tranches tab.",
    "We're migrating from Telegram to Discord! Join us there to talk all things Rari Capital.",
    "Individual Pool Dashboards are now live! View detailed analytics about your account and other useful metrics!",
  ];

  return (
    <Box whiteSpace="nowrap" overflow="hidden" width="100%" fontSize="sm">
      <MarqueeIfAuthed>
        {news.map((text: string) => (
          <span key={text}>
            {text}
            <NewsMarqueeSpacer />
          </span>
        ))}
      </MarqueeIfAuthed>
    </Box>
  );
});

const NewsMarqueeSpacer = () => {
  return <b> &nbsp;&nbsp;&nbsp;&nbsp;📣 &nbsp;&nbsp;&nbsp;&nbsp; </b>;
};

const MarqueeIfAuthed = ({ children }: { children: ReactNode }) => {
  const { isAuthed } = useRari();

  return isAuthed ? (
    <Marquee delay={1200} childMargin={0} speed={0.015} direction="left">
      {children}
    </Marquee>
  ) : (
    <>{children}</>
  );
};

import React, { ReactNode, useCallback, useEffect, useState } from "react";

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

import { MdSwapHoriz } from "react-icons/md";
import { useTranslation } from "react-i18next";

import { Pool, PoolTypeProvider } from "../../context/PoolContext";
import { usePoolInfo } from "../../hooks/usePoolInfo";
import { useQuery } from "react-query";

import DepositModal from "./DepositModal";
import { Header } from "../shared/Header";
import ForceAuthModal from "../shared/ForceAuthModal";
import { SimpleTooltip } from "../shared/SimpleTooltip";
import {
  APYMovingStat,
  APYWithRefreshMovingStat,
  RefetchMovingStat,
} from "../shared/MovingStat";
import { stringUsdFormatter, usdFormatter } from "../../utils/bigUtils";
import { usePoolBalance } from "../../hooks/usePoolBalance";

export const RGTPrice = React.memo(() => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const fetch = useCallback(() => {
    return rari.governance.rgt.getExchangeRate().then((data) => {
      return stringUsdFormatter(rari.web3.utils.fromWei(data));
    });
  }, [rari.governance.rgt, rari.web3.utils]);

  return (
    <RefetchMovingStat
      queryKey="rgtPrice"
      interval={5000}
      fetch={fetch}
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

        {/* <DashboardBox
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height="300px"
          width="100%"
          color="#292828"
          overflow="hidden"
          px={1}
        >
          <PoolsPerformanceChart size={300} />
        </DashboardBox> */}

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

  const { rari, address } = useRari();

  const { data, isLoading } = useQuery(address + " balanceOf RGT", () => {
    return rari.governance.rgt.balanceOf(address).then((data) => {
      return stringUsdFormatter(rari.web3.utils.fromWei(data));
    });
  });

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
        <RGTPrice />
      </Center>
      <Center expand>
        <CaptionedStat
          stat={isLoading ? "$?" : data!}
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

  const { rari, address } = useRari();

  const getAccountBalance = useCallback(async () => {
    const stablebal = await rari.pools.stable.balances.balanceOf(address);

    const yieldbal = await rari.pools.yield.balances.balanceOf(address);

    const ethbal = await rari.pools.ethereum.balances.balanceOf(address);

    return parseFloat(
      rari.web3.utils.fromWei(stablebal.add(yieldbal).add(ethbal))
    );
  }, [rari.pools, rari.web3.utils, address]);

  const getAccountInterest = useCallback(async () => {
    const stablebal = await rari.pools.stable.balances.interestAccruedBy(
      address
    );

    const yieldbal = await rari.pools.yield.balances.interestAccruedBy(address);

    const ethbal = await rari.pools.ethereum.balances.interestAccruedBy(
      address
    );

    return stringUsdFormatter(
      rari.web3.utils.fromWei(stablebal.add(yieldbal).add(ethbal))
    );
  }, [rari.pools, rari.web3.utils, address]);

  const getTVL = useCallback(async () => {
    const stablebal = await rari.pools.stable.balances.getTotalSupply();

    const yieldbal = await rari.pools.yield.balances.getTotalSupply();

    const ethbal = await rari.pools.ethereum.balances.getTotalSupply();

    return parseFloat(
      rari.web3.utils.fromWei(stablebal.add(yieldbal).add(ethbal))
    );
  }, [rari.pools, rari.web3.utils]);

  const { isLoading: isBalanceLoading, data: balanceData } = useQuery(
    address + " allPoolBalance",
    getAccountBalance
  );

  if (isBalanceLoading) {
    return (
      <Center height={{ md: "120px", xs: "215px" }}>
        <Spinner />
      </Center>
    );
  }

  const myBalance = balanceData!;
  const hasNotDeposited = myBalance === 0;

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
              fetchInterval={40000}
              loadingPlaceholder="$?"
              apyInterval={100}
              fetch={getTVL}
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

      <DashboardBox
        width={{ md: "50%", xs: "100%" }}
        height={{ md: "100%", xs: "100px" }}
      >
        <Center expand>
          {hasNotDeposited ? (
            <RGTPrice />
          ) : (
            <RefetchMovingStat
              queryKey="interestEarned"
              interval={5000}
              fetch={getAccountInterest}
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
            height="280px"
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

  const { rari } = useRari();

  const { poolBalance, isPoolBalanceLoading } = usePoolBalance(pool);

  const { data: apy, isLoading: isAPYLoading } = useQuery(
    pool + " apy",
    async () => {
      let poolRawAPY;

      if (pool === Pool.ETH) {
        poolRawAPY = await rari.pools.ethereum.apy.getCurrentRawApy();
      } else if (pool === Pool.STABLE) {
        poolRawAPY = await rari.pools.stable.apy.getCurrentRawApy();
      } else {
        poolRawAPY = await rari.pools.yield.apy.getCurrentRawApy();
      }

      //TODO; fix this this is so ugly
      const poolAPY = parseFloat(
        rari.web3.utils.fromWei(poolRawAPY.mul(rari.web3.utils.toBN(100)))
      ).toFixed(2);

      const rgtRawAPY = await rari.governance.rgt.distributions.getCurrentApy();

      const rgtAPY = parseFloat(
        rari.web3.utils.fromWei(rgtRawAPY.mul(rari.web3.utils.toBN(100)))
      ).toFixed(0);

      return { rgtAPY, poolAPY };
    }
  );

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
            {isPoolBalanceLoading ? "$?" : poolBalance}
          </Text>
        </SimpleTooltip>

        <Text fontWeight="bold" textAlign="center">
          {isAPYLoading ? "?" : apy?.poolAPY}% APY +{" "}
          <SimpleTooltip label={t("Extra yield from $RGT")}>
            <span>
              ({isAPYLoading ? "?" : apy?.rgtAPY}%{" "}
              <Image display="inline" src={SmallLogo} size="20px" />)
            </span>
          </SimpleTooltip>
        </Text>

        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          mt="auto"
        >
          <DashboardBox
            flexShrink={0}
            as="button"
            onClick={openDepositModal}
            height="45px"
            width="100%"
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

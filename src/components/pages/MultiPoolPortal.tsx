import React, { ReactNode, useEffect, useState } from "react";

import {
  Center,
  Column,
  Row,
  RowOnDesktopColumnOnMobile,
  useWindowSize,
} from "buttered-chakra";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import { AccountButton } from "../shared/AccountButton";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { AnimatedSmallLogo, SmallLogo } from "../shared/Logos";

import { useForceAuth } from "../../hooks/useForceAuth";
import CaptionedStat from "../shared/CaptionedStat";

import { FaTwitter } from "react-icons/fa";
import { Box, Heading, Link, Text } from "@chakra-ui/core";
import { ModalDivider } from "../shared/Modal";
//@ts-ignore
import Marquee from "react-double-marquee";
import { useWeb3 } from "../../context/Web3Context";
import FundPerformanceChart from "../shared/FundPerformance";

import { AiFillLock } from "react-icons/ai";
import { GoRocket } from "react-icons/go";
import { FaEthereum } from "react-icons/fa";
import { Pool } from "../App";
import { MdSwapHoriz } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

const MultiPoolPortal = React.memo(() => {
  const isAuthed = useForceAuth();

  const { t } = useTranslation();

  const { width } = useWindowSize();

  // Determine the column width based on the width of the window.
  const columnWidth = width > 930 ? "900px" : width > 730 ? "700px" : "100%";

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      color="#FFFFFF"
      mx="auto"
      width={columnWidth}
      px={columnWidth === "100%" ? DASHBOARD_BOX_SPACING.asPxString() : 0}
    >
      <Row
        height="38px"
        my={DASHBOARD_BOX_SPACING.asPxString()}
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        overflowX="visible"
        overflowY="visible"
        width="100%"
      >
        {isAuthed ? <AnimatedSmallLogo /> : <SmallLogo />}

        <AccountButton />
      </Row>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="auto"
        width="100%"
      >
        <RowOnDesktopColumnOnMobile
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          height={{ md: "140px", xs: "220px" }}
        >
          <DashboardBox
            width={{ md: "50%", xs: "100%" }}
            height={{ md: "100%", xs: "102px" }}
            mr={{ md: DASHBOARD_BOX_SPACING.asPxString(), xs: 0 }}
            mb={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
          >
            <Column
              expand
              mainAxisAlignment="center"
              crossAxisAlignment="center"
            >
              <CaptionedStat
                stat="$50,000.00"
                statSize="4xl"
                captionSize="xs"
                caption={t("Total Value Locked")}
                crossAxisAlignment="center"
                captionFirst={false}
              />
            </Column>
          </DashboardBox>
          <DashboardBox
            width={{ md: "50%", xs: "100%" }}
            height={{ md: "100%", xs: "102px" }}
          >
            <Column
              expand
              mainAxisAlignment="center"
              crossAxisAlignment="center"
            >
              <CaptionedStat
                stat="$1,000.00"
                statSize="4xl"
                captionSize="xs"
                caption={t("Total Interest Earned This Week")}
                crossAxisAlignment="center"
                captionFirst={false}
              />
            </Column>
          </DashboardBox>
        </RowOnDesktopColumnOnMobile>

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
          <FundPerformanceChart size={300} showAmount={false} />
        </DashboardBox>

        <RowOnDesktopColumnOnMobile
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          {Object.values(Pool).map(
            (pool: Pool, index: number, array: Pool[]) => {
              return (
                <DashboardBox
                  key={pool}
                  width={{ md: "33%", xs: "100%" }}
                  mt={DASHBOARD_BOX_SPACING.asPxString()}
                  mr={{
                    md:
                      // Don't add right margin on the last child
                      index === array.length - 1
                        ? 0
                        : DASHBOARD_BOX_SPACING.asPxString(),
                    xs: 0,
                  }}
                >
                  <PoolDetailCard pool={pool} />
                </DashboardBox>
              );
            }
          )}
        </RowOnDesktopColumnOnMobile>
      </Column>
      <CopyrightSpacer forceShow />
    </Column>
  );
});

export default MultiPoolPortal;

const PoolDetailCard = React.memo(({ pool }: { pool: Pool }) => {
  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      expand
      p={DASHBOARD_BOX_SPACING.asPxString()}
    >
      <Box
        as={
          pool === Pool.ETH
            ? FaEthereum
            : pool === Pool.STABLE
            ? AiFillLock
            : pool === Pool.YIELD
            ? GoRocket
            : FaEthereum
        }
        size="30px"
      />

      <Heading fontSize="xl" mt={3}>
        {pool === Pool.ETH
          ? t("ETH Pool")
          : pool === Pool.STABLE
          ? t("Stable Pool")
          : pool === Pool.YIELD
          ? t("Yield Pool")
          : null}
      </Heading>

      <Text mt={1}>
        {pool === Pool.ETH
          ? t("Safe returns on ETH")
          : pool === Pool.STABLE
          ? t("Safe on stablecoins")
          : pool === Pool.YIELD
          ? t("High risk, high reward")
          : null}
      </Text>

      <Text mt={3} fontSize="xs" textAlign="center">
        {pool === Pool.ETH
          ? t("You have {{amount}} in this pool", { amount: "$25,000" })
          : pool === Pool.STABLE
          ? t("You have {{amount}} in this pool", { amount: "$10,500,000" })
          : pool === Pool.YIELD
          ? t("You have {{amount}} in this pool", { amount: "$250,000" })
          : null}
      </Text>
      <Text fontWeight="bold">
        {pool === Pool.ETH
          ? "25% APY / 0.04% DPY"
          : pool === Pool.STABLE
          ? "25% APY / 0.04% DPY"
          : pool === Pool.YIELD
          ? "200% APY / 1.04% DPY"
          : null}
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
          to={pool.toString()}
        >
          <DashboardBox
            mt={4}
            as="button"
            width="100%"
            height="45px"
            borderRadius="7px"
            fontSize="xl"
            fontWeight="bold"
          >
            {t("Access")}
          </DashboardBox>
        </Link>
        <Link
          /* @ts-ignore */
          as={RouterLink}
          to={pool.toString() + "?forceDeposit"}
        >
          <DashboardBox
            mt={4}
            flexShrink={0}
            as="button"
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
        </Link>
      </Row>
    </Column>
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
          px={4}
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
        px={4}
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
  const { isAuthed } = useWeb3();

  return isAuthed ? (
    <Marquee delay={1200} childMargin={0} speed={0.015}>
      {children}
    </Marquee>
  ) : (
    <>{children}</>
  );
};

// Next
import dynamic from "next/dynamic";
import { memo, useState } from "react";

import {
  Box,
  Text,
  Heading,
  Spinner,
  Divider,
  useDisclosure,
  theme,
  BoxProps,
  // Image,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

// Components
import DashboardBox, {
  DASHBOARD_BOX_SPACING,
  DASHBOARD_BOX_PROPS,
} from "components/shared/DashboardBox";
import FullPageSpinner from "components/shared/FullPageSpinner";

import {
  Column,
  Row,
  Center,
  useLockedViewHeight,
  useSpacedLayout,
  RowOnDesktopColumnOnMobile,
  PercentageSize,
  PixelSize,
  PercentOnDesktopPixelOnMobileSize,
} from "lib/chakraUtils";

import ProgressBar from "components/shared/ProgressBar";
import { GlowingButton } from "components/shared/GlowingButton";
import DepositModal from "../RariDepositModal";
// import { SimpleTooltip } from "../shared/SimpleTooltip";

const UserStatsAndChart = dynamic(() => import("./UserStatsAndChart"), {
  ssr: false,
});
const StrategyAllocation = dynamic(() => import("./StrategyAllocation"), {
  ssr: false,
});
// import UserStatsAndChart from "./UserStatsAndChart";
// import StrategyAllocation from "./StrategyAllocation";

// Hooks
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { useTranslation } from "next-i18next";
import { usePoolInfo, usePoolInfoFromContext } from "hooks/usePoolInfo";
import { usePoolBalance } from "hooks/usePoolBalance";
import { usePoolAPY } from "hooks/usePoolAPY";
import { useAuthedCallback } from "hooks/useAuthedCallback";
import { PoolTypeProvider, usePoolType } from "context/PoolContext";

// Utils
import { BN, smallStringUsdFormatter } from "utils/bigUtils";
import { getSDKPool, Pool } from "utils/poolUtils";
import { tokens } from "utils/tokenUtils";
import { fetchRGTAPR } from "utils/fetchPoolAPY";
import { formatBalanceBN } from "utils/format";
import { HeaderHeightWithTopPadding } from "components/shared/Header2/NewHeader2";

const millisecondsPerDay = 86400000;
const blocksPerDay = 6500;

const currencyCodesByHashes: { [key: string]: string } = {
  "0xa5e92f3efb6826155f1f728e162af9d7cda33a574a1153b58f03ea01cc37e568": "DAI",
  "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa": "USDC",
  "0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0": "USDT",
  "0xa1b8d8f7e538bb573797c963eeeed40d0bcb9f28c56104417d0da1b372ae3051": "TUSD",
  "0x54c512ac779647672b8d02e2fe2dc10f79bbf19f719d887221696215fd24e9f1": "BUSD",
  "0x87ef9bf44f9ed3d4aeadafb38d9bc9470e7aac44fdcb9f7ffb957b862954cf2c": "sUSD",
  "0x33d80a03b5585b94e68b56bdea4f57fd2e459401902cb2f61772e1b630afb4b2": "mUSD",
};

const PoolPortal = memo(({ pool }: { pool: Pool }) => {
  return (
    <PoolTypeProvider pool={pool}>
      <PoolPortalContent />
    </PoolTypeProvider>
  );
});

export default PoolPortal;

const PoolPortalContent = () => {
  const { isAuthed, rari } = useRari();

  const { windowHeight } = useLockedViewHeight({
    min: 750,
    max: 1900,
  });

  // Idk what this is
  const {
    childSizes: [, bodySize],
  } = useSpacedLayout({
    parentHeight: windowHeight.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      HeaderHeightWithTopPadding,
      new PercentageSize(1),
      // We have a 0 sized child here because it will now lower the size of the "100%" child
      // by accouting for padding below it, which is 15.
      new PixelSize(0),
    ],
  });

  // Sidebar
  const { spacing: statsSidebarSpacing, childSizes: statsSidebarChildSizes } =
    useSpacedLayout({
      parentHeight: bodySize.asNumber(),
      spacing: DASHBOARD_BOX_SPACING.asNumber(),
      childSizes: [
        new PixelSize(90),
        new PixelSize(100),
        new PixelSize(152),
        new PixelSize(180),
        new PercentOnDesktopPixelOnMobileSize({
          percentageSize: 1,
          pixelSize: 100,
        }),
      ],
    });

  // Main section
  const { spacing: mainSectionSpacing, childSizes: mainSectionChildSizes } =
    useSpacedLayout({
      parentHeight: bodySize.asNumber(),
      spacing: DASHBOARD_BOX_SPACING.asNumber(),
      childSizes: [
        new PixelSize(90),
        new PercentOnDesktopPixelOnMobileSize({
          percentageSize: 1,
          pixelSize: 600,
        }),
        new PixelSize(180),
      ],
    });

  const { poolName, poolCaption, poolType } = usePoolInfoFromContext();

  const { data: poolBalance, isLoading: isPoolBalanceLoading } =
    usePoolBalance(poolType);

  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openDepositModal);

  // If loading, stop here
  if (isPoolBalanceLoading) return <FullPageSpinner />;

  const myBalance: BN = poolBalance ?? rari.web3.utils.toBN(0);
  const hasNotDeposited: boolean = poolBalance?.isZero() ?? true;
  const formattedBalance = formatBalanceBN(
    rari,
    myBalance,
    poolType === Pool.ETH
  );

  return (
    <>
      <DepositModal isOpen={isDepositModalOpen} onClose={closeDepositModal} />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        color="#FFFFFF"
        width="100%"
      >
        <RowOnDesktopColumnOnMobile
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          px={4}
          height={{
            md: bodySize.asPxString(),
            base: "auto",
          }}
        >
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height={{ md: "100%", base: "auto" }}
            width={{ md: "100%", base: "100%" }}
          >
            {/* Text data about the Pool */}
            <DashboardBox
              width="100%"
              mb={mainSectionSpacing.asPxString()}
              height={{
                md: mainSectionChildSizes[0].asPxString(),
                base: "auto",
              }}
              overflowX="auto"
              whiteSpace="nowrap"
            >
              <RowOnDesktopColumnOnMobile
                expand
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                p={4}
              >
                <Column
                  mainAxisAlignment="center"
                  crossAxisAlignment={{ md: "flex-start", base: "center" }}
                  height="100%"
                  mb={{ md: 0, base: 4 }}
                >
                  <Heading fontSize={{ md: 27, base: "xl" }} lineHeight={1.25}>
                    {poolName}
                  </Heading>
                  <Text fontSize="xs">{poolCaption}</Text>
                </Column>

                <DepositButton onClick={authedOpenModal} />
              </RowOnDesktopColumnOnMobile>
            </DashboardBox>

            {/* Chart */}
            <DashboardBox
              width="100%"
              mb={mainSectionSpacing.asPxString()}
              height={mainSectionChildSizes[1].asPxString()}
              position="relative"
            >
              {hasNotDeposited ? (
                <DepositButton
                  zIndex={1}
                  transform="translate(-50%, -50%)"
                  position="absolute"
                  top="50%"
                  left="50%"
                  onClick={authedOpenModal}
                />
              ) : null}

              <Box opacity={hasNotDeposited ? 0.2 : 1} height="100%">
                <UserStatsAndChart
                  hasNotDeposited={hasNotDeposited}
                  size={mainSectionChildSizes[1].asNumber()}
                  balance={formattedBalance!}
                />
              </Box>
            </DashboardBox>

            {/* Recent Trades and Allocation */}
            <RowOnDesktopColumnOnMobile
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              height={{
                md: mainSectionChildSizes[2].asPxString(),
                base: "auto",
              }}
              width="100%"
            >
              <DashboardBox
                height={mainSectionChildSizes[2].asPxString()}
                width={
                  poolType === Pool.ETH ? "100%" : { md: "50%", base: "100%" }
                }
                mb={{ md: 0, base: 4 }}
                pt={4}
                px={4}
              >
                <RecentTrades />
              </DashboardBox>

              {poolType !== Pool.ETH ? (
                <DashboardBox
                  height={mainSectionChildSizes[2].asPxString()}
                  width={{ md: "50%", base: "100%" }}
                  ml={{
                    md: 4,
                    base: 0,
                  }}
                  pt={4}
                  px={4}
                >
                  <TokenAllocation />
                </DashboardBox>
              ) : null}
            </RowOnDesktopColumnOnMobile>
          </Column>

          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            flexShrink={0}
            height={{ md: "100%", base: "auto" }}
            width={{ md: "260px", base: "100%" }}
            pt={{ md: 0, base: 4 }}
            pl={{ md: 4, base: 0 }}
          >
            <DashboardBox
              width="100%"
              mb={statsSidebarSpacing.asPxString()}
              height={statsSidebarChildSizes[0].asPxString()}
              bg="#FFFFFF"
              color="#000000"
            >
              <CurrentAPY />
            </DashboardBox>

            <DashboardBox
              width="100%"
              mb={statsSidebarSpacing.asPxString()}
              height={statsSidebarChildSizes[1].asPxString()}
              p={4}
            >
              <APYStats />
            </DashboardBox>

            <DashboardBox
              width="100%"
              mb={statsSidebarSpacing.asPxString()}
              height={statsSidebarChildSizes[2].asPxString()}
              pt={4}
              px={4}
            >
              <StrategyAllocation />
            </DashboardBox>

            <DashboardBox
              width="100%"
              height={statsSidebarChildSizes[3].asPxString()}
              mb={statsSidebarSpacing.asPxString()}
              pt={4}
              px={4}
            >
              <MonthlyReturns />
            </DashboardBox>

            <DashboardBox
              width="100%"
              height={statsSidebarChildSizes[4].asPxString()}
            >
              <TransactionHistory />
            </DashboardBox>
          </Column>
        </RowOnDesktopColumnOnMobile>
      </Column>
    </>
  );
};

const CurrentAPY = () => {
  const { t } = useTranslation();

  const poolType = usePoolType();

  const poolAPY = usePoolAPY(poolType);

  return (
    <Row expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading
        mt="5px"
        fontFamily={`'Baloo 2', ${theme.fonts.heading}`}
        fontSize="54px"
        fontWeight="extrabold"
      >
        {poolAPY ? (
          (poolAPY.startsWith("0.") ? poolAPY : poolAPY.slice(0, -1)) + "%"
        ) : (
          <Spinner size="lg" mr={4} />
        )}
      </Heading>
      <Text ml={3} width="65px" fontSize="sm" textTransform="uppercase">
        {t("Current APY")}
      </Text>
    </Row>
  );
};

const APYStats = () => {
  const { t } = useTranslation();

  const pool = usePoolType();

  const { rari } = useRari();

  const {
    data: apys,
    isLoading: areAPYsLoading,
    isError,
  } = useQuery(pool + " monthly and weekly apys", async () => {
    const [monthRaw, weekRaw, rgtAPR]: [BN, BN, string] = await Promise.all([
      getSDKPool({
        rari,
        pool,
      }).apy.getApyOverTime(
        Math.floor((Date.now() - millisecondsPerDay * 30) / 1000)
      ),
      getSDKPool({
        rari,
        pool,
      }).apy.getApyOverTime(
        Math.floor((Date.now() - millisecondsPerDay * 7) / 1000)
      ),
      fetchRGTAPR(rari),
    ]);

    const month = parseFloat(
      rari.web3.utils.fromWei(monthRaw.mul(rari.web3.utils.toBN(100)))
    ).toFixed(1);

    const week = parseFloat(
      rari.web3.utils.fromWei(weekRaw.mul(rari.web3.utils.toBN(100)))
    ).toFixed(1);

    return { month, week, rgtAPR };
  });

  return (
    <Column
      expand
      mainAxisAlignment="space-between"
      crossAxisAlignment="flex-start"
    >
      <Heading lineHeight={1} size="xs">
        {t("APY Based On Returns From")}:
      </Heading>

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="100%"
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontSize="sm">
            {t("This Month")}:{" "}
            <b>{isError ? "🚫" : areAPYsLoading ? "?" : apys!.month}%</b>
          </Text>

          {/* <Text fontWeight="bold" textAlign="center">
            <SimpleTooltip label={t("Extra yield from $RGT")}>
              <span>
                + ({areAPYsLoading ? "?" : apys!.rgtAPR}%{" "}
                <Image display="inline" src={SmallRGTLogo} boxSize="20px" />)
              </span>
            </SimpleTooltip>
          </Text> */}
        </Row>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
        >
          <Text fontSize="sm">
            {t("This Week")}:{" "}
            <b>{isError ? "🚫" : areAPYsLoading ? "?" : apys!.week}%</b>
          </Text>

          {/* <Text fontWeight="bold" textAlign="center">
            <SimpleTooltip label={t("Extra yield from $RGT")}>
              <span>
                + ({areAPYsLoading ? "?" : apys!.rgtAPR}%{" "}
                <Image display="inline" src={SmallRGTLogo} boxSize="20px" />)
              </span>
            </SimpleTooltip>
          </Text> */}
        </Row>
      </Column>
    </Column>
  );
};

const MonthlyReturns = () => {
  const ethPoolAPY = usePoolAPY(Pool.ETH);
  const usdcPoolAPY = usePoolAPY(Pool.USDC);
  const daiPoolAPY = usePoolAPY(Pool.DAI);
  const yieldPoolAPY = usePoolAPY(Pool.YIELD);

  const { poolName: ethPoolName } = usePoolInfo(Pool.ETH);
  const { poolName: usdcPoolName } = usePoolInfo(Pool.USDC);
  const { poolName: daiPoolName } = usePoolInfo(Pool.DAI);
  const { poolName: yieldPoolName } = usePoolInfo(Pool.YIELD);


  const returns =
    ethPoolAPY && daiPoolAPY && yieldPoolAPY && usdcPoolAPY
      ? {
          [ethPoolName]: parseFloat(ethPoolAPY!),
          [usdcPoolName]: parseFloat(usdcPoolAPY!),
          [daiPoolName]: parseFloat(daiPoolAPY!),
          [yieldPoolName]: parseFloat(yieldPoolAPY!),
        }
      : null;

  const sortedEntries = returns
    ? Object.entries(returns)
        // Sort descendingly by highest APY
        .sort((a, b) => b[1] - a[1])
    : null;

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="hidden"
    >
      <Heading size="sm" lineHeight={1} mb={3}>
        {t("Compare Returns")}
      </Heading>

      {sortedEntries ? (
        sortedEntries.map(([key, value]) => {
          const highestAPY = sortedEntries[0][1];
          return (
            <Column
              key={key}
              width="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
              mb={3}
            >
              <Row
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                width="100%"
                mb={1}
              >
                <Text color="#CACACA" fontSize={12}>
                  {key}
                </Text>
                <Text color="#CACACA" fontSize={12}>
                  {value ?? "?"}%
                </Text>
              </Row>

              <ProgressBar
                percentageFilled={
                  // Fill it relative to the highest APY
                  value / highestAPY
                }
              />
            </Column>
          );
        })
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

const TokenAllocation = () => {
  const { rari } = useRari();
  const poolType = usePoolType();

  const { data: allocations } = useQuery(
    poolType + " currencyAllocations",
    async () => {
      const currencyAllocations: {
        [key: string]: BN;
      } = await getSDKPool({
        rari,
        pool: poolType,
      }).allocations.getRawCurrencyAllocations();

      let dollarAmountAllocations: { [key: string]: number } = {};

      Object.keys(currencyAllocations).forEach((symbol) => {
        dollarAmountAllocations[symbol] =
          parseFloat(currencyAllocations[symbol].toString()) /
          10 ** tokens[symbol].decimals;
      });

      return dollarAmountAllocations;
    }
  );

  const sortedEntries = allocations
    ? Object.entries(allocations)
        // Sort descendingly by the largest
        .sort((a, b) => b[1] - a[1])
    : null;

  const maxAmount = (() => {
    if (sortedEntries) {
      return sortedEntries.reduce((a, b) => {
        return a + b[1];
      }, 0);
    } else {
      return null;
    }
  })();

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="scroll"
    >
      <Heading size="md" lineHeight={1}>
        {t("Token Allocation")}
      </Heading>

      {sortedEntries && maxAmount ? (
        sortedEntries.slice(0, 4).map(([symbol, amount]) => {
          const percentageOfMax = amount / maxAmount;

          return (
            <Column
              key={symbol}
              width="100%"
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
              mb="10px"
            >
              <Text color="#CACACA" fontSize={10}>
                {symbol}
              </Text>
              <ProgressBar percentageFilled={percentageOfMax} />
            </Column>
          );
        })
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

const RecentTrades = () => {
  const { rari } = useRari();

  const poolType = usePoolType();

  const { data: allocationHistory } = useQuery(
    poolType + " allocationHistory",
    async () => {
      const currentBlock = await rari.web3.eth.getBlockNumber();

      const history: any[] = await getSDKPool({
        rari,
        pool: poolType,
      }).history.getPoolAllocationHistory(0, currentBlock);

      return history
        .filter((event) => {
          return event.returnValues.action === "0";
        })
        .slice(-40)
        .reverse()
        .map((event) => {
          const token =
            poolType === Pool.ETH
              ? "ETH"
              : currencyCodesByHashes[
                  event.returnValues.currencyCode as string
                ];

          const pool = getSDKPool({ rari, pool: poolType }).allocations.POOLS[
            event.returnValues.pool
          ];

          const amount = smallStringUsdFormatter(
            (
              parseFloat(event.returnValues.amount) /
              10 ** tokens[token].decimals
            ).toString()
          );

          return {
            token,
            amount: poolType === Pool.ETH ? amount.replace("$", "") : amount,
            pool,
            blockNumber: event.blockNumber,
            hash: event.transactionHash,
            logIndex: event.logIndex,
          };
        });
    }
  );

  const { t } = useTranslation();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      expand
      overflowY="auto"
    >
      <Heading size="md" lineHeight={1} mb={2}>
        {t("Recent Trades")}
      </Heading>

      {allocationHistory ? (
        allocationHistory!.map((event, index) => (
          <Box key={event!.hash + event!.logIndex} width="100%">
            <Text fontSize="sm" color="#aba6a6">
              <Link
                isExternal
                href={`https://www.etherscan.io/tx/${event!.hash}`}
              >
                Block #{event!.blockNumber}:
              </Link>
              <b> {t("Moved")} </b>
              {event!.amount} <b>{event!.token}</b> to
              <b> {event!.pool}</b>
            </Text>
            {index !== allocationHistory!.length - 1 ? (
              <Divider borderColor="#616161" my={1} />
            ) : (
              <Box height="10px" />
            )}
          </Box>
        ))
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

const TransactionHistory = () => {
  const { t } = useTranslation();

  const poolType = usePoolType();

  const { rari, address } = useRari();

  const poolAddress: string = getSDKPool({ rari, pool: poolType }).contracts //@ts-ignore
    .RariFundToken.options.address;

  return (
    <Link
      href={`https://etherscan.io/token/${poolAddress}?a=${address}`}
      isExternal
    >
      <Column
        expand
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        textAlign="center"
        fontWeight="bold"
        fontSize="md"
      >
        <ExternalLinkIcon boxSize="18px" mb="6px" />
        {t("View Transaction History")}
      </Column>
    </Link>
  );
};

const DepositButton = (
  props: BoxProps & {
    onClick: () => any;
  }
) => {
  const { t } = useTranslation();

  return (
    <GlowingButton
      label={t("Deposit")}
      width="170px"
      height="50px"
      {...props}
    />
  );
};

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar, AvatarGroup, Link, Text } from "@chakra-ui/react";
import { Center, Column, Row } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter } from "../../../utils/bigUtils";

import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

import { Link as RouterLink } from "react-router-dom";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";

const FusePoolsPage = React.memo(
  ({ onlyMyPools }: { onlyMyPools?: boolean }) => {
    const { isAuthed } = useRari();

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

          <FuseStatsBar />

          <FuseTabBar />

          <DashboardBox
            width="100%"
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            height={isMobile ? "auto" : "600px"}
          >
            <PoolList
              filter={
                onlyMyPools
                  ? (test, test1, test2) => {
                      //TODO
                      return true;
                    }
                  : undefined
              }
            />
          </DashboardBox>
        </Column>

        <CopyrightSpacer forceShow />
      </>
    );
  }
);

export default FusePoolsPage;

const PoolList = React.memo(
  ({ filter }: { filter?: (some: any, data: any, todo: any) => boolean }) => {
    const { t } = useTranslation();

    return (
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          height="45px"
          width="100%"
          flexShrink={0}
          pl={4}
          pr={1}
        >
          <Text fontWeight="bold" width="40%">
            {t("Pool Assets")}
          </Text>

          <Row
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            width="15%"
          >
            <Text fontWeight="bold" textAlign="center">
              {t("Total Supplied")}
            </Text>
            <ChevronDownIcon ml={1} />
          </Row>

          <Text fontWeight="bold" width="15%" textAlign="center">
            {t("Pool Number")}
          </Text>

          <Text fontWeight="bold" width="15%" textAlign="center">
            {t("Total Borrowed")}
          </Text>

          <Text fontWeight="bold" width="15%" textAlign="center">
            {t("Collateral Ratio")}
          </Text>
        </Row>

        <ModalDivider />

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          pl={4}
          pr={1}
          pt={2}
          overflow="scroll"
        >
          <PoolRow
            mt={2}
            tokens={[
              {
                symbol: "UNI",
                icon:
                  "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
              },

              {
                symbol: "SUSHI",
                icon:
                  "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png?1606986688",
              },

              {
                symbol: "ZRX",
                icon:
                  "https://assets.coingecko.com/coins/images/863/small/0x.png?1547034672",
              },

              {
                symbol: "1INCH",
                icon:
                  "https://assets.coingecko.com/coins/images/13469/small/1inch-token.png?1608803028",
              },
            ]}
            poolNumber={4}
            tvl={163712}
            borrowed={21510}
            collatRatio={55.5}
          />

          <PoolRow
            mt={2}
            tokens={[
              {
                symbol: "AAVE",
                icon:
                  "https://assets.coingecko.com/coins/images/12645/small/AAVE.png?1601374110",
              },

              {
                symbol: "COMP",
                icon:
                  "https://assets.coingecko.com/coins/images/10775/small/COMP.png?1592625425",
              },
            ]}
            poolNumber={3}
            tvl={145600}
            borrowed={26510}
            collatRatio={55.5}
          />

          <PoolRow
            mt={2}
            tokens={[
              {
                symbol: "RGT",
                icon:
                  "https://assets.coingecko.com/coins/images/12900/small/rgt_logo.png?1603340632",
              },

              {
                symbol: "SFI",
                icon:
                  "https://assets.coingecko.com/coins/images/13117/small/sfi_red_250px.png?1606020144",
              },
            ]}
            poolNumber={1}
            tvl={100000}
            borrowed={1000}
            collatRatio={70}
          />

          <PoolRow
            mt={2}
            tokens={[
              {
                symbol: "GRT",
                icon:
                  "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png?1608145566",
              },

              {
                symbol: "LINK",
                icon:
                  "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png?1547034700",
              },
            ]}
            poolNumber={2}
            tvl={12000}
            borrowed={2000}
            collatRatio={65.2}
          />
        </Column>
      </Column>
    );
  }
);

const PoolRow = React.memo(
  ({
    tokens,
    poolNumber,
    tvl,
    borrowed,
    collatRatio,
    mt,
  }: {
    tokens: { symbol: string; icon: string }[];
    poolNumber: number;
    tvl: number;
    borrowed: number;
    collatRatio: number;
    mt?: number | string;
  }) => {
    return (
      <Link
        /* @ts-ignore */
        as={RouterLink}
        width="100%"
        className="no-underline"
        to={"/fuse/pool/" + poolNumber}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
          height="30px"
          mt={mt ?? 0}
        >
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height="100%"
            width="40%"
          >
            <AvatarGroup size="xs" max={16}>
              {tokens.map(({ symbol, icon }) => {
                return (
                  <Avatar
                    key={symbol}
                    bg="#FFF"
                    borderWidth="1px"
                    name={symbol}
                    src={icon}
                  />
                );
              })}
            </AvatarGroup>

            <Text ml={2}>
              {tokens.map(({ symbol }, index, array) => {
                return symbol + (index !== array.length - 1 ? " / " : "");
              })}
            </Text>
          </Row>

          <Center height="100%" width="15%">
            <b>{smallUsdFormatter(tvl)}</b>
          </Center>

          <Center height="100%" width="15%">
            <b>{poolNumber}</b>
          </Center>

          <Center height="100%" width="15%">
            <b>{smallUsdFormatter(borrowed)}</b>
          </Center>
          <Center height="100%" width="15%">
            <b>{collatRatio.toFixed(1)}%</b>
          </Center>
        </Row>
      </Link>
    );
  }
);

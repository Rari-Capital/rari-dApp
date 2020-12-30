import { SmallAddIcon } from "@chakra-ui/icons";
import { Avatar, AvatarGroup, Heading, Input, Text } from "@chakra-ui/react";
import {
  Center,
  Column,
  Row,
  RowOrColumn,
  useWindowSize,
} from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../context/RariContext";
import { smallUsdFormatter } from "../../../utils/bigUtils";
import CaptionedStat from "../../shared/CaptionedStat";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { ModalDivider } from "../../shared/Modal";

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};

const FusePoolsPage = React.memo(() => {
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

        <StatsBar />

        <DashboardBox
          width="100%"
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height={isMobile ? "auto" : "65px"}
        >
          <TabBar />
        </DashboardBox>

        <DashboardBox
          width="100%"
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          height={isMobile ? "auto" : "600px"}
        >
          <PoolList />
        </DashboardBox>
      </Column>

      <CopyrightSpacer forceShow />
    </>
  );
});

export default FusePoolsPage;

const StatsBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  return (
    <RowOrColumn
      width="100%"
      isRow={!isMobile}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "120px"}
    >
      <DashboardBox width="100%" height={isMobile ? "auto" : "100%"}>
        <Column
          expand
          mainAxisAlignment="center"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
          textAlign={isMobile ? "center" : "left"}
          p={4}
        >
          <Heading size="lg">{t("Fuse")}</Heading>

          {t(
            "Isolated money markets you can use today that will power the decentralized future of tommorow."
          )}
        </Column>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "245px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
      >
        <Center expand p={4}>
          <CaptionedStat
            crossAxisAlignment="center"
            captionFirst={false}
            statSize="3xl"
            captionSize="sm"
            stat={"$75,000.00"}
            caption={t("Total Supply Balance")}
          />
        </Center>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "245px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
      >
        <Center expand p={4}>
          <CaptionedStat
            crossAxisAlignment="center"
            captionFirst={false}
            statSize="3xl"
            captionSize="sm"
            stat={"$21,000.00"}
            caption={t("Total Borrow Balance")}
          />
        </Center>
      </DashboardBox>
    </RowOrColumn>
  );
});

const TabBar = React.memo(() => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  return (
    <RowOrColumn
      isRow={!isMobile}
      expand
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      p={4}
    >
      <DashboardBox height="35px">
        <Row
          pl={2}
          expand
          crossAxisAlignment="center"
          mainAxisAlignment="flex-start"
          fontWeight="bold"
        >
          {t("Search:")}
          <Input
            height="100%"
            ml={2}
            placeholder="RGT, USDC, ETH, USDT"
            variant="filled"
            size="sm"
            _placeholder={{ color: "#FFF" }}
            _focus={{ bg: "#282727" }}
            _hover={{ bg: "#4d4b4b" }}
            bg="#282727"
            borderRadius="0px 9px 9px 0px"
          />
        </Row>
      </DashboardBox>

      <DashboardBox
        height="35px"
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        as="button"
      >
        <Center expand px={2} fontWeight="bold">
          My Pools
        </Center>
      </DashboardBox>

      <DashboardBox
        height="35px"
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        bg="#FFF"
        color="#000"
        as="button"
      >
        <Center expand px={2} fontWeight="bold">
          {t("Public Pools")}
        </Center>
      </DashboardBox>

      <DashboardBox
        height="35px"
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        as="button"
      >
        <Center expand px={2} fontWeight="bold">
          {t("Private Pools")}
        </Center>
      </DashboardBox>

      <DashboardBox
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : "auto"}
        height="35px"
        as="button"
      >
        <Center expand pl={2} pr={3} fontWeight="bold">
          <SmallAddIcon mr={1} /> {t("New Pool")}
        </Center>
      </DashboardBox>
    </RowOrColumn>
  );
});

const PoolList = React.memo(() => {
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
        px={4}
      >
        <Text fontWeight="bold" width="30%">
          {t("Pool Assets")}
        </Text>

        <Text fontWeight="bold" width="18%" textAlign="center">
          {t("Pool Number")}
        </Text>

        <Text fontWeight="bold" width="18%" textAlign="center">
          {t("Total Supplied")}
        </Text>

        <Text fontWeight="bold" width="18%" textAlign="center">
          {t("Total Borrowed")}
        </Text>

        <Text fontWeight="bold" width="18%" textAlign="center">
          {t("Collateral Ratio")}
        </Text>
      </Row>

      <ModalDivider />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        mt={4}
        px={4}
      >
        <PoolRow
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
          ]}
          poolNumber={4}
          tvl={145600}
          borrowed={26510}
          collatRatio={55.5}
        />
      </Column>
    </Column>
  );
});

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
          width="30%"
        >
          <AvatarGroup size="xs" max={16}>
            {tokens.map(({ symbol, icon }) => {
              return (
                <Avatar bg="#FFF" borderWidth="1px" name={symbol} src={icon} />
              );
            })}
          </AvatarGroup>

          <Text ml={2}>
            {tokens.map(({ symbol }, index, array) => {
              return symbol + (index !== array.length - 1 ? " / " : "");
            })}
          </Text>
        </Row>
        <Center height="100%" width="18%">
          <b>{poolNumber}</b>
        </Center>
        <Center height="100%" width="18%">
          <b>{smallUsdFormatter(tvl)}</b>
        </Center>
        <Center height="100%" width="18%">
          <b>{smallUsdFormatter(borrowed)}</b>
        </Center>
        <Center height="100%" width="18%">
          <b>{collatRatio.toFixed(1)}%</b>
        </Center>
      </Row>
    );
  }
);

import { Heading } from "@chakra-ui/react";
import { RowOrColumn, Column, Center } from "buttered-chakra";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter, usdFormatter } from "../../../utils/bigUtils";
import { fetchFuseTVL } from "../../../utils/fetchTVL";
import CaptionedStat from "../../shared/CaptionedStat";
import DashboardBox from "../../shared/DashboardBox";

import { APYWithRefreshMovingStat } from "../../shared/MovingStat";

const FuseStatsBar = () => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { address, isAuthed, fuse, rari } = useRari();

  const fetchFuseNumberTVL = async () => {
    const tvlETH = await fetchFuseTVL(fuse);

    const ethPrice: number = rari.web3.utils.fromWei(
      await rari.getEthUsdPriceBN()
    ) as any;

    return (parseInt(tvlETH.toString()) / 1e18) * ethPrice;
  };

  const { data: totalBorrowAndSupply } = useQuery(
    address + " totalBorrowAndSupply",
    async () => {
      const [{ 0: supplyETH, 1: borrowETH }, ethPrice] = await Promise.all([
        fuse.contracts.FusePoolLens.methods
          .getUserSummary(address)
          .call({ gas: 1e18 }),

        rari.web3.utils.fromWei(await rari.getEthUsdPriceBN()) as any,
      ]);

      return {
        totalSuppliedUSD: (supplyETH / 1e18) * ethPrice,
        totalBorrowedUSD: (borrowETH / 1e18) * ethPrice,
      };
    }
  );

  return (
    <RowOrColumn
      width="100%"
      isRow={!isMobile}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "120px"}
    >
      <DashboardBox
        width={isMobile ? "100%" : "100%"}
        height={isMobile ? "auto" : "100%"}
      >
        <Column
          expand
          mainAxisAlignment="center"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
          textAlign={isMobile ? "center" : "left"}
          p={4}
        >
          <Heading size="lg">{t("Fuse")}</Heading>

          {t(
            "The first truly open interest rate protocol. Lend, borrow, and create isolated lending markets with unlimited flexibility."
          )}
        </Column>
      </DashboardBox>

      {isAuthed &&
      totalBorrowAndSupply &&
      totalBorrowAndSupply.totalSuppliedUSD > 0 ? (
        <>
          <StatBox>
            <CaptionedStat
              crossAxisAlignment="center"
              captionFirst={false}
              statSize="3xl"
              captionSize="sm"
              stat={
                totalBorrowAndSupply
                  ? smallUsdFormatter(totalBorrowAndSupply.totalSuppliedUSD)
                  : "$?"
              }
              caption={t("Total Supply Balance")}
            />
          </StatBox>

          <StatBox>
            <CaptionedStat
              crossAxisAlignment="center"
              captionFirst={false}
              statSize="3xl"
              captionSize="sm"
              stat={
                totalBorrowAndSupply
                  ? smallUsdFormatter(totalBorrowAndSupply.totalBorrowedUSD)
                  : "$?"
              }
              caption={t("Total Borrow Balance")}
            />
          </StatBox>
        </>
      ) : (
        <StatBox width={isMobile ? "100%" : "480px"}>
          <APYWithRefreshMovingStat
            formatStat={usdFormatter}
            fetchInterval={40000}
            loadingPlaceholder="$?"
            apyInterval={100}
            fetch={fetchFuseNumberTVL}
            queryKey={"fuseTVL"}
            apy={0.15}
            statSize="3xl"
            captionSize="xs"
            caption={t("Total Value Locked Across Fuse")}
            crossAxisAlignment="center"
            captionFirst={false}
          />
        </StatBox>
      )}
    </RowOrColumn>
  );
};

export default FuseStatsBar;

const StatBox = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: any;
}) => {
  const isMobile = useIsSmallScreen();

  return (
    <DashboardBox
      width={isMobile ? "100%" : "240px"}
      height={isMobile ? "auto" : "100%"}
      flexShrink={0}
      mt={isMobile ? 4 : 0}
      ml={isMobile ? 0 : 4}
      {...others}
    >
      <Center expand p={4}>
        {children}
      </Center>
    </DashboardBox>
  );
};

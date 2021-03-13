import { Heading } from "@chakra-ui/react";
import { RowOrColumn, Column, Center } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter } from "../../../utils/bigUtils";
import CaptionedStat from "../../shared/CaptionedStat";
import DashboardBox from "../../shared/DashboardBox";

const FuseStatsBar = () => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { address, fuse, rari } = useRari();

  const { data: totalBorrowAndSupply } = useQuery(
    address + " totalBorrowAndSupply",
    async () => {
      const [{ 0: supplyETH, 1: borrowETH }, ethPrice] = await Promise.all([
        fuse.contracts.FusePoolLens.methods.getUserSummary(address).call(),

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
            "Isolated money markets you can use today that will power the decentralized future of tomorrow."
          )}
        </Column>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "240px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? 4 : 0}
        ml={isMobile ? 0 : 4}
      >
        <Center expand p={4}>
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
        </Center>
      </DashboardBox>
      <DashboardBox
        width={isMobile ? "100%" : "240px"}
        height={isMobile ? "auto" : "100%"}
        flexShrink={0}
        mt={isMobile ? 4 : 0}
        ml={isMobile ? 0 : 4}
      >
        <Center expand p={4}>
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
        </Center>
      </DashboardBox>
    </RowOrColumn>
  );
};

export default FuseStatsBar;

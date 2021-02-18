import { Heading } from "@chakra-ui/react";
import { RowOrColumn, Column, Center } from "buttered-chakra";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../../context/RariContext";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { smallUsdFormatter } from "../../../utils/bigUtils";
import CaptionedStat from "../../shared/CaptionedStat";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";

const FuseStatsBar = () => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { address, fuse, rari } = useRari();

  const { data: totalBorrowAndSupply } = useQuery(
    address + " totalBorrowAndSupply",
    async () => {
      const {
        0: ids,
        1: fusePools,
        2: totalSuppliedETH,
        3: totalBorrowedETH,
      } = await fuse.contracts.FusePoolDirectory.methods
        .getPoolsBySupplierWithData(address)
        .call();

      const ethPrice = rari.web3.utils.fromWei(await rari.getEthUsdPriceBN());

      let totalSuppliedUSD = 0;
      let totalBorrowedUSD = 0;

      for (let id = 0; id < ids.length; id++) {
        totalSuppliedUSD +=
          (totalSuppliedETH[id] / 1e18) * parseFloat(ethPrice);

        totalBorrowedUSD = (totalBorrowedETH[id] / 1e18) * parseFloat(ethPrice);
      }

      return { totalSuppliedUSD, totalBorrowedUSD };
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
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
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
        mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
        ml={isMobile ? 0 : DASHBOARD_BOX_SPACING.asPxString()}
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

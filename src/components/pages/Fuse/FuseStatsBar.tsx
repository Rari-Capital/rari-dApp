import { Heading } from "@chakra-ui/react";
import { RowOrColumn, Column, Center } from "utils/buttered-chakra";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { smallUsdFormatter } from "utils/bigUtils";
import CaptionedStat from "components/shared/CaptionedStat";
import DashboardBox from "components/shared/DashboardBox";

import { useFuseTVL, fetchFuseNumberTVL } from "hooks/fuse/useFuseTVL";
import { useFuseTotalBorrowAndSupply } from "hooks/fuse/useFuseTotalBorrowAndSupply";

import { APYWithRefreshMovingStat } from "components/shared/MovingStat";

const FuseStatsBar = () => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { isAuthed, fuse, rari } = useRari();

  const { data: fuseTVL } = useFuseTVL();
  const { data: totalBorrowAndSupply } = useFuseTotalBorrowAndSupply();

  return (
    <RowOrColumn
      width="100%"
      isRow={!isMobile}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height={isMobile ? "auto" : "125px"}
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
          fontSize="sm"
        >
          <Heading size="lg" mb="2px">
            {t("Fuse")}
          </Heading>

          {t(
            "There's {{tvl}} supplied to Fuse, the first truly open interest rate protocol. Lend, borrow, and create isolated lending markets with unlimited flexibility.",
            { tvl: fuseTVL ? smallUsdFormatter(fuseTVL) : "?" }
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
              caption={t("Your Supply Balance")}
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
              caption={t("Your Borrow Balance")}
            />
          </StatBox>
        </>
      ) : (
        <StatBox width={isMobile ? "100%" : "496px"}>
          <APYWithRefreshMovingStat
            formatStat={smallUsdFormatter}
            fetchInterval={40000}
            loadingPlaceholder="$?"
            apyInterval={100}
            fetch={() => fetchFuseNumberTVL(rari, fuse)}
            queryKey={"fuseTVL"}
            apy={0.15}
            statSize="3xl"
            captionSize="xs"
            caption={t("Total Value Supplied Across Fuse")}
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

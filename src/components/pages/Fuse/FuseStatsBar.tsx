import { Heading, Text } from "@chakra-ui/react";
import { RowOrColumn, Column, Center, Row } from "utils/chakraUtils";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { smallUsdFormatter } from "utils/bigUtils";
import CaptionedStat from "components/shared/CaptionedStat";
import DashboardBox from "components/shared/DashboardBox";

import { fetchFuseNumberTVL } from "hooks/fuse/useFuseTVL";
import { useFuseTotalBorrowAndSupply } from "hooks/fuse/useFuseTotalBorrowAndSupply";

import { APYWithRefreshMovingStat } from "components/shared/MovingStat";
import { FusePoolData } from "utils/fetchFusePoolData";
import { CheckCircleIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { SimpleTooltip } from "components/shared/SimpleTooltip";

const FuseStatsBar = ({ data }: { data?: FusePoolData }) => {
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { isAuthed, fuse, rari } = useRari();

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
        flexBasis="60%"
      >
        <Column
          expand
          mainAxisAlignment="center"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
          textAlign={isMobile ? "center" : "left"}
          p={4}
          fontSize="sm"
        >
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            mb="2px"
          >
            {/* Title */}
            {!!data ? (
              <WhitelistedIcon isWhitelisted={data.isAdminWhitelisted} mb={1} />
            ) : null}
            <Heading size="lg" isTruncated>
              {data?.name ?? "Fuse"}
            </Heading>
          </Row>

          {/* Description */}
          {!!data ? (
            <Text>
              This pool has{" "}
              <span style={{ fontWeight: "bold" }}>
                {smallUsdFormatter(data.totalSuppliedUSD)} supplied{" "}
              </span>{" "}
              across{" "}
              <span style={{ fontWeight: "bold" }}>
                {data.assets.length} {" "}
                assets.
              </span>{" "}
              Fuse is the first truly open interest rate protocol. Lend, borrow,
              and create isolated lending markets with unlimited flexibility.
            </Text>
          ) : (
            <Text>
              Fuse is the first truly open interest rate protocol. Lend, borrow,
              and create isolated lending markets with unlimited flexibility.
            </Text>
          )}
        </Column>
      </DashboardBox>

      <RowOrColumn
        isRow={!isMobile}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        flexBasis="40%"
        h="100%"
        w="100%"
      >
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
          <StatBox width={isMobile ? "100%" : "100%"}>
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
      width={isMobile ? "100%" : "100%"}
      height={isMobile ? "auto" : "100%"}
      flexShrink={1}
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

export const WhitelistedIcon = ({
  isWhitelisted,
  ...boxProps
}: {
  isWhitelisted: boolean;
  [x: string]: any;
}) => {
  return (
    <>
      <SimpleTooltip
        label={
          isWhitelisted
            ? "This pool is from a Whitelisted Admin"
            : "This pool is not from a whitelisted admin. Use with caution!"
        }
        placement="bottom-end"
      >
        {isWhitelisted ? (
          <CheckCircleIcon boxSize="20px" mr={3} {...boxProps} />
        ) : (
          <WarningTwoIcon
            boxSize="20px"
            mr={3}
            color="orange.300"
            {...boxProps}
          />
        )}
      </SimpleTooltip>
    </>
  );
};

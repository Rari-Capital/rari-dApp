import React, { useState, useCallback } from "react";
import { Text, Spinner, Box } from "@chakra-ui/core";
import { useWeb3 } from "../../context/Web3Context";

import { useContracts } from "../../context/ContractsContext";
import Chart from "react-apexcharts";

import { format1e18BigAsUSD, toBig } from "../../utils/bigUtils";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { WideLogo } from "../shared/Logos";
import { FundReturnChartOptions } from "../../utils/chartOptions";
import {
  Column,
  Center,
  Row,
  RowOnDesktopColumnOnMobile,
  useLockedViewHeight,
  useSpacedLayout,
  PixelSize,
  PercentageSize,
  PercentOnDesktopPixelOnMobileSize,
} from "buttered-chakra";
import CaptionedStat from "../shared/CaptionedStat";
import { useQuery } from "react-query";

const PreviewPortal = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useWeb3();

  const { windowHeight, isLocked } = useLockedViewHeight({ min: 650 });

  const {
    spacing: headerAndBodySpacing,
    childSizes: [headerSize, bodySize],
  } = useSpacedLayout({
    parentHeight: windowHeight.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PixelSize(65),
      new PercentageSize(0.7),
      // We have a 0 sized child here because it will now lower the size of the "100%" child
      // by accouting for padding below it, which is 15.
      new PixelSize(0),
    ],
  });

  const {
    spacing: mainSectionSpacing,
    childSizes: [chartSize, buttonsSize],
  } = useSpacedLayout({
    parentHeight: bodySize.asNumber(),
    spacing: DASHBOARD_BOX_SPACING.asNumber(),
    childSizes: [
      new PercentOnDesktopPixelOnMobileSize({
        percentageSize: 1.0,
        pixelSize: 420,
      }),
      new PixelSize(55),
    ],
  });

  const onLogin = useCallback(() => {
    setLoading(true);
    login().catch(() => setLoading(false));
  }, [setLoading, login]);

  return (
    <Column
      height={isLocked ? "100%" : { md: "100vh", xs: "100%" }}
      mainAxisAlignment={{ md: "center", xs: "flex-start" }}
      crossAxisAlignment="flex-start"
      color="#FFFFFF"
      px={{ md: "5vw", xs: DASHBOARD_BOX_SPACING.asPxString() }}
    >
      <Column
        height={headerSize.asPxString()}
        width="100%"
        mb={headerAndBodySpacing.asPxString()}
        mainAxisAlignment="flex-end"
        crossAxisAlignment="flex-start"
      >
        <WideLogo />
      </Column>

      <RowOnDesktopColumnOnMobile
        width="100%"
        height={{ md: bodySize.asPxString(), xs: "auto" }}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
      >
        <FundStats />
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          pl={{ md: DASHBOARD_BOX_SPACING.asPxString(), xs: 0 }}
          pt={{ md: 0, xs: DASHBOARD_BOX_SPACING.asPxString() }}
          width={{ md: "75%", xs: "100%" }}
          height="100%"
        >
          <DashboardBox
            height={chartSize.asPxString()}
            width="100%"
            color="#292828"
            overflow="hidden"
            px={1}
          >
            <FundPerformanceChart size={chartSize.asNumber()} />
          </DashboardBox>

          <Row
            mt={mainSectionSpacing.asPxString()}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height={buttonsSize.asPxString()}
            width="100%"
          >
            <DashboardBox
              as="button"
              onClick={onLogin}
              width="57%"
              height="100%"
            >
              <Center>
                {loading ? (
                  <Spinner />
                ) : (
                  <Text
                    textAlign="center"
                    fontWeight="bold"
                    fontSize={{ md: "xl", xs: "lg" }}
                  >
                    Connect Wallet
                  </Text>
                )}
              </Center>
            </DashboardBox>

            <DashboardBox
              ml={DASHBOARD_BOX_SPACING.asPxString()}
              as="button"
              onClick={() =>
                window.open(
                  "https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1"
                )
              }
              width="43%"
              height="100%"
            >
              <Center>
                <Text
                  fontWeight="bold"
                  fontSize={{ md: "xl", xs: "lg" }}
                  textAlign="center"
                >
                  Get Wallet
                </Text>
              </Center>
            </DashboardBox>
          </Row>
        </Column>
      </RowOnDesktopColumnOnMobile>
      <CopyrightSpacer forceShow={isLocked} />
    </Column>
  );
};

export default PreviewPortal;

const FundStats = React.memo(() => {
  const { RariFundManager } = useContracts();

  const { isLoading: isFundBalenceLoading, data: fundBalance } = useQuery(
    "getFundBalance",
    () =>
      RariFundManager.methods
        .getFundBalance()
        .call()
        .then((balance) => format1e18BigAsUSD(toBig(balance)))
  );

  return (
    <DashboardBox
      height="100%"
      width={{
        md: "25%",
        xs: "100%",
      }}
      p={DASHBOARD_BOX_SPACING.asPxString()}
    >
      <Column
        expand
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
      >
        <CaptionedStat
          crossAxisAlignment="center"
          caption="Today's APY"
          captionSize="xs"
          stat={"14.2%"}
          statSize="xl"
          captionFirst={false}
        />
        <CaptionedStat
          crossAxisAlignment="center"
          caption="Yearly APY"
          captionSize="xs"
          stat={"13.3%"}
          statSize="xl"
          captionFirst={false}
        />

        <CaptionedStat
          crossAxisAlignment="center"
          caption="Assets under management"
          captionSize="xs"
          stat={isFundBalenceLoading ? "$?" : fundBalance!}
          statSize="lg"
          captionFirst={false}
        />
      </Column>
    </DashboardBox>
  );
});

const FundPerformanceChart = React.memo(({ size }: { size: number }) => {
  const {
    childSizes: [statsSize, chartSize, bottomPadding],
  } = useSpacedLayout({
    parentHeight: size,
    spacing: 0,
    childSizes: [new PixelSize(90), new PercentageSize(1), new PixelSize(10)],
  });

  return (
    <>
      <Row
        color="#FFFFFF"
        mainAxisAlignment={{ md: "flex-start", xs: "center" }}
        crossAxisAlignment="center"
        px={DASHBOARD_BOX_SPACING.asPxString()}
        height={statsSize.asPxString()}
        width="100%"
      >
        <CaptionedStat
          crossAxisAlignment={{ md: "flex-start", xs: "center" }}
          caption="Performance beginning with $10,000 on 1/6/2020"
          captionSize="xs"
          stat={"$13,250.43"}
          statSize="xl"
        />
      </Row>

      <Box
        height={chartSize.asPxString()}
        overflow="hidden"
        mb={bottomPadding.asPxString()}
      >
        <Chart
          options={FundReturnChartOptions}
          type="line"
          width="100%"
          height="100%"
          series={[
            {
              name: "Rari",
              data: [
                { x: "August 1, 2019", y: 10000 },
                { x: "August 3, 2019", y: 11120 },
                { x: "August 4, 2019", y: 12451 },
                { x: "August 5, 2019", y: 14562 },
              ],
            },
            {
              name: "dYdX",
              data: [
                { x: "August 1, 2019", y: 10000 },
                { x: "August 3, 2019", y: 10012 },
                { x: "August 4, 2019", y: 10124 },
                { x: "August 5, 2019", y: 10321 },
              ],
            },
            {
              name: "Compound",
              data: [
                { x: "August 1, 2019", y: 10000 },
                { x: "August 3, 2019", y: 10230 },
                { x: "August 4, 2019", y: 11240 },
                { x: "August 5, 2019", y: 12112 },
              ],
            },
          ]}
        />
      </Box>
    </>
  );
});

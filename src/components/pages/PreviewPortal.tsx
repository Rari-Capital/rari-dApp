import React, { useState, useCallback } from "react";
import { Text, Spinner } from "@chakra-ui/core";
import { useWeb3 } from "../../context/Web3Context";

import { useContracts } from "../../context/ContractsContext";
import Chart from "react-apexcharts";
import { useContractMethod } from "../../hooks/useContractMethod";
import { format1e18BigAsUSD, toBig } from "../../utils/1e18";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { WideLogo } from "../shared/Logos";
import { FundReturnChartOptions } from "../../utils/chartOptions";
import {
  Column,
  Center,
  Row,
  RowOnDesktopColumnOnMobile,
  useMinLockedWindowHeight,
  useSpacedLayout,
  PixelSize,
  PercentageSize,
} from "buttered-chakra";
import CaptionedStat from "../shared/CaptionedStat";

const PreviewPortal = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useWeb3();

  const { windowHeight, isLocked } = useMinLockedWindowHeight(650);

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
    childSizes: [new PercentageSize(1.0), new PixelSize(55)],
  });

  const onLogin = useCallback(() => {
    setLoading(true);
    login().catch(() => setLoading(false));
  }, [setLoading, login]);

  return (
    <Column
      height={isLocked ? "100%" : { md: "100vh", xs: "100%" }}
      mainAxisAlignment="center"
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
            height={{ md: chartSize.asPxString(), xs: "420px" }}
            width="100%"
            p={2}
            color="#292828"
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
                    { x: "August 1, 2019", y: 54 },
                    { x: "August 3, 2019", y: 47 },
                    { x: "August 4, 2019", y: 64 },
                    { x: "August 5, 2019", y: 95 },
                  ],
                },
                {
                  name: "dYdX",
                  data: [
                    { x: "August 1, 2019", y: 21 },
                    { x: "August 3, 2019", y: 24 },
                    { x: "August 4, 2019", y: 26 },
                    { x: "August 5, 2019", y: 36 },
                  ],
                },
                {
                  name: "Compound",
                  data: [
                    { x: "August 1, 2019", y: 25 },
                    { x: "August 3, 2019", y: 38 },
                    { x: "August 4, 2019", y: 36 },
                    { x: "August 5, 2019", y: 41 },
                  ],
                },
              ]}
            />
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
              outline="none"
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
              outline="none"
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

const FundStats = () => {
  const { RariFundManager } = useContracts();

  const {
    isLoading: isFundBalenceLoading,
    data: fundBalance,
  } = useContractMethod("getFundBalance", () =>
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
};

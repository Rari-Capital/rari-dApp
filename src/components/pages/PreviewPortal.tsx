import React, { useState } from "react";
import { Text, Heading, Spinner } from "@chakra-ui/core";
import { useWeb3 } from "../../context/Web3Context";

import { useContracts } from "../../context/ContractsContext";
import Chart from "react-apexcharts";
import { useContractMethod } from "../../hooks/useContractMethod";
import { divBy1e18 } from "../../utils/1e18";
import DashboardBox from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { WideLogo } from "../shared/Logos";
import { FundReturnChartOptions } from "../../utils/chartOptions";
import {
  Column,
  Center,
  Row,
  RowOnDesktopColumnOnMobile,
  useMinLockedViewHeight,
} from "buttered-chakra";

const PreviewPortal = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useWeb3();

  const onRequestConnect = () => {
    setLoading(true);
    login()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const dashboardHeight = useMinLockedViewHeight(690, 0.85);

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      p={4}
      color="#FFFFFF"
    >
      <WideLogo />

      <RowOnDesktopColumnOnMobile
        width="100%"
        height={{ md: dashboardHeight + "px", xs: "auto" }}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
      >
        <FundStats />
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          pl={{ md: 4, xs: 0 }}
          pt={{ md: 0, xs: 4 }}
          width={{ md: "80%", xs: "100%" }}
          height="100%"
        >
          <DashboardBox
            height={{ md: "90%", xs: "420px" }}
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
            mt={4}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            height="10%"
            width="100%"
          >
            <DashboardBox
              as="button"
              outline="none"
              onClick={onRequestConnect}
              width="57%"
              height={{ md: "100%", xs: "70px" }}
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
              ml={4}
              as="button"
              outline="none"
              onClick={() =>
                window.open(
                  "https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1"
                )
              }
              width="43%"
              height={{ md: "100%", xs: "70px" }}
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
      <CopyrightSpacer />
    </Column>
  );
};

export default PreviewPortal;

const FundStats = () => {
  const { RariFundManager } = useContracts();

  const {
    isLoading: isFundBalenceLoading,
    data: fundBalence,
  } = useContractMethod(RariFundManager, "getFundBalance", (result: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(divBy1e18(result))
  );

  return (
    <DashboardBox
      height="100%"
      width={{
        md: "20%",
        xs: "100%",
      }}
      p={4}
    >
      <Column
        expand
        mainAxisAlignment="space-around"
        crossAxisAlignment="center"
      >
        <Column mainAxisAlignment="center" crossAxisAlignment="center" mb={4}>
          <Heading textAlign="center">14.2%</Heading>
          <Text
            textTransform="uppercase"
            textAlign="center"
            letterSpacing="wide"
            fontSize="xs"
          >
            Today's APY
          </Text>
        </Column>
        <Column mainAxisAlignment="center" crossAxisAlignment="center" mb={4}>
          <Heading textAlign="center">13.3%</Heading>
          <Text
            textTransform="uppercase"
            textAlign="center"
            letterSpacing="wide"
            fontSize="xs"
          >
            Yearly APY
          </Text>
        </Column>
        <Column mainAxisAlignment="center" crossAxisAlignment="center" mb={4}>
          <Heading textAlign="center" size="lg">
            {isFundBalenceLoading ? "$?" : fundBalence}
          </Heading>
          <Text
            textTransform="uppercase"
            textAlign="center"
            letterSpacing="wide"
            fontSize="xs"
          >
            Assets under management
          </Text>
        </Column>
      </Column>
    </DashboardBox>
  );
};

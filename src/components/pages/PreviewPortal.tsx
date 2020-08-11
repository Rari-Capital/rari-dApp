import React, { useState } from "react";
import { Flex, Stack, Text, Heading, Spinner } from "@chakra-ui/core";
import { useWeb3 } from "../../context/Web3Context";
import ReactFrappeChart from "react-frappe-charts-upgraded";

import { useContracts } from "../../context/ContractsContext";

import { useContractMethod } from "../../hooks/useContractMethod";
import { divBy1e18 } from "../../utils/1e18";
import DashboardBox from "../shared/DashboardBox";
import CopyrightSpacer from "../shared/CopyrightSpacer";
import { useMinLockedViewHeight } from "../../hooks/useWindowSize";
import { WideLogo } from "../shared/Logos";

const PreviewPortal = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useWeb3();

  const onRequestConnect = () => {
    setLoading(true);
    login()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const dashboardHeight = useMinLockedViewHeight(650, 0.85);

  return (
    <Flex flexDirection="column" alignItems="flex-start" p={4} color="#FFFFFF">
      <WideLogo />

      <Flex
        width="100%"
        height={{ md: dashboardHeight + "px", xs: "auto" }}
        flexDirection={{ md: "row", xs: "column" }}
      >
        <FundStats />
        <Flex
          pl={{ md: 4, xs: 0 }}
          pt={{ md: 0, xs: 4 }}
          flexDirection="column"
          width={{ md: "80%", xs: "100%" }}
        >
          <DashboardBox height={{ md: "90%", xs: "420px" }}>
            <ReactFrappeChart
              animate={false}
              type="line"
              colors={["red", "green", "#FFFFFF"]}
              axisOptions={{
                xAxisMode: "tick",
                yAxisMode: "tick",
                xIsSeries: 1,
              }}
              height={
                // If the window is in mobile mode:
                window.matchMedia("(max-width: 48em)").matches
                  ? // Set the chart as the height of its parent (which is 420)
                    420
                  : // Otherwise calculate the height dynamically
                    dashboardHeight * 0.9
              }
              lineOptions={{
                dotSize: 0,
                hideLine: 0,
                hideDots: 1,
                heatline: 0,
                regionFill: 0,
                areaFill: 0,
              }}
              data={{
                labels: [
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                  "Mon",
                  "Tue",
                ],

                datasets: [
                  {
                    name: "dYdX",
                    values: [18, 40, 30, 35, 8, 52, 17, 4, 9, 9],
                  },
                  {
                    name: "Compound",
                    values: [18, 9, 1, 2, 33, 44, 47, 14, 92, 91],
                  },

                  {
                    name: "Rari",
                    values: [90, 100, 120, 125, 126, 127, 128, 190, 200, 210],
                  },
                ],
              }}
            />
          </DashboardBox>

          <Flex pt={4} height="10%">
            <Stack isInline={true} spacing={4} w="100%">
              <DashboardBox
                as="button"
                outline="none"
                onClick={onRequestConnect}
                width="57%"
                height={{ md: "100%", xs: "70px" }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
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
              </DashboardBox>

              <DashboardBox
                as="button"
                outline="none"
                onClick={() =>
                  window.open(
                    "https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1"
                  )
                }
                width="43%"
                height={{ md: "100%", xs: "70px" }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Text
                  fontWeight="bold"
                  fontSize={{ md: "xl", xs: "lg" }}
                  textAlign="center"
                >
                  Get Wallet
                </Text>
              </DashboardBox>
            </Stack>
          </Flex>
        </Flex>
      </Flex>
      <CopyrightSpacer />
    </Flex>
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
      width={{
        md: "20%",
        xs: "100%",
      }}
    >
      <Stack
        width="100%"
        height="100%"
        justifyContent="space-around"
        alignItems="center"
        p={4}
      >
        <Stack spacing={1} justifyContent="center" alignItems="center">
          <Heading textAlign="center">14.2%</Heading>
          <Text
            textTransform="uppercase"
            textAlign="center"
            letterSpacing="wide"
            fontSize="xs"
          >
            Today's APR
          </Text>
        </Stack>
        <Stack spacing={1} justifyContent="center" alignItems="center">
          <Heading textAlign="center">13.3%</Heading>
          <Text
            textTransform="uppercase"
            textAlign="center"
            letterSpacing="wide"
            fontSize="xs"
          >
            Yearly APR
          </Text>
        </Stack>
        <Stack spacing={1} justifyContent="center" alignItems="center">
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
        </Stack>
      </Stack>
    </DashboardBox>
  );
};

// Chakra and UI
import {
    Box,
    Text,
    Spinner,
  } from "@chakra-ui/react";
  import {
    Center,
  } from "utils/chakraUtils";
  
// React
import { useTranslation } from "react-i18next";

// Hooks
import { TokenData } from "../../../../../hooks/useTokenData";


// Utils
import { FuseIRMDemoChartOptions } from "../../../../../utils/chartOptions";


// Libraries
import Chart from "react-apexcharts";


const IRMChart = ({
    curves,
    tokenData,
  }: {
    curves: any;
    tokenData: TokenData;
  }) => {
    const { t } = useTranslation();
    return (
      <Box
        height="170px"
        width="100%"
        color="#000000"
        overflow="hidden"
        pl={2}
        pr={3}
        className="hide-bottom-tooltip"
        flexShrink={0}
      >
        {curves ? (
          <Chart
            options={
              {
                ...FuseIRMDemoChartOptions,
                colors: ["#FFFFFF", tokenData.color! ?? "#282727"],
              } as any
            }
            type="line"
            width="100%"
            height="100%"
            series={[
              {
                name: "Borrow Rate",
                data: curves.borrowerRates,
              },
              {
                name: "Deposit Rate",
                data: curves.supplierRates,
              },
            ]}
          />
        ) : curves === undefined ? (
          <Center expand color="#FFF">
            <Spinner my={8} />
          </Center>
        ) : (
          <Center expand color="#FFFFFF">
            <Text>
              {t("No graph is available for this asset's interest curves.")}
            </Text>
          </Center>
        )}
      </Box>
    );
  };

export default IRMChart
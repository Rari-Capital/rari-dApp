/*  This is a dynamically imported component on client-side only */

import Chart from "react-apexcharts";
import { useTranslation } from 'next-i18next';
import { FuseUtilizationChartOptions } from "utils/chartOptions";

type AssetChartProps = {
  selectedAssetUtilization: any;
  data: any;
  selectedTokenData: any;
};

const AssetChart = ({
  selectedAssetUtilization,
  data,
  selectedTokenData,
}: AssetChartProps) => {
    const { t } = useTranslation()

  return (
    <Chart
      options={
        {
          ...FuseUtilizationChartOptions,
          annotations: {
            points: [
              {
                x: selectedAssetUtilization,
                y: data.borrowerRates[selectedAssetUtilization].y,
                marker: {
                  size: 6,
                  fillColor: "#FFF",
                  strokeColor: "#DDDCDC",
                },
              },
              {
                x: selectedAssetUtilization,
                y: data.supplierRates[selectedAssetUtilization].y,
                marker: {
                  size: 6,
                  fillColor: selectedTokenData?.color ?? "#A6A6A6",
                  strokeColor: "#FFF",
                },
              },
            ],
            xaxis: [
              {
                x: selectedAssetUtilization,
                label: {
                  text: t("Current Utilization"),
                  orientation: "horizontal",
                  style: {
                    background: "#121212",
                    color: "#FFF",
                  },
                },
              },
            ],
          },

          colors: ["#FFFFFF", selectedTokenData?.color ?? "#A6A6A6"],
        } as any
      }
      type="line"
      width="100%"
      height="100%"
      series={[
        {
          name: "Borrow Rate",
          data: data.borrowerRates,
        },
        {
          name: "Deposit Rate",
          data: data.supplierRates,
        },
      ]}
    />
  );
};

export default AssetChart;

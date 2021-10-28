/*  This is a dynamically imported component on client-side only */

import Chart from "react-apexcharts";
import { FuseIRMDemoChartOptions } from "utils/chartOptions";

type AddAssetChartProps = {
  tokenData: any;
  curves: any;
};

const AddAssetChart = ({ tokenData, curves }: AddAssetChartProps) => {
  return (
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
  );
};

export default AddAssetChart;

import { ApexOptions } from "apexcharts";
import { smallStringUsdFormatter } from "./bigUtils";

export const LineChartOptions: ApexOptions = {
  chart: {
    foreColor: "#a19f9f",
    animations: {
      enabled: false,
    },

    dropShadow: {
      // This looks nice, try it!
      enabled: false,
    },

    toolbar: {
      show: false,
    },

    selection: {
      enabled: false,
    },

    zoom: {
      enabled: false,
    },
  },

  stroke: {
    curve: "smooth",
  },

  colors: ["#FFFFFF", "#007D43", "#F83536"],

  grid: {
    yaxis: {
      lines: {
        show: false,
      },
    },
  },

  dataLabels: {
    enabled: false,
  },

  legend: {
    position: "top",
    horizontalAlign: "left",
    showForSingleSeries: false,
  },

  yaxis: {
    labels: {
      style: {
        fontSize: "13px",
      },
    },
  },
};

export const PoolReturnChartOptions: ApexOptions = {
  ...LineChartOptions,

  grid: {
    ...LineChartOptions.grid,
    padding: {
      bottom: -15,
    },
  },

  stroke: {
    lineCap: "round",
  },

  xaxis: {
    tickAmount: 12,
    labels: {
      style: {
        fontSize: "8px",
      },
    },
  },

  yaxis: {
    labels: {
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: number) {
        return "$" + parseFloat(value as any).toFixed(2);
      },
    },
  },
};

export const USDSelfReturnChartOptions: ApexOptions = {
  ...PoolReturnChartOptions,
  grid: {
    ...PoolReturnChartOptions.grid,
    padding: {
      // No legend so we need to remove the top padding.
      // This will not shift anything up, just increases the size of the chart to expand vertically.
      top: -15,
    },
  },
};

export const ETHSelfReturnChartOptions: ApexOptions = {
  ...USDSelfReturnChartOptions,
  yaxis: {
    labels: {
      // @ts-ignore
      ...USDSelfReturnChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return smallStringUsdFormatter(value).replace("$", "") + " ETH";
      },
    },
  },
};

export const USDStrategyAllocationChartOptions: ApexOptions = {
  chart: {
    foreColor: "#a19f9f",
    animations: {
      enabled: false,
    },

    toolbar: {
      show: false,
    },
  },

  plotOptions: {
    pie: {
      expandOnClick: false,
      dataLabels: {
        offset: -15,
        minAngleToShowLabel: 20,
      },
    },
  },

  yaxis: {
    labels: {
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return smallStringUsdFormatter(value);
      },
    },
  },

  states: {
    hover: {
      filter: {
        type: "none",
        value: 0,
      },
    },
  },

  legend: {
    fontSize: "10px",
  },

  dataLabels: {
    dropShadow: {
      enabled: false,
    },
  },

  stroke: {
    show: false,
  },

  colors: ["#282828", "#929292", "#5E5E5E", "#4C4C4C", "#343434"],
};

export const ETHStrategyAllocationChartOptions: ApexOptions = {
  ...USDStrategyAllocationChartOptions,
  yaxis: {
    labels: {
      // @ts-ignore
      ...USDStrategyAllocationChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return smallStringUsdFormatter(value).replace("$", "") + " ETH";
      },
    },
  },
};

export const DisableChartInteractions: ApexOptions = {
  tooltip: {
    enabled: false,
  },
};

export const InterestRateChartOptions: ApexOptions = {
  ...LineChartOptions,

  stroke: {
    curve: "straight",
    lineCap: "round",
  },

  grid: {
    ...LineChartOptions.grid,
    padding: {
      top: -50,
    },
  },

  dataLabels: {
    enabled: false,
  },

  legend: {
    show: false,
  },

  tooltip: {
    x: {
      formatter: function (value: number) {
        return parseFloat(value as any).toFixed(2) + "% Utilization";
      },
    },
  },

  yaxis: {
    show: false,
    labels: {
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: number) {
        return parseFloat(value as any).toFixed(2) + "%";
      },
    },
  },

  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return parseFloat(value).toFixed(2) + "%";
      },
    },
  },
};

export const FuseUtilizationChartOptions: ApexOptions = {
  ...InterestRateChartOptions,

  grid: {
    ...LineChartOptions.grid,
  },
};

export const FuseIRMDemoChartOptions: ApexOptions = {
  ...InterestRateChartOptions,

  grid: {
    ...LineChartOptions.grid,
    padding: {
      top: -30,
    },
  },
};

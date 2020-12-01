import { smallStringUsdFormatter } from "./bigUtils";

export const LineChartOptions = {
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

export const PoolReturnChartOptions = {
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
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return "$" + parseFloat(value).toFixed(2);
      },
    },
  },
};

export const USDSelfReturnChartOptions = {
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

export const ETHSelfReturnChartOptions = {
  ...USDSelfReturnChartOptions,
  yaxis: {
    labels: {
      ...USDSelfReturnChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return smallStringUsdFormatter(value).replace("$", "") + " ETH";
      },
    },
  },
};

export const USDStrategyAllocationChartOptions = {
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
      },
    },
  },

  yaxis: {
    labels: {
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

export const ETHStrategyAllocationChartOptions = {
  ...USDStrategyAllocationChartOptions,
  yaxis: {
    labels: {
      ...USDStrategyAllocationChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return smallStringUsdFormatter(value).replace("$", "") + " ETH";
      },
    },
  },
};
export const DisableChartInteractions = {
  tooltip: {
    enabled: false,
  },
};

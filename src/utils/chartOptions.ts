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

export const FundReturnChartOptions = {
  ...LineChartOptions,

  yaxis: {
    labels: {
      ...LineChartOptions.yaxis.labels,
      formatter: function(value: string) {
        return "$" + value;
      },
    },
  },
};

export const SelfReturnChartOptions = {
  ...FundReturnChartOptions,
  grid: {
    ...FundReturnChartOptions.grid,
    padding: {
      // No legend so we need to remove the top padding.
      // This will not shift anything up, just increases the size of the chart.
      top: -10,
    },
  },
};

export const StrategyAllocationChartOptions = {
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

  states: {
    hover: {
      filter: {
        type: "none",
        value: 0,
      },
    },
  },

  dataLabels: {
    dropShadow: {
      enabled: false,
    },
  },

  stroke: {
    show: false,
  },

  colors: ["#4D4D4D", "#aba7a7"],

  labels: ["Compound", "dYdX"],
};

export const DisableChartInteractions = {
  tooltip: {
    enabled: false,
  },
};

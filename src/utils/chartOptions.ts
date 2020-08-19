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
    showForSingleSeries: true,
  },
};

export const FundReturnChartOptions = {
  ...LineChartOptions,

  yaxis: {
    labels: {
      formatter: function(value: string) {
        return "$" + value;
      },
    },
  },
};

export const DisabledFundReturnChartOptions = {
  ...FundReturnChartOptions,

  tooltip: {
    enabled: false,
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

  stroke: {
    show: false,
  },

  colors: ["#4D4D4D", "#aba7a7"],

  labels: ["Compound", "dYdX"],
};

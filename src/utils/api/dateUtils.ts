// Utils
export const formatDDMMYYToDate = (ddMMYY: string): Date => {
  const x = ddMMYY.split("-");
  return new Date([x[1], x[0], x[2]].join("/"))
};

// Formats date into "DD-MM-YYYY"
export const formatDateToDDMMYY = (date: Date) =>
  date.toISOString().split("T")[0].split("-").reverse().join("-");

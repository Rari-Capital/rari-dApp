export function usdFormatter(num: number) {
  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 5,
  });

  return formatter.format(num);
}

export function weiUSDFormatter(num: number) {
  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 5,
  });

  return formatter.format(num / 1e18);
}

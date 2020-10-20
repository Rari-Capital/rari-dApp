const formatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 5,
});

export function stringUsdFormatter(num: string) {
  return formatter.format(parseFloat(num));
}

export function usdFormatter(num: number) {
  return formatter.format(num);
}

export function weiUSDFormatter(num: number) {
  weiUSDFormatter(num / 1e18);
}

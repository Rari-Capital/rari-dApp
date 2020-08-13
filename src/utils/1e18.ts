export function divBy1e18(num: number) {
  return num / 10 ** 18;
}

export function multBy1e18(num: number) {
  return num * 10 ** 18;
}

export function format1e18AsDollars(num: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(divBy1e18(num));
}

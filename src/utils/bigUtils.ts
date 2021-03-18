import Web3 from "web3";

const formatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

const smallFormatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function smallStringUsdFormatter(num: string) {
  return smallFormatter.format(parseFloat(num));
}

export function stringUsdFormatter(num: string) {
  return formatter.format(parseFloat(num));
}

export function smallUsdFormatter(num: number) {
  return smallFormatter.format(num);
}

export function usdFormatter(num: number) {
  return formatter.format(num);
}

const toBN = Web3.utils.toBN;

export type BN = ReturnType<typeof toBN>;

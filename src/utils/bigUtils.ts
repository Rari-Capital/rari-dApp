import Web3 from "web3";

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

const toBN = Web3.utils.toBN;

export type BN = ReturnType<typeof toBN>;

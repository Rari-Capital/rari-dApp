import Web3 from "web3";

export const supportedStablecoins = [
  "DAI",
  "USDC",
  "USDT",
  "TUSD",
  "BUSD",
  "sUSD",
  "mUSD",
] as const;

// This is just a type that is one of the supported stablecoins.
export type SupportedStablecoins = typeof supportedStablecoins[number];

/** Gets the currency code behind a Keccak256 hash of one. */
export function getCurrencyCodeFromKeccak256(
  hash: string
): SupportedStablecoins | null {
  for (const currencyCode of supportedStablecoins) {
    if (Web3.utils.keccak256(currencyCode) === hash) {
      return currencyCode;
    }
  }
  return null;
}

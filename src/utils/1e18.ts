//@ts-ignore
import toFormat from "toformat";
import Big, { BigSource } from "big.js";
toFormat(Big);

/** Divides a Big by 1e18. */
export function divBigBy1e18(num: Big) {
  return num.div(1e18);
}

/** Converts a BigSource into a Big and divides by 1e18. */
export function divBigSourceBy1e18(num: BigSource) {
  return divBigBy1e18(Big(num));
}

/** Multiplies a Big by 1e18. */
export function multBigBy1e18(num: Big) {
  return num.mul(1e18);
}

/** Converts a BigSource into a Big and multiplies by 1e18. */
export function multBigSourceBy1e18(num: BigSource) {
  return multBigBy1e18(Big(num));
}

/** Formats a Big with two decimals */
export function formatBig(num: Big) {
  //@ts-ignore
  return num.toFormat(2);
}

/** Converts a BigSource to a Big and formats it. */
export function formatBigSource(num: BigSource) {
  return formatBig(Big(num));
}

/** Formats a Big and prepends a "$". */
export function formatBigAsUSD(num: Big) {
  return "$" + formatBig(num);
}

/** Converts a BigSource to a Big and formats it and prepends a "$". */
export function formatBigSourceAsUSD(num: BigSource) {
  return formatBigAsUSD(Big(num));
}

/** Divides a Big by 1e18 and formats it and prepends a "$". */
export function format1e18BigAsUSD(num: Big) {
  return formatBigAsUSD(divBigBy1e18(num));
}

/** Converts a BigSource to Big and divides itby 1e18 and formats it and prepends a "$". */
export function format1e18BigSourceAsUSD(num: BigSource) {
  return formatBigAsUSD(divBigBy1e18(Big(num)));
}

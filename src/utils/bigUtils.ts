//@ts-ignore
import toFormat from "toformat";
import Big, { BigSource } from "big.js";
toFormat(Big);

/** Creates a Big. */
export function toBig(num: BigSource) {
  return Big(num);
}

/** Divides a Big by 1e18. */
export function divBigBy1e18(num: Big) {
  return num.div(1e18);
}

/** Multiplies a Big by 1e18. */
export function multBigBy1e18(num: Big) {
  return num.mul(1e18);
}

/** Formats a Big with two decimals */
export function formatBig(num: Big) {
  //@ts-ignore
  return num.toFormat(2);
}

/** Divides a Big by 1e18 and formats it. */
export function format1e18Big(num: Big) {
  return formatBig(divBigBy1e18(num));
}

/** Divides a Big by 1e18 and divides it by 1e18, formats it and prepends a "$". */
export function format1e18BigAsUSD(num: Big) {
  return "$" + format1e18Big(num);
}

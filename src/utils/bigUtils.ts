import Web3 from "web3";

// @ts-ignore
var BN = Web3.utils.BN;

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

const zero = new BN(0);
const negative1 = new BN(-1);

export function to1eX(numberInput: number, decimals: number) {
  let stringNumber = String(numberInput);
  const base = new BN(10 * decimals, 10);
  const baseLength = (10 * decimals).toString().length - 1 || 1;

  // Is it negative?
  var negative = stringNumber.substring(0, 1) === "-"; // eslint-disable-line
  if (negative) {
    stringNumber = stringNumber.substring(1);
  }

  if (stringNumber === ".") {
    throw new Error(
      `[ethjs-unit] while converting number ${stringNumber} to to1eX, invalid value`
    );
  }

  // Split it into a whole and fractional part
  var comps = stringNumber.split("."); // eslint-disable-line
  if (comps.length > 2) {
    throw new Error(
      `[ethjs-unit] while converting number ${stringNumber} to1eX, too many decimal points`
    );
  }

  var whole = comps[0],
    fraction = comps[1]; // eslint-disable-line

  if (!whole) {
    whole = "0";
  }
  if (!fraction) {
    fraction = "0";
  }
  if (fraction.length > baseLength) {
    throw new Error(
      `[ethjs-unit] while converting number ${stringNumber} to1eX, too many decimal places`
    );
  }

  while (fraction.length < baseLength) {
    fraction += "0";
  }

  whole = new BN(whole);
  fraction = new BN(fraction);
  //@ts-ignore
  var wei = whole.mul(base).add(fraction);

  if (negative) {
    wei = wei.mul(negative1);
  }

  //@ts-ignore
  return new BN(wei.toString(10), 10);
}

export function from1eX(
  largeInput: number | string | object,
  decimals: number
) {
  //@ts-ignore
  var wei = Web3.utils.isBN(largeInput)
    ? (largeInput as any)
    : //@ts-ignore
      Web3.utils.toBN(largeInput); // eslint-disable-line

  var negative = wei.lt(zero); // eslint-disable-line
  const base = new BN(10 * decimals, 10);
  const baseLength = (10 * decimals).toString().length - 1 || 1;

  if (negative) {
    wei = wei.mul(negative1);
  }

  var fraction = wei.mod(base).toString(10); // eslint-disable-line

  while (fraction.length < baseLength) {
    fraction = `0${fraction}`;
  }

  var whole = wei.div(base).toString(10); // eslint-disable-line

  var value = `${whole}${fraction == "0" ? "" : `.${fraction}`}`; // eslint-disable-line

  if (negative) {
    value = `-${value}`;
  }

  return value;
}

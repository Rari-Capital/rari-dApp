export function shortAddress(address: string) {
  return "0x..." + address.substring(address.length - 2, address.length);
}

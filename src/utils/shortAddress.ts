export function shortAddress(address: string) {
  return (
    address.substring(0, 4) +
    "..." +
    address.substring(address.length - 4, address.length)
  );
}

export function mediumAddress(address: string) {
  return (
    address.substring(0, 9) +
    "..." +
    address.substring(address.length - 8, address.length)
  );
}

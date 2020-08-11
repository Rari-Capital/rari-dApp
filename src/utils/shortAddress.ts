export function shortAddress(address: string) {
  return (
    address.substring(0, 3) +
    "..." +
    address.substring(address.length - 3, address.length)
  );
}

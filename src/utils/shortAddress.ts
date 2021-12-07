export function shortAddress(address: string) {
  return (
    address.substring(0, 4) +
    "..." +
    address.substring(address.length - 2, address.length)
  );
}

export function shortEnsName(name: string) {
  return (
    name.substring(0, 3) + "..." + name.substring(name.length - 3, name.length)
  );
}

export function mediumAddress(address: string) {
  return (
    address.substring(0, 8) +
    "..." +
    address.substring(address.length - 8, address.length)
  );
}

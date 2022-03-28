export function shortENS(address: string | null | undefined) {
  return address?.substring(0, 7) + "...";
}

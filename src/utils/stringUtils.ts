export function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}

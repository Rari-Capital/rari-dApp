// Return elements of array a that are also in b in linear time:
export function intersect(a: any[], b: any[]) {
  return a.filter(Set.prototype.has, new Set(b));
}

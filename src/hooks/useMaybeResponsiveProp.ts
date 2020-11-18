import { useIsMobile } from "buttered-chakra";

export function useMaybeResponsiveProp<T, A>(
  data: { md: T; base: A } | string
) {
  const mobile = useIsMobile();

  if (typeof data === "object") {
    if (mobile) {
      return data.base;
    } else {
      return data.md;
    }
  } else {
    return data;
  }
}

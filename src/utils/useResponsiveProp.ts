import { useIsMobile } from "buttered-chakra";

export function useResponsiveProp<T, A>(data: { md: T; xs: A } | string) {
  const mobile = useIsMobile();

  if (typeof data === "object") {
    if (mobile) {
      return data.xs;
    } else {
      return data.md;
    }
  } else {
    return data;
  }
}

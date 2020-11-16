import { useBreakpointValue } from "@chakra-ui/react";

export function useMaybeResponsiveProp<T, A>(
  data: { md: T; base: A } | string
) {
  const isResponsive = typeof data === "object";

  const staticBreakpoint = useBreakpointValue(
    isResponsive ? (data as any) : { md: "10px", xs: "10px" }
  );

  return isResponsive ? staticBreakpoint : data;
}

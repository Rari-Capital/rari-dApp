import { useWindowSize } from "lib/chakraUtils";

export const useIsSmallScreen = () => {
  const { width } = useWindowSize();
  return width < 1030;
};

import { useWindowSize } from "utils/chakraUtils";

export const useIsSmallScreen = () => {
  const { width } = useWindowSize();
  return width < 1030;
};

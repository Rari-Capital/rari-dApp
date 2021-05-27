import { useWindowSize } from "utils/buttered-chakra";

export const useIsSmallScreen = () => {
  const { width } = useWindowSize();
  return width < 1030;
};

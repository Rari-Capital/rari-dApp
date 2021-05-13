import { useWindowSize } from "buttered-chakra";

export const useIsSmallScreen = () => {
  const { width } = useWindowSize();
  return width < 1030;
};

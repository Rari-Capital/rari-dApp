import { useWindowSize } from "utils/buttered-chakra";

export const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};

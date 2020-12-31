import { useWindowSize } from "buttered-chakra";

export const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};

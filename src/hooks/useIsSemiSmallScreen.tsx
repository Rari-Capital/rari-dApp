import { useWindowSize } from "lib/chakraUtils";

export const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};

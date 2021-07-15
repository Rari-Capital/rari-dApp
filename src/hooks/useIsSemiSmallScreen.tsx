import { useWindowSize } from "utils/chakraUtils";

export const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};

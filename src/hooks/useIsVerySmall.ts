import { useWindowSize } from "lib/chakraUtils";

export const useIsVerySmall = () => {
  const { width } = useWindowSize();

  return (width < 800);
};

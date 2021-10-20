import { useWindowSize } from "lib/chakraUtils";

export const useIsVeryVerySmall = () => {
  const { width } = useWindowSize();

  return (width < 550);
};

import { useWindowSize } from "lib/chakraUtils";

export const useIsNotBigScreen = () => {
  const { width } = useWindowSize();

  return (width < 1500 &&  width > 1180);
};

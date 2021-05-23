/* istanbul ignore file */
import { useEffect, useState } from "react";
import { Spinner, Text } from "@chakra-ui/react";

const FullPageSpinner = () => {
  const [isText, setIsText] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsText(false), 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [setIsText]);

  return isText ? (
    <Text
      data-testid="full-page-spinner"
      color="#FFF"
      fontSize="xl"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        marginTop: "-15px",
        marginLeft: "-45px",
      }}
    >
      Loading...
    </Text>
  ) : (
    <Spinner
      data-testid="full-page-spinner"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        marginTop: "-1.5rem",
        marginLeft: "-1.5rem",
      }}
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="#121212"
      size="xl"
    />
  );
};

export default FullPageSpinner;

/* istanbul ignore file */
import React, { useEffect, useState } from "react";
import { Spinner, Text, theme } from "@chakra-ui/core";

const FullPageSpinner = React.memo(() => {
  const [isText, setIsText] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsText(false), 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [setIsText]);

  return isText ? (
    <Text
      color="#FFF"
      fontSize="xl"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        marginTop: "-1.5rem",
        marginLeft: "-1.5rem",
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
});

export default FullPageSpinner;

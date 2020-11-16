import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";

import FullPageSpinner from "./FullPageSpinner";

test("renders spinner", async () => {
  render(
    <ChakraProvider>
      <FullPageSpinner />
    </ChakraProvider>
  );

  expect(screen.getByTestId("full-page-spinner")).toBeInTheDocument();
});

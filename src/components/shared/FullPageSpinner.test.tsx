import React from "react";
import { ThemeProvider } from "@chakra-ui/core";
import { render, screen } from "@testing-library/react";

import FullPageSpinner from "./FullPageSpinner";

test("renders spinner", async () => {
  render(
    <ThemeProvider>
      <FullPageSpinner />
    </ThemeProvider>
  );

  expect(screen.getByTestId("full-page-spinner")).toBeInTheDocument();
});

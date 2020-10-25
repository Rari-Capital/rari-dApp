import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";

import { Route, Routes } from "react-router-dom";

import { Heading } from "@chakra-ui/core";

const MultiPoolPortal = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/MultiPoolPortal"),
  {
    fallback: <FullPageSpinner />,
  }
);

const PageNotFound = React.memo(() => {
  return (
    <Heading
      color="#FFF"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        marginTop: "-15px",
        marginLeft: "-114px",
      }}
    >
      404: Not Found
    </Heading>
  );
});

const App = React.memo(() => {
  return (
    <Routes>
      <Route path="/" element={<MultiPoolPortal />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
});

export default App;

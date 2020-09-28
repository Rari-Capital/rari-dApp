import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";

import { Route, Routes } from "react-router-dom";

const PoolPortal = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/PoolPortal"),
  {
    fallback: <FullPageSpinner />,
  }
);

const PreviewPortal = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/PreviewPortal"),
  {
    fallback: <FullPageSpinner />,
  }
);

const App = React.memo(() => {
  return (
    <Routes>
      <Route path="/stable" element={<PoolPortal />} />
      <Route path="/" element={<PreviewPortal />} />
    </Routes>
  );
});

export default App;

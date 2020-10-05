import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";

import { Outlet, Route, Routes } from "react-router-dom";

import { Heading } from "@chakra-ui/core";

const MultiPoolPortal = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/MultiPoolPortal"),
  {
    fallback: <FullPageSpinner />,
  }
);

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

export enum Pool {
  STABLE = "stable",
  YIELD = "yield",
  ETH = "eth",
}

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
      <Route path="/pools" element={<Outlet />}>
        {Object.values(Pool).map((pool: string) => {
          return <Route key={pool} path={pool} element={<PoolPortal />} />;
        })}

        <Route path="/" element={<MultiPoolPortal />} />
      </Route>

      <Route path="/" element={<PreviewPortal />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
});

export default App;

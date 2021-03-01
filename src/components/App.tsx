import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";

import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { Heading } from "@chakra-ui/react";
import { Pool } from "../context/PoolContext";

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

const TranchesPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Tranches/TranchesPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const FusePoolsPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolsPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const FusePoolPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const FusePoolInfoPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolInfoPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const FusePoolEditPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolEditPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const FusePoolCreatePage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolCreatePage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const RSSAssetsPage = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/RSSAssetsPage"),
  {
    fallback: <FullPageSpinner />,
  }
);

const Pool2Page = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/Pool2/Pool2Page"),
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
      <Route path="/pools" element={<Outlet />}>
        {Object.values(Pool).map((pool) => {
          return (
            <Route
              key={pool}
              path={pool}
              element={<PoolPortal pool={pool} />}
            />
          );
        })}

        <Route path="/" element={<Navigate to="/" replace={true} />} />
      </Route>

      <Route path="/rss" element={<Outlet />}>
        <Route path="/assets" element={<RSSAssetsPage />} />
      </Route>

      <Route path="/tranches" element={<TranchesPage />} />

      <Route path="/pool2" element={<Pool2Page />} />

      <Route path="/fuse" element={<FusePoolsPage />} />
      <Route path="/fuse/new-pool" element={<FusePoolCreatePage />} />
      <Route path="/fuse/pool/:poolId" element={<FusePoolPage />} />
      <Route path="/fuse/pool/:poolId/info" element={<FusePoolInfoPage />} />
      <Route path="/fuse/pool/:poolId/edit" element={<FusePoolEditPage />} />

      <Route path="/" element={<MultiPoolPortal />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
});

export default App;

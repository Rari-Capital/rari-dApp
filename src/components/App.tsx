import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";

const UserPortal = loadable(
  () => import(/* webpackPrefetch: true */ "./pages/UserPortal"),
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

export default function App() {
  if (false) {
    return <UserPortal />;
  } else {
    return <PreviewPortal />;
  }
}

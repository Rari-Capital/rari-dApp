import React from "react";

import loadable from "@loadable/component";

import FullPageSpinner from "./shared/FullPageSpinner";
import { useWeb3 } from "../context/Web3Context";

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
  const { isAuthed } = useWeb3();

  if (isAuthed) {
    return <UserPortal />;
  } else {
    return <PreviewPortal />;
  }
}

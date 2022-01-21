//@ts-nocheck

import { Column } from "utils/chakraUtils";
import CountdownBanner from "./CountdownBanner";
// import Footer from "./Footer";

const Layout = ({ children }: { children: any }) => {
  return (
    <Column height="100%" flex={1}>
      <CountdownBanner />
      {children}
    </Column>
  );
};

export default Layout;

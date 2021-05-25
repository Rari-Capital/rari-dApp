//@ts-nocheck

import { Column } from "buttered-chakra";
import NewHeader from "../Header2/NewHeader2";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <Column height="100%" flex={1}>
      <NewHeader />
      {children}
      <Footer />
    </Column>
  );
};

export default Layout;

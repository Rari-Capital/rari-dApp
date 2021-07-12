//@ts-nocheck

import { Column } from "utils/chakraUtils";
import NewHeader from "../Header2/NewHeader2";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <Column
      height="100%"
      flex={1}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
    >
      <NewHeader />
      {children}
      <Footer />
    </Column>
  );
};

export default Layout;

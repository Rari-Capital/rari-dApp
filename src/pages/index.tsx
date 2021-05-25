import { Heading } from "@chakra-ui/layout";
import { NextPage } from "next";
import AppLink from "components/shared/AppLink";
import Home from "components/pages/Home/Home";

const IndexPage: NextPage = () => {
  return (
    <>
      <Home />
    </>
  );
};

export default IndexPage;

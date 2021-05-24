import { Heading } from "@chakra-ui/layout";
import { NextPage } from "next";
import AppLink from "components/shared/AppLink";

const IndexPage: NextPage = () => {
  return (
    <>
      <Heading>Home</Heading>
      <AppLink href="/about">About</AppLink>
    </>
  );
};

export default IndexPage;

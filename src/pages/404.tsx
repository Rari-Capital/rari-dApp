import { Heading } from "@chakra-ui/react";
import AppLink from "components/shared/AppLink";
import { Column } from "lib/chakraUtils";
import { NextPage } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const IndexPage: NextPage = () => {
  return (
    <>
      <Column
        w="100%"
        h="70vh"
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        mx={5}
        my={5}
      >
        <Heading color="white">404: Not Found</Heading>
        <AppLink href="/" mt={4} color="grey">Go back home</AppLink>
      </Column>
    </>
  );
};

export default IndexPage;

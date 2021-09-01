import { Heading } from "@chakra-ui/react";
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
        h="100%"
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        mx={5}
        my={5}
      >
        <Heading color="white">404: Not Found</Heading>
      </Column>
    </>
  );
};

export default IndexPage;

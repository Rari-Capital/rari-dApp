import { Heading } from "@chakra-ui/react";
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
      <Heading color="white">404: Not Found</Heading>
    </>
  );
};

export default IndexPage;

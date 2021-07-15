import { NextPage } from "next";
import Home from "components/pages/Home/Home";

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
      <Home />
    </>
  );
};

export default IndexPage;

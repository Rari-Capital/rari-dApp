import { NextPage } from "next";
import Pool2Page from "components/pages/Pool2/Pool2Page";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const Pool2: NextPage = () => {
  return (
    <>
      <Pool2Page />
    </>
  );
};

export default Pool2;

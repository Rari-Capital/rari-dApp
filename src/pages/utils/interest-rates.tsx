import { NextPage } from "next";
import InterestRates from "components/pages/InterestRates/InterestRates";

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
      <InterestRates />
    </>
  );
};

export default Pool2;

import { NextPage } from "next";
import MultiPoolPortal from "components/pages/MultiPoolPortal";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const OverviewPage: NextPage = () => {
  return (
    <>
      <MultiPoolPortal />
    </>
  );
};

export default OverviewPage;

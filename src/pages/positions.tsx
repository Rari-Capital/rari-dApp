import { NextPage } from "next";
import PositionsPage from "components/pages/Stats/StatsPage";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const Positions: NextPage = () => {
  return (
    <>
      <PositionsPage />
    </>
  );
};

export default Positions;

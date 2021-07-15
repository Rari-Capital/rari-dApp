import { NextPage } from "next";
import TranchesPage from "components/pages/Tranches/TranchesPage";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const Tranches: NextPage = () => {
  return (
    <>
      <TranchesPage />
    </>
  );
};

export default Tranches;

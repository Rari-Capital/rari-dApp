import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import TranchesPage from "components/pages/Tranches/TranchesPage";

const Tranches: NextPage = () => {
  return (
    <>
      <TranchesPage />
    </>
  );
};

export default Tranches;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!)),
      // Will be passed to the page component as props
    },
  };
};
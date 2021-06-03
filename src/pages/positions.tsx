import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import PositionsPage from "components/pages/Stats/StatsPage";

const Positions: NextPage = () => {
  return (
    <>
      <PositionsPage />
    </>
  );
};

export default Positions;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!)),
      // Will be passed to the page component as props
    },
  };
};
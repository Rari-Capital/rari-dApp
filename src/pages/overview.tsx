import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import MultiPoolPortal from "components/pages/MultiPoolPortal";

const OverviewPage: NextPage = () => {
  return (
    <>
      <MultiPoolPortal />
    </>
  );
};

export default OverviewPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!)),
      // Will be passed to the page component as props
    },
  };
};
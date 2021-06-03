import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import Pool2Page from "components/pages/Pool2/Pool2Page";

const Pool2: NextPage = () => {
  return (
    <>
      <Pool2Page />
    </>
  );
};

export default Pool2;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!)),
      // Will be passed to the page component as props
    },
  };
};
import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import Home from "components/pages/Home/Home";

const IndexPage: NextPage = () => {
  return (
    <>
      <Home />
    </>
  );
};

export default IndexPage;


export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!)),
      // Will be passed to the page component as props
    },
  };
};
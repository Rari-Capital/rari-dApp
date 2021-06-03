import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import FuseLiquidationsPage from "components/pages/Fuse/FuseLiquidationsPage";


const FusePage: NextPage = () => {
    return (
        <FuseLiquidationsPage />
    )
}

export default FusePage


export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
      props: {
        ...(await serverSideTranslations(locale!)),
        // Will be passed to the page component as props
      },
    };
  };
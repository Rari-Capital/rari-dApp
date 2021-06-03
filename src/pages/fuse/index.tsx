import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import FusePoolsPage from "components/pages/Fuse/FusePoolsPage";

const FusePage: NextPage = () => {
    return (
        <FusePoolsPage />
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
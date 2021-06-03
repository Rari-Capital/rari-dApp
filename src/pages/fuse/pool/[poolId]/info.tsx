import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import FusePoolInfo from "components/pages/Fuse/FusePoolInfoPage";

const FusePoolInfoPage: NextPage = () => {
    return (
        <FusePoolInfo />
    )
}

export default FusePoolInfoPage

export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
      props: {
        ...(await serverSideTranslations(locale!)),
        // Will be passed to the page component as props
      },
    };
  };
import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import FusePoolpage from "components/pages/Fuse/FusePoolPage";

const FusePage: NextPage = () => {
    return (
        <FusePoolpage />
    )
}

export default FusePage

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
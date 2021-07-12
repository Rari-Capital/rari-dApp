import { NextPage } from "next";

// Components
import FusePoolInfo from "components/pages/Fuse/FusePoolInfoPage";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

export const getStaticPaths = async () => {
    return {
      paths: [],
      fallback: "blocking",
    };
  };

const FusePoolInfoPage: NextPage = () => {
    return (
        <FusePoolInfo />
    )
}

export default FusePoolInfoPage

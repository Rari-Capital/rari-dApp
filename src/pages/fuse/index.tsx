import { NextPage } from "next";
import FusePoolsPage from "components/pages/Fuse/FusePoolsPage/FusePoolsPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const FusePage: NextPage = () => {
  return <FusePoolsPage />;
};

export default FusePage;

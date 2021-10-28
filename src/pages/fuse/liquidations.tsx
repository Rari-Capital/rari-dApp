import { NextPage } from "next";
import FuseLiquidationsPage from "components/pages/Fuse/FuseLiquidationsPage";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}


const FusePage: NextPage = () => {
    return (
        <FuseLiquidationsPage />
    )
}

export default FusePage

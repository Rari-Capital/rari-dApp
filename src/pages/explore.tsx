import ExplorePage from "components/pages/ExplorePage/ExplorePage";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const Explore = () => {
  return <ExplorePage />;
};

export default Explore;

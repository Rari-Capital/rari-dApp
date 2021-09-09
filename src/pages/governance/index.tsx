import { NextPage } from "next";
import GovernanceDashPage from "components/pages/GovernanceDash/GovernanceDash";



import { serverSideTranslations } from "next-i18next/serverSideTranslations";


export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}




const GovernanceDash : NextPage = () => {
  //console.log("in govdash under page")
  return (
    <>
      <GovernanceDashPage />
    </>
  );
};

export default GovernanceDash;

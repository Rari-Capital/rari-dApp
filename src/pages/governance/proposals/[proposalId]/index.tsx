import { NextPage } from "next";
import { useRouter } from 'next/router'
import ProposalPortal from "components/pages/GovernanceDash/ProposalPortal";

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

const ProposalPage: NextPage = () => {
  const router = useRouter()
  const { proposalId } = router.query



  return (
    <ProposalPortal proposalId={proposalId} />
  )
};


export default ProposalPage
